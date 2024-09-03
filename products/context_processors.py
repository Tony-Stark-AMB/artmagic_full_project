from django.shortcuts import render
from .models import Category
from users.models import Address
from django.contrib.auth.models import AnonymousUser

def current_categories(request):

    categories = Category.objects.filter(parent=None)

    user = request.user

    if isinstance(user, AnonymousUser):
        address = None  # Нет адреса для анонимного пользователя
    else:
        # Предполагается, что `Address` связан с `user`, как ForeignKey или OneToOneField
        try:
            address = Address.objects.get(user=user)
        except Address.DoesNotExist:
            address = None  # Если адрес не найден, устанавливаем в None

    return {'categories': categories, 'user': user, 'address': address}