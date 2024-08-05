import logging
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from .models import Payment
from users.models import CustomUser, Address
from liqpay.liqpay3 import LiqPay
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class OrderIDGenerator:
    def __init__(self):
        self.current_id = 0

    def get_next_id(self):
        self.current_id += 1
        return f"{self.current_id:06d}"

order_id_liqpay = OrderIDGenerator()

@login_required
def create_payment(request):
    if request.method == 'POST':
        print( json.loads(request.body))
        data = json.loads(request.body)
        amount = data.get('amount', '')
        description = data.get('description', '')
        liqpay = LiqPay(settings.LIQPAY_PUBLIC_KEY, settings.LIQPAY_PRIVATE_KEY)
        params = {
            'public_key': settings.LIQPAY_PUBLIC_KEY,
            'action': 'pay',
            'amount': amount,
            'currency': 'UAH',
            'description': description,
            'order_id': order_id_liqpay.get_next_id(),
            'version': '3',
            'server_url': request.build_absolute_uri('/liqpay-callback/'),
            'result_url': request.build_absolute_uri('/payment-success/'),
        }
        print(params)
        form = liqpay.cnb_form(params)
        # return render(request, 'liqpay_app/payment_form.html', {'form': form})
        return HttpResponse(form)

    user = request.user
    address = user.address if hasattr(user, 'address') else None
    return render(request, 'liqpay_app/create_payment.html', {'user': user, 'address': address})
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

    return render(request, 'liqpay_app/payment_status.html', {'payment': payment, 'response': response})