from django.shortcuts import render
from django.views.generic import DetailView
from .models import Header, AboutUs, PaymentDelivery, Safeguards, ReturnAgoods
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
    informations = AboutUs.objects.all()
    return render(request, 'main/about_us.html', {'informations': informations})


def payment_delivery(request):
    informations = PaymentDelivery.objects.all()
    return render(request, 'main/payment_delivery.html', {'informations': informations})


def safeguards(request):
    informations = PaymentDelivery.objects.all()
    return render(request, 'main/safeguards.html', {'informations': informations})

def return_a_goods(request):
    informations = PaymentDelivery.objects.all()
    return render(request, 'main/return_a_goods.html', {'informations': informations})

def contacts(request):
    informations = PaymentDelivery.objects.all()
    return render(request, 'main/contacts.html', {'informations': informations})
