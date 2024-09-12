import random
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from django.utils.crypto import get_random_string
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from carts.models import Cart, Order
from django.views import View
from carts.utils import get_user_carts, generate_excel
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


def cart_add(request):
    product_id = request.POST.get("product_id")

    product = Products.objects.get(id=product_id)

    if request.user.is_authenticated:
        carts = Cart.objects.filter(user=request.user, product=product)

        if carts.exists():
            cart = carts.first()
            if cart:
                cart.quantity += 1
                cart.save()
        else:
            Cart.objects.create(user=request.user, product=product, quantity=1)

    else:
        carts = Cart.objects.filter(
            session_key=request.session.session_key, product=product)

        if carts.exists():
            cart = carts.first()
            if cart:
                cart.quantity += 1
                cart.save()
        else:
            Cart.objects.create(
                session_key=request.session.session_key, product=product, quantity=1)

    user_cart = get_user_carts(request)
    cart_items_html = render_to_string(
        "carts/includes/included_cart.html", {"carts": user_cart}, request=request)

    response_data = {
        "message": "Товар добавлен в корзину",
        "cart_items_html": cart_items_html,
    }

    return JsonResponse(response_data)


def cart_change(request):
    cart_id = request.POST.get("cart_id")
    quantity = request.POST.get("quantity")

    cart = Cart.objects.get(id=cart_id)

    cart.quantity = quantity
    cart.save()
    updated_quantity = cart.quantity

    cart = get_user_carts(request)
    cart_items_html = render_to_string(
        "carts/includes/included_cart.html", {"carts": cart}, request=request)

    response_data = {
        "message": "Количество изменено",
        "cart_items_html": cart_items_html,
        "quaantity": updated_quantity,
    }

    return JsonResponse(response_data)


def cart_remove(request):
    cart_id = request.POST.get("cart_id")

    cart = Cart.objects.get(id=cart_id)
    quantity = cart.quantity
    cart.delete()

    user_cart = get_user_carts(request)
    cart_items_html = render_to_string(
        "carts/includes/included_cart.html", {"carts": user_cart}, request=request)

    response_data = {
        "message": "Товар удален",
        "cart_items_html": cart_items_html,
        "quantity_deleted": quantity,
    }

    return JsonResponse(response_data)


logger = logging.getLogger(__name__)

class ProcessOrderView(View):

    def post(self, request):
        print('----------11111--------------')
        try:
            body_unicode = request.body.decode('utf-8')
            data = json.loads(body_unicode)
            logger.debug('Received data: %s', data)
            print(data)
            name = data.get('name')
            phone = data.get('phone')
            email = data.get('email')
            data_payment = data.get('selectedPayment')
            if data_payment == 'liqpay':
                payment = "Онлайн-оплата банківською карткою"
            if data_payment == 'payment_card':
                payment = "Оплата за реквізитами"
            if data_payment == 'payment_real':
                payment = "Оплата у точці видачі"
            address = data.get('address', '')

            # Логика для формирования адреса доставки
            address_delivery = ""
            if data.get('department') and data.get('city') and data.get('area'):
                address_delivery = [
                    get_department_name(data['department'], data['city']),
                    get_city_name(data['city']),
                    get_area_name(data['area'])
                ]

            products = data.get('products')

            total_price = 0
            for el in products:
                total_price += round(int(el['quantity']) * float(el['price']), 2)

            # Проверка на наличие обязательных полей
            if not (name, phone, email, products):
                logger.error('Missing required fields in data')
                return JsonResponse({'status': 'error', 'message': 'Missing required fields'}, status=400)

            # Генерация уникального номера заказа
            while True:
                order_number = str(random.randint(10000000, 99999999))
                if not Order.objects.filter(order_number=order_number).exists():
                    break

            user = request.user if request.user.is_authenticated else None
            print(user, '||||||||||||||||||||||||||||||||||||||||||')
            order = Order.objects.create(
                order_number=order_number,
                user = user,
                name=name,
                phone=phone,
                email=email,
                payment=payment,
                address=address,
                address_delivery=address_delivery,
                total_price=total_price,
                products=products  # Сохранение продуктов как JSON-объект
            )

            # Параметры для писем
            params = {
                'name': name,
                'phone': phone,
                'email': email,
                'payment': payment,
                'address': address,
                'products': products,
                'total_price': total_price,
                'address_delivery': address_delivery,
                'order_number': order_number
            }

            # Формирование письма владельцу сайта
            subject_owner = 'Новый заказ от клиента'
            html_message_owner = render_to_string('carts/email_template.html', params)
            recipient_list_owner = ['artmagicinternet@gmail.com']

            try:
                email_message_owner = EmailMessage(subject_owner, html_message_owner, 'artmagicinternet@gmail.com', recipient_list_owner)
                email_message_owner.content_subtype = "html"
                email_message_owner.send()
                logger.debug('Email sent successfully to %s', recipient_list_owner)
            except Exception as e:
                logger.error('Error sending email to owner: %s', e)
                return JsonResponse({'status': 'error', 'message': 'Ошибка при отправке электронной почты владельцу'}, status=500)

            # Формирование письма пользователю
            subject_user = 'Ваше замовлення прийняте'
            html_message_user = render_to_string('users/email_template_user.html', params)
            recipient_list_user = [email]

            try:
                email_message_user = EmailMessage(subject_user, html_message_user, 'artmagicinternet@gmail.com', recipient_list_user)
                email_message_user.content_subtype = "html"
                email_message_user.send()
                logger.debug('Email sent successfully to %s', recipient_list_user)
                return JsonResponse({'status': 'success', 'message': 'Заказ успешно отправлен'}, status=200)
            except Exception as e:
                logger.error('Error sending email to user: %s', e)
                return JsonResponse({'status': 'error', 'message': 'Ошибка при отправке электронной почты пользователю'}, status=500)

        except json.JSONDecodeError as e:
            logger.error('JSON decode error: %s', e)
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)

        except Exception as e:
            logger.error('Error processing order: %s', e)
            return JsonResponse({'status': 'error', 'message': 'Ошибка при обработке заказа'}, status=500)
