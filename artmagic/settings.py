"""
Django settings for artmagic project.

Generated by 'django-admin startproject' using Django 5.0.3.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-q#)5^v8c0d)s)26-6-agi4-m4dkcxw6g=bb8w+!&4e8%5prpb+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',

    'mptt',

    'products',
    'users',
    'carts',
    'django_filters',
    'delivery',
    'liqpay_app',    
    'main',

    'corsheaders',

]

    # 'django_dump_load_utf8',

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    
]

ROOT_URLCONF = 'artmagic.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR,'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'products.context_processors.current_categories',
                'main.magic_file.header',
            ],
        },
    },
]

WSGI_APPLICATION = 'artmagic.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'root',  # Название вашей базы данных
        'USER': 'postgres',  # Имя пользователя вашей базы данных
        'PASSWORD': 'root',  # Пароль пользователя базы данных
        'HOST': 'localhost',  # Хост базы данных (обычно localhost)
        'PORT': '5432',  # Порт базы данных (обычно 5432)
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

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

NOVA_POSHTA_API_KEY = "3395ff65768492c3ac09b0daa030498e"
LIQPAY_PUBLIC_KEY = 'sandbox_i7216631845'
LIQPAY_PRIVATE_KEY = 'sandbox_riL15asckkqGWZPCPe6F68V3HdJ53RZPak0D0xCO'

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/



# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.CustomUser'
# LOGIN_URL = '/user/login/'

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


MPTT_ADMIN_LEVEL_INDENT = 25

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'Asgeron90@gmail.com'
EMAIL_HOST_PASSWORD = 'cnyl ughh wuuw xvgv'


import mimetypes
mimetypes.add_type("application/javascript", ".js", True)

if DEBUG:
    import mimetypes
    mimetypes.add_type("application/javascript", ".mjs", True)

if DEBUG:
    import mimetypes
    mimetypes.add_type("application/javascript", ".min.js", True)

if DEBUG:
    import mimetypes
    mimetypes.add_type("text/css", ".css", True)

# CORS_ALLOWED_ORIGINS = ["http://localhost:8000", "http://127.0.0.1:8000"]
CORS_ALLOW_METHODS = (
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
)

CORS_ORIGIN_ALLOW_ALL=True