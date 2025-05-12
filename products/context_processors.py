from django.shortcuts import render
from .models import Category
from users.models import Address
from django.contrib.auth.models import AnonymousUser
from datetime import datetime

def current_categories(request):

    categories = Category.objects.filter(parent=None)
    full_url = request.path

    user = getattr(request, 'user', AnonymousUser()) 

    if isinstance(user, AnonymousUser):
        address = None  # Нет адреса для анонимного пользователя
    else:
        # Предполагается, что `Address` связан с `user`, как ForeignKey или OneToOneField
        try:
            address = Address.objects.get(user=user)
        except Address.DoesNotExist:
            address = None  # Если адрес не найден, устанавливаем в None

    return {'categories': categories, 'user': user, 'address': address, 'year': datetime.now().year, 'full_url': full_url}