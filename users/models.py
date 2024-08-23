from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.username


class Address(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    address_line1 = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=20)


class PurchaseHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    # продукты
    date = models.DateTimeField(auto_now_add=True)
