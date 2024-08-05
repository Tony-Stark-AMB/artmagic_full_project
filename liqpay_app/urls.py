from django.urls import path
from .views import create_payment, payment_status

urlpatterns = [
    path('create/', create_payment, name='create_payment'),
    path('status/<str:order_id>/', payment_status, name='payment_status'),
]
