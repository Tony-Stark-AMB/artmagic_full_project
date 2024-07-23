# models.py
from django.db import models
from users.models import CustomUser

class DeliveryOption(models.Model):
    DELIVERY_METHOD_CHOICES = [
        ('courier', 'Кур`єр'),
        ('branch', 'Відділення'),
        ('postomat', 'Поштомат'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    method = models.CharField(max_length=10, choices=DELIVERY_METHOD_CHOICES)
    city = models.CharField(max_length=100, null=True, blank=True)
    branch_id = models.CharField(max_length=100, null=True, blank=True)
    postomat_id = models.CharField(max_length=100, null=True, blank=True)
