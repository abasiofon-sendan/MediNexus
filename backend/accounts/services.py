from django.core.mail import EmailMultiAlternatives
import resend
from django.conf import settings
from django.template.loader import render_to_string

import logging
import random
import string
import base64

import requests
from decouple import config
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# Interswitch API Configuration
INTERSWITCH_OAUTH_URL = config('INTERSWITCH_OAUTH_URL', default='https://passport-v2.k8.isw.la/passport/oauth/token')
INTERSWITCH_NIN_VERIFY_URL = config('INTERSWITCH_NIN_VERIFY_URL', default='https://api-marketplace-routing.k8.isw.la/marketplace-routing/api/v1/verify/identity/nin/verify')
INTERSWITCH_USERNAME = config('INTERSWITCH_USERNAME', default='IKIA058B013BCC6AA706CE0D00708D4C334C2EDE27F2')
INTERSWITCH_PASSWORD = config('INTERSWITCH_PASSWORD', default='F848D0B461F46ECAC0A9565BBD479C08E074B0EB')
INTERSWITCH_BASIC_AUTH = config('INTERSWITCH_BASIC_AUTH', default='SUtJQUM0QkRDQTVEQjY2NzhDMjRCMUQzRDRCRkJFMUU2OEE5OUU1OTdBMEI6MUEwMjgzQzU0OTlGNjJCODJGMzEyNDg4NUU4QUVBMjNGMUM0MTg4Mg==')
INTERSWITCH_MOCK = config('INTERSWITCH_MOCK', default=False, cast=bool)


MOCK_NIN_DB = {
    '12345678901': {
        'nin': '12345678901',
        'firstName': 'Test',
        'lastName': 'User',
        'dateOfBirth': '1990-01-01',
        'gender': 'M',
        'phoneNumber': '08012345678',
    },
    '10000000001': {
        'nin': '10000000001',
        'firstName': 'John',
        'lastName': 'Doe',
        'dateOfBirth': '1985-06-15',
        'gender': 'M',
        'phoneNumber': '08098765432',
    },
    '10000000002': {
        'nin': '10000000002',
        'firstName': 'Jane',
        'lastName': 'Doe',
        'dateOfBirth': '1992-03-22',
        'gender': 'F',
        'phoneNumber': '08011223344',
    },
}




def generate_otp(length: int = 6) -> str:
    """Generate a random numeric OTP code."""
    return ''.join(random.choices(string.digits, k=length))




def get_interswitch_token() -> str:
    """Obtain an OAuth2 access token from Interswitch using client credentials."""
    try:
        logger.info('Requesting access token from Interswitch OAuth endpoint: %s', INTERSWITCH_OAUTH_URL)
        
        # Dynamically generate Basic Auth string using the current credentials
        auth_string = f"{INTERSWITCH_USERNAME}:{INTERSWITCH_PASSWORD}"
        base64_auth = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': f'Basic {base64_auth}',
        }
        
        data = {
            'scope': 'profile',
            'grant_type': 'client_credentials',
        }
        
        response = requests.post(
            INTERSWITCH_OAUTH_URL,
            data=data,
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        
        token_response = response.json()
        access_token = token_response.get('access_token')
        
        if not access_token:
            logger.error('No access token in OAuth response: %s', token_response)
            raise ValueError('No access token returned from Interswitch OAuth endpoint')
        
        logger.info('Successfully obtained access token from Interswitch')
        logger.info('Access Token (first 50 chars): %s...', access_token[:50])
        logger.info('Full token response: %s', token_response)
        logger.debug('OAuth response: %s', token_response)
        return access_token
        
    except requests.RequestException as exc:
        logger.error('Interswitch OAuth request failed: %s', exc)
        raise ValueError(f'Failed to obtain Interswitch access token: {exc}') from exc
    except (KeyError, ValueError) as exc:
        logger.error('Error parsing Interswitch OAuth response: %s', exc)
        raise




def send_otp_email(email: str) -> dict:
    from .models import OTPToken

    code = generate_otp()
    OTPToken.objects.create(email=email.lower(), code=code)

    subject = 'Your MediNexus Verification Code'
    from_email = settings.DEFAULT_FROM_EMAIL
    
    # Render the HTML template
    html_content = render_to_string('verify_email.html', {
        'verification_code': code
    })
    
    # Plain text fallback
    text_content = (
        f'Your MediNexus OTP is: {code}\n\n'
        f'This code expires in {OTPToken.OTP_LIFETIME_MINUTES} minutes.\n'
        f'Do not share it with anyone.'
    )

    try:
        # Create email with both HTML and text versions
        email_message = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[email]
        )
        email_message.attach_alternative(html_content, "text/html")
        email_message.send(fail_silently=False)
        
        logger.info('OTP email sent to %s', email)
        return {'sent': True}
    except Exception as exc:  # noqa: BLE001
        logger.error('Failed to send OTP email to %s: %s', email, exc)
        return {'sent': False, 'error': str(exc)}


def verify_otp_email(email: str, otp_code: str) -> dict:

    from .models import OTPToken

    token = (
        OTPToken.objects
        .filter(email=email.lower(), is_used=False)
        .order_by('-created_at')
        .first()
    )

    if token is None:
        return {'verified': False, 'error': 'No OTP found for this email. Please request a new one.'}

    if timezone.now() >= token.expires_at:
        return {'verified': False, 'error': 'OTP has expired. Please request a new one.'}

    if token.code != otp_code:
        return {'verified': False, 'error': 'Invalid OTP code.'}

    token.is_used = True
    token.save(update_fields=['is_used'])
    logger.info('OTP verified for %s', email)
    return {'verified': True}



def names_match(submitted: str, from_nin: str) -> bool:
    return submitted.strip().lower() == from_nin.strip().lower()


