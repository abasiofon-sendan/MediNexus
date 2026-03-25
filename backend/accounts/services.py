from django.core.mail import EmailMultiAlternatives
import resend
from django.conf import settings
from django.template.loader import render_to_string

import logging
import random
import string

import requests
from decouple import config
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

INTERSWITCH_BASE_URL = config('INTERSWITCH_BASE_URL', default='https://sandbox.interswitchng.com')
INTERSWITCH_CLIENT_ID = config('INTERSWITCH_CLIENT_ID', default='')
INTERSWITCH_CLIENT_SECRET = config('INTERSWITCH_CLIENT_SECRET', default='')
INTERSWITCH_MOCK = config('INTERSWITCH_MOCK', default=True, cast=bool)


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
    """Obtain an OAuth2 access token from Interswitch."""
    url = f'{INTERSWITCH_BASE_URL}/passport/oauth/token'
    response = requests.post(
        url,
        data={'grant_type': 'client_credentials'},
        auth=(INTERSWITCH_CLIENT_ID, INTERSWITCH_CLIENT_SECRET),
        timeout=10,
    )
    response.raise_for_status()
    return response.json()['access_token']




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
        token = get_interswitch_token()
        url = f'{INTERSWITCH_BASE_URL}/api/v3/identity/nin/verify'
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        }
        response = requests.post(url, json={'nin': nin}, headers=headers, timeout=15)
        response.raise_for_status()
        nin_record = response.json()
        return cross_check(nin_record, user_data)
    except requests.RequestException as exc:
        logger.error('NIN verification API error: %s', exc)
        return {'verified': False, 'error': f'NIN verification service error: {exc}'}


def cross_check(nin_record: dict, user_data: dict) -> dict:
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
