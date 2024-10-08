import random
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from carts.models import Order
from django.views import View
from django.core.mail import EmailMessage
from .decryption_ref import get_city_name, get_area_name, get_department_name
import json
import logging


logger = logging.getLogger(__name__)

class ProcessOrderView(View):

    payment_options = {
        'liqpay': "Онлайн-оплата банківською карткою",
        'payment_card': "Оплата за реквізитами",
        'payment_real': "Оплата у точці видачі"
    }

    delivery_options = {
        'artmagic_department': "Самовивіз",
        'new_post_department': "Відділення Нової пошти",
        'new_post_packing': "Поштомат Нової пошти",
        'new_post_address': "Кур'єрська доставка Нової пошти",
        'ukr_post': "Укрпошта"
    }

    email_owner = 'Asgeron90@gmail.com'

    def post(self, request):
        try:
            data = self.parse_request_data(request)
            delivery_method, address = self.get_delivery_info(data)
            self.validate_required_fields(data)
            order_number = self.generate_order_number()
            user = request.user if request.user.is_authenticated else None
            
            order = self.create_order(data, order_number, user, address)
            context = self.prepare_email_context(data, delivery_method, order_number)

            self.send_email(self.email_owner, context, f"Замовлення №: {order_number}", 'carts/email_template.html')
            self.send_email(data.get('email'), context, 'Ваше замовлення прийняте', 'users/email_template_user.html')

            return JsonResponse({'status': 'success', 'message': 'Заказ успешно отправлен'}, status=200)

        except (json.JSONDecodeError, ValueError) as e:
            logger.error('Error processing order: %s', e)
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
        except Exception as e:
            logger.error('Unexpected error: %s', e)
            return JsonResponse({'status': 'error', 'message': 'Ошибка при обработке заказа'}, status=500)

    def parse_request_data(self, request):
        body_unicode = request.body.decode('utf-8')
        data = json.loads(body_unicode)
        logger.debug('Received data: %s', data)
        return data

    def get_delivery_info(self, data):
        data_delivery = data.get('selectedDelivery')
        delivery_method = self.delivery_options.get(data_delivery, "")
        address = data.get('address', '')
        
        # Установка адреса в зависимости от метода доставки
        if delivery_method == "Самовивіз":
            address = 'м. Дніпро, Вул. Якова Самарського 5, к. 7'
        elif delivery_method in ["Відділення Нової пошти", "Поштомат Нової пошти"]:
            area_value = get_area_name(data['area'])
            city_value = get_city_name(data['city'])
            department_value = get_department_name(data['department'], data['city'])
            address = f'{area_value} область, {city_value}, {department_value}'
        elif delivery_method == "Кур'єрська доставка Нової пошти":
            area_value = get_area_name(data['area'])
            city_value = get_city_name(data['city'])
            address = f'{area_value} область, {city_value}, {address}'
        
        return delivery_method, address

    def validate_required_fields(self, data):
        required_fields = ['name', 'phone', 'email', 'products']
        if not all(data.get(field) for field in required_fields):
            raise ValueError('Missing required fields in data')

    def generate_order_number(self):
        while True:
            order_number = str(random.randint(10000000, 99999999))
            if not Order.objects.filter(order_number=order_number).exists():
                return order_number

    def create_order(self, data, order_number, user, address):
        return Order.objects.create(
            order_number=order_number,
            user=user,
            name=data.get('name'),
            phone=data.get('phone'),
            email=data.get('email'),
            payment=self.payment_options.get(data.get('selectedPayment', ""), ""),
            address=address,
            total_price=data.get('amount'),
            products=data.get('products')  # Сохранение продуктов как JSON-объект
        )

    def prepare_email_context(self, data, delivery_method, order_number):
        return {
            'name': data.get('name'),
            'phone': data.get('phone'),
            'email': data.get('email'),
            'payment': self.payment_options.get(data.get('selectedPayment', ""), ""),
            'address': data.get('address', ''),
            'products': data.get('products'),
            'total_price': data.get('amount'),
            'delivery_method': delivery_method,
            'order_number': order_number
        }

    def send_email(self, recipient, context, subject, template_path):
        html_message = render_to_string(template_path, context)
        email_message = EmailMessage(subject, html_message, self.email_owner, [recipient])
        email_message.content_subtype = "html"
        email_message.send()
        logger.debug('Email sent successfully to %s', recipient)