def verify_nin(nin: str, user_data: dict) -> dict:
    """
    Verify a Nigerian NIN via the Interswitch Identity API and cross-check
    the returned data against the user's submitted details.

    Args:
        nin:       11-digit NIN string.
        user_data: dict with keys 'first_name', 'last_name' (required) and
                   optionally 'date_of_birth' (YYYY-MM-DD string).

    Returns:
        {'verified': True,  'data': {...}}   on success
        {'verified': False, 'error': '...'}  on failure
    """
    if INTERSWITCH_MOCK:
        logger.info('[MOCK] NIN verification called for NIN: %s', nin)

        if not (len(nin) == 11 and nin.isdigit()):
            return {'verified': False, 'error': 'NIN must be exactly 11 digits.'}

        nin_record = MOCK_NIN_DB.get(nin)
        if nin_record is None:
            return {
                'verified': False,
                'error': (
                    'NIN not found. During testing use one of the mock NINs: '
                    + ', '.join(MOCK_NIN_DB.keys())
                ),
            }

        return cross_check(nin_record, user_data)

    # Live mode
    try:
        logger.info('Starting NIN verification for NIN: %s', nin)
        
        # Step 1: Authenticate with Interswitch and get access token
        logger.info('Step 1: Authenticating with Interswitch...')
        access_token = get_interswitch_token()
        logger.info('Step 1: Successfully obtained access token')
        
        # Step 2: Verify NIN using the access token
        logger.info('Step 2: Verifying NIN against Interswitch API...')
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
        
        payload = {
            'id': nin,
        }
        
        logger.info('Sending NIN verification request to: %s', INTERSWITCH_NIN_VERIFY_URL)
        logger.info('Request payload: %s', payload)
        logger.info('Authorization header (first 50 chars): Bearer %s...', access_token[:50])
        response = requests.post(
            INTERSWITCH_NIN_VERIFY_URL,
            json=payload,
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        
        nin_record = response.json()
        logger.info('Step 2: NIN verification successful')
        logger.info('Step 3: Cross-checking submitted data with NIN record...')
        
        return cross_check(nin_record, user_data)
        
    except requests.exceptions.RequestException as exc:
        logger.error('NIN verification API error: %s', exc)
        if hasattr(exc, 'response') and exc.response is not None:
            try:
                error_detail = exc.response.json()
                logger.error('API error response: %s', error_detail)
                return {'verified': False, 'error': f"NIN verification failed: {error_detail.get('message', str(exc))}"}
            except Exception:
                pass
        return {'verified': False, 'error': f'NIN verification service error: {exc}'}
    except ValueError as exc:
        logger.error('NIN verification error (token acquisition): %s', exc)
        return {'verified': False, 'error': str(exc)}


def get_nin_full_details(nin: str, access_token: str) -> dict:
    """
    Fetch full NIN details from Interswitch Identity API using provided access token.
    
    Args:
        nin: 11-digit NIN string.
        access_token: OAuth2 access token from Interswitch authentication.
    
    Returns:
        {'success': True, 'data': {...}} on success
        {'success': False, 'error': '...'} on failure
    """
    if INTERSWITCH_MOCK:
        logger.info('[MOCK] NIN full details requested for NIN: %s', nin)
        
        if not (len(nin) == 11 and nin.isdigit()):
            return {'success': False, 'error': 'NIN must be exactly 11 digits.'}
        
        nin_record = MOCK_NIN_DB.get(nin)
        if nin_record is None:
            return {
                'success': False,
                'error': (
                    'NIN not found. During testing use one of the mock NINs: '
                    + ', '.join(MOCK_NIN_DB.keys())
                ),
            }
        
        return {'success': True, 'data': nin_record}
    
    # Live mode
    try:
        logger.info('Fetching full NIN details for NIN: %s', nin)
        
        # Use provided access token
        logger.info('Using provided access token for NIN details request')
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
        
        payload = {
            'id': nin,
        }
        
        logger.info('Sending NIN details request to: %s', INTERSWITCH_NIN_VERIFY_URL)
        logger.info('Request payload: %s', payload)
        response = requests.post(
            INTERSWITCH_NIN_VERIFY_URL,
            json=payload,
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        
        nin_record = response.json()
        logger.info('Full NIN details retrieved successfully')
        
        return {'success': True, 'data': nin_record}
        
    except requests.exceptions.RequestException as exc:
        logger.error('NIN details API error: %s', exc)
        if hasattr(exc, 'response') and exc.response is not None:
            try:
                error_detail = exc.response.json()
                logger.error('API error response: %s', error_detail)
                return {'success': False, 'error': f"Failed to fetch NIN details: {error_detail.get('message', str(exc))}"}
            except Exception:
                pass
        return {'success': False, 'error': f'NIN details service error: {exc}'}
    except ValueError as exc:
        logger.error('NIN details error: %s', exc)
        return {'success': False, 'error': str(exc)}


def cross_check(nin_record: dict, user_data: dict) -> dict:
    # The new API returns full details in the response
    # We can validate if the names match if names are returned
    if 'firstName' in nin_record and 'lastName' in nin_record:
        submitted_first = user_data.get('first_name', '')
        submitted_last = user_data.get('last_name', '')
        nin_first = nin_record.get('firstName', '')
        nin_last = nin_record.get('lastName', '')

        errors = []
        if not names_match(submitted_first, nin_first):
            errors.append(
                f"First name '{submitted_first}' does not match NIN records."
            )
        if not names_match(submitted_last, nin_last):
            errors.append(
                f"Last name '{submitted_last}' does not match NIN records."
            )

        if errors:
            return {'verified': False, 'error': ' '.join(errors)}

    return {'verified': True, 'data': nin_record}
