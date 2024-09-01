from carts.models import Cart
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from carts.models import Cart
from django.views import View

from django.core.mail import send_mail
from django.core.mail import EmailMessage
from products.models import Products
from delivery.models import DeliveryOption
from liqpay_app.models import Payment
from .decryption_ref import get_city_name, get_area_name, get_department_name
from openpyxl import Workbook
import os
from datetime import datetime
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def get_user_carts(request):
    if request.user.is_authenticated:
        return Cart.objects.filter(user=request.user).select_related('product')
    
    if not request.session.session_key:
        request.session.create()
    return Cart.objects.filter(session_key=request.session.session_key).select_related('product')


def generate_excel(request, data):
    try:
        body_unicode = request.body.decode('utf-8')
        data = json.loads(body_unicode)
        logger.debug('Received data for Excel generation: %s', data)

        products = data.get('products')
        print('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')

        if not products:
            logger.error('No products found in data')
            return JsonResponse({'status': 'error', 'message': 'No products to generate Excel'}, status=400)

        # Создание нового Excel-файла
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = 'Order Details'

        # Заголовки для колонок
        headers = ['Product Name', 'Quantity', 'Price', 'Total']
        sheet.append(headers)

        # Заполнение данных о продуктах
        for product in products:
            name = product['name']
            quantity = product['quantity']
            price = float(product['price'])
            total = round(int(quantity) * price, 2)
            sheet.append([name, quantity, price, total])

        # Определение пути для сохранения файла
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'order_details_{timestamp}.xlsx'
        directory = 'order_to_exel'
        if not os.path.exists(directory):
            os.makedirs(directory)
        file_path = os.path.join(directory, filename)

        # Сохранение Excel-файла локально
        workbook.save(file_path)

        logger.debug('Excel file saved locally at %s', file_path)
        return JsonResponse({'status': 'success', 'message': f'Excel file saved at {file_path}'}, status=200)

    except json.JSONDecodeError as e:
        logger.error('JSON decode error: %s', e)
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)

    except Exception as e:
        logger.error('Error generating Excel: %s', e)
        return JsonResponse({'status': 'error', 'message': 'Error generating Excel file'}, status=500)