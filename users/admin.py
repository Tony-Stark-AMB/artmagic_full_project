from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Address

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'phone_number', 'email')  # Поля, отображаемые в списке пользователей
    search_fields = ('username', 'first_name', 'last_name', 'phone_number', 'email')  # Поля, по которым можно искать пользователей

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Address)