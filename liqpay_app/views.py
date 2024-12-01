import logging
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from .models import Payment
from users.models import CustomUser, Address
from liqpay.liqpay3 import LiqPay
from datetime import datetime
from django.http import JsonResponse, HttpRequest
from django.forms.models import model_to_dict
import time
import json


from carts.utils import parse_request_data, get_delivery_info, validate_required_fields, create_order, prepare_email_context, send_email, prepare_email_context_liqpay
from artmagic.settings import EMAIL_HOST_USER
logger = logging.getLogger(__name__)


def create_payment(request):
    print(request)
    if request.method == 'POST':
        
        body_data = parse_request_data(request)
        data = {
            'name': body_data.get('fullName', '')['value'],
            'phone': body_data.get('clientPhone', '')['value'],
            'email': body_data.get('email', '')['value'],
            'products': body_data.get('products', ''),
            'city': body_data.get('city', '')['value'],
            'address': body_data.get('address', '')['value'],
            'area': body_data.get('area', '')['value'],
            'department': body_data.get('department', '')['value'],
            'amount': body_data.get('amount', ''),
            'selectedDelivery': body_data.get('selectedDelivery', ''),
            'selectedPayment': body_data.get('selectedPayment', '')
        }
        delivery_method, address = get_delivery_info(data)
        validate_required_fields(data)
        user = request.user if request.user.is_authenticated else None
        
        order = create_order(data, user, address)
        order_number = order.order_number

        try:
            
            amount = body_data.get('amount', '')
            description = body_data.get('description', '')

            # Генерируем форму LiqPay
            liqpay = LiqPay(settings.LIQPAY_PUBLIC_KEY, settings.LIQPAY_PRIVATE_KEY)
            params = {
                'public_key': settings.LIQPAY_PUBLIC_KEY,
                'action': 'pay',
                'amount': amount,
                'currency': 'UAH',
                'description': description,
                'order_id': f'{order_number}-{body_data.get("selectedDelivery")}',
                'version': '3',
                'server_url': 'https://d3d8-178-215-168-165.ngrok-free.app/payment/liqpay-callback/',
                'result_url': request.build_absolute_uri('/'),
            }

            # Генерируем HTML форму
            form_html = liqpay.cnb_form(params)
            form_html = form_html.replace('<form', '<form target="_blank"')

            # Возвращаем форму в JSON ответе
            response_data = {
                'status': 'success',
                'formHtml': form_html,
                'orderNumber': order_number
            }
            return JsonResponse(response_data, status=200)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return HttpResponse("GET method not supported for payment creation", status=405)
# def create_payment(request):

from carts.views import ProcessOrderView
from django.views.decorators.csrf import csrf_exempt
import base64
import hashlib
import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from liqpay.liqpay3 import LiqPay
from django.conf import settings
import logging


@csrf_exempt
def payment_status(request):

    

    email_owner = EMAIL_HOST_USER
    data = request.POST.get('data', '')
    signature = request.POST.get('signature', '')
    expected_signature = base64.b64encode(
        hashlib.sha1(f"{settings.LIQPAY_PRIVATE_KEY}{data}{settings.LIQPAY_PRIVATE_KEY}".encode()).digest()
    ).decode()
    
    if signature != expected_signature:
        logger.error("Invalid signature")
        return HttpResponse("Invalid signature", status=403)

    # 4. Декодируем данные
    decoded_data = json.loads(base64.b64decode(data).decode('utf-8'))
    order_id = decoded_data.get('order_id', None).split('-')[0]

    status = decoded_data.get('status', None)


    if status == 'success':
        fields, email = prepare_email_context_liqpay(decoded_data, order_id)
    

        # # Отправка писем
        send_email(email_owner, fields, f"Замовлення №: {order_id}", 'carts/email_template.html')
        send_email(email, fields, 'Ваше замовлення прийняте', 'users/email_template_user.html')

        return HttpResponse("OK", status=200)