from django.shortcuts import render
from django.views.generic import DetailView
from .models import Header, AboutUs, PaymentDelivery, Safeguards, ReturnAgoods, ContactInfo
from products.models import Category


# def main_page(request):
#     categories = Category.objects.filter(parent=None)
#     filds = Header.objects.get(pk=1)
#     print('_________________________________________________')
#     print(filds)
#     return render(request, 'products/base.html', {'categories': categories, 'filds': filds})
#

# class HeaderDetailView(DetailView):
#     model = Header
#     template_name = 'include/header.html'  # Замените на имя вашего шаблона

    # def get_context_data(self, **kwargs):
    #     context = super().get_context_data(**kwargs)
    #     # Получаем объект Header
    #     header = Header.objects.first()  # Лучше использовать фильтр или другую логику для выбора конкретного объекта
    #     # Добавляем данные в контекст
    #     context['header_phone_number'] = header.phone_number
    #     context['header_email'] = header.email
    #     return context
#

def about_us(request):
    about_us = AboutUs.objects.first()
    return render(request, 'main/about_us.html', {'about_us': about_us})


def payment_delivery(request):
    payment_delivery = PaymentDelivery.objects.first()
    return render(request, 'main/payment_delivery.html', {'payment_delivery': payment_delivery})


def safeguards(request):
    safeguards = Safeguards.objects.first()
    return render(request, 'main/safeguards.html', {'safeguards': safeguards})

def return_a_goods(request):
    return_a_goods = ReturnAgoods.objects.first()
    return render(request, 'main/return_a_goods.html', {'return_a_goods': return_a_goods})

def contact_page(request):
    contact_info = ContactInfo.objects.all()
    return render(request, 'main/contacts.html', {'contact_info': contact_info}) 

