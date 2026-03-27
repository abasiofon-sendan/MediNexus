"""
Django settings for medinexus project.
"""
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url
# from decouple import os.environ.get

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-ek&x7+mw@uhkgl+n!(d*mfin(qz+5k%j3o7x&jozd%(spmdq=t'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True


import os
import dotenv

dotenv.load_dotenv()
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', default='*').split(',')


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'anymail',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',

    # Local apps
    'accounts',
    'patients',
    'providers',
    'records',
    'audit',
    'consents',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'medinexus.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'medinexus.wsgi.application'

# # Database
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }
DATABASE_URL = os.environ.get('DATABASE_URL')
DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
}

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Lagos'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'MediNexus API',
    'DESCRIPTION': (
        'MediNexus is a secure Electronic Health Records (EHR) platform that '
        'enables patients to own and share their medical records with healthcare '
        'providers.\n\n'
        '## Key Features:\n'
        '- **Patient Registration**: NIN verification via Interswitch Identity API '
        'with automatic name auto-completion from verified records\n'
        '- **Email OTP Authentication**: Secure email-based verification\n'
        '- **Health Record Management**: Upload, store, and manage medical records securely\n'
        '- **Consent-Based Access**: Patients control who accesses their records\n'
        '- **Audit Trails**: Complete audit log of all record access\n\n'
        '## Registration Flow:\n'
        '1. Call `/accounts/nin/full-details/` with NIN to verify identity and auto-complete names\n'
        '2. Call `/accounts/patient/register/` with complete registration data\n'
        '3. Verify email via OTP sent to your inbox\n'
        '4. Receive JWT tokens for authenticated API access'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'CONTACT': {'name': 'MediNexus Support', 'email': 'support@theMediNexus.com'},
    'LICENSE': {'name': 'Proprietary'},
    'TAGS': [
        {
            'name': 'Authentication',
            'description': (
                'Patient identity verification and account authentication.\n\n'
                '**Endpoints:**\n'
                '- `POST /nin/full-details/` - Verify NIN and get identity details for auto-completion\n'
                '- `POST /patient/register/` - Register new patient account (NIN pre-verified)\n'
                '- `POST /login/` - Login with email and password\n'
                '- `POST /otp/send/` - Request OTP for email verification\n'
                '- `POST /otp/verify/` - Verify OTP and receive JWT tokens'
            ),
        },
        {
            'name': 'Records',
            'description': (
                'Health record management and access.\n\n'
                'Allows patients to upload, retrieve, and manage their medical records.'
            ),
        },
        {
            'name': 'Consents',
            'description': (
                'Patient consent management for provider access.\n\n'
                'Patients can grant or revoke provider access to their records.'
            ),
        },
        {
            'name': 'Audit',
            'description': (
                'Audit trail and access logs.\n\n'
                'Complete audit trail of all record access and modifications.'
            ),
        },
    ],
    'COMPONENT_SPLIT_REQUEST': True,
    'SORT_OPERATIONS': False,
    'USE_SESSION_AUTH_EXCLUDE': ['accounts'],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'True').lower() == 'true'



# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', default=587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL')

EMAIL_BACKEND = 'anymail.backends.brevo.EmailBackend'
# DEFAULT_FROM_EMAIL=EMAIL_HOST_USER

# print(EMAIL_PORT, EMAIL_USE_TLS, EMAIL_HOST_USER, '******')


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}



# RESEND_API_KEY = os.environ.get('RESEND_API_KEY')

ANYMAIL = {
    "BREVO_API_KEY": os.environ.get("BREVO_API_KEY"),
}

ALLOWED_HOSTS = ['.vercel.app', 'localhost', '127.0.0.1', 'https://medinexus-dad0.onrender.com']