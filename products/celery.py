from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Задаем переменную окружения для настроек Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'artmagic.settings')

# Создаем приложение Celery
app = Celery('artmagic')

# Загружаем конфигурацию проекта из настроек Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Автоматически находим и регистрируем задачи из всех приложений
app.autodiscover_tasks()