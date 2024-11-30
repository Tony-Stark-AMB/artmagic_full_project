import logging
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from .models import Payment
from users.models import CustomUser, Address
from liqpay.liqpay3 import LiqPay
from datetime import datetime
from django.http import JsonResponse
import re
import json

logger = logging.getLogger(__name__)

class OrderIDGenerator:
    def __init__(self):
        self.current_id = 0

    def get_next_id(self):
        self.current_id += 1
        return f"{self.current_id:06d}"

order_id_liqpay = OrderIDGenerator()

def create_payment(request):
    print(request)
    if request.method == 'POST':
        body_data = json.loads(request.body)
        amount = body_data.get('amount', '')
        if not amount or float(amount) <= 0:  # Validate the amount
            return JsonResponse({'error': 'Invalid amount'}, status=400)
        email = body_data.get('email', '')
        description = body_data.get('description', '')
        
        # Assuming you have some function to get the next order ID
        order_id = order_id_liqpay.get_next_id()

        liqpay = LiqPay(settings.LIQPAY_PUBLIC_KEY, settings.LIQPAY_PRIVATE_KEY)
        params = {
            'public_key': settings.LIQPAY_PUBLIC_KEY,
            'action': 'pay',
            'amount': amount,
            'currency': 'UAH',
            'description': description,
            'order_id': order_id,
            'version': '3',
            'server_url': request.build_absolute_uri('/liqpay-callback/'),
            'result_url': request.build_absolute_uri('/payment-success/'),
        }
        
        # Generate the form HTML
        form_html = liqpay.cnb_form(params)
        
        form_html = form_html.replace('<form', '<form target="_blank"')

        # Return the form HTML in a JSON response
        response_data = {
            'status': 200,
            'formHtml': form_html
        }
        
        return JsonResponse(response_data)

    user = request.user if request.user.is_authenticated else None
    address = user.address if user and hasattr(user, 'address') else None
    return HttpResponse("GET method not supported for payment creation", status=405)
# def create_payment(request):

@login_required
def payment_status(request, order_id):
    try:
        payment = Payment.objects.get(order_id=order_id)
    except Payment.DoesNotExist:
        logger.error(f"Payment not found for order_id: {order_id}")
        return HttpResponse("Payment not found", status=404)

    liqpay = LiqPay(settings.LIQPAY_PUBLIC_KEY, settings.LIQPAY_PRIVATE_KEY)
    params = {
        'action': 'status',
        'order_id': order_id,
        'version': '3',
    }

    logger.info(f"Checking payment status for order_id: {order_id}")

    response = liqpay.api("request", params)

    logger.info(f"LiqPay response for order_id: {order_id}, response: {response}")

    payment.status = response.get('status', 'error')
    payment.save()
    if payment.status == 'success':
        send_order_confirmation(payment)

    return render(request, 'liqpay_app/payment_status.html', {'payment': payment, 'response': response})

def send_order_confirmation(payment):
    # Логика для отправки уведомления пользователю и интернет-магазину
    logger.info(f"Order {payment.order_id} has been paid. User: {payment.user.email}, Amount: {payment.amount}")
    # Здесь можно использовать django.core.mail для отправки email