from django.db import models


class Header(models.Model):
    # Данные для хедера
    phone_number = models.CharField(max_length=15, verbose_name='Номер телефону')
    email = models.EmailField(verbose_name='Emeil')

    class Meta:
        verbose_name = 'Шапка сайта'
        verbose_name_plural = 'Шапка сайта'

    def __str__(self):
        return f'{"Контактные данные :"}'

class AboutUs(models.Model):
    # О нас
    title = models.CharField(max_length=100, verbose_name='Тітул')
    description = models.TextField(verbose_name='Опис')

    class Meta:
        verbose_name = 'Информація про нас'
        verbose_name_plural = 'Информація про нас'

    def __str__(self):
        return f'{"О нас :"}'


class PaymentDelivery(models.Model):
    # Оплата и доставка
    title = models.CharField(max_length=100, verbose_name='Тітул')
    description = models.TextField(verbose_name='Опис')

    class Meta:
        verbose_name = 'Оплата та доставка'
        verbose_name_plural = 'Оплата та доставка'

    def __str__(self):
        return f'{"Оплата и доставка :"}'


class Safeguards(models.Model):
    # Гарантии
    title = models.CharField(max_length=100, verbose_name='Тітул')
    description = models.TextField(verbose_name='Опис')

    class Meta:
        verbose_name = 'Гарантії'
        verbose_name_plural = 'Гарантії'

    def __str__(self):
        return f'{"Гарантии :"}'


class ReturnAgoods(models.Model):
    # Возврат товара
    title = models.CharField(max_length=100, verbose_name='Тітул')
    description = models.TextField(verbose_name='Опис')

    class Meta:
        verbose_name = 'Повернення товару'
        verbose_name_plural = 'Повернення товару'

    def __str__(self):
        return f'{"Возврат товара :"}'







