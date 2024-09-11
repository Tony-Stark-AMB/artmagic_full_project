from django.db import models


class Carousel(models.Model):
    title = models.CharField(max_length=255, verbose_name="Заголовок слайда", blank=True, null=True)
    image = models.ImageField(upload_to='catalog/', verbose_name="Зображення", max_length=300)

    class Meta:
        verbose_name = "Слайд"
        verbose_name_plural = "Слайди"

    def __str__(self):
        return self.title

class Header(models.Model):
    # Данные для хедера
    phone_number = models.CharField(max_length=15, verbose_name='Номер телефону')
    email = models.EmailField(verbose_name='Emeil')

    class Meta:
        verbose_name = 'Контакти у верхньому меню'
        verbose_name_plural = 'Контакти у верхньому меню'

    def __str__(self):
        return f'{"Контактні дані :"}'

class AboutUs(models.Model):
    # О нас
    title = models.CharField(max_length=100, verbose_name='Титул')
    description = models.TextField(verbose_name='Опис')

    class Meta:
        verbose_name = 'Информація про нас'
        verbose_name_plural = 'Информація про нас'

    def __str__(self):
        return f'{"Про нас :"}'


class PaymentDelivery(models.Model):
    # Оплата и доставка
    title = models.CharField(max_length=100, verbose_name='Титул')
    description = models.TextField(verbose_name='Опис')

    class Meta:
        verbose_name = 'Оплата та доставка'
        verbose_name_plural = 'Оплата та доставка'

    def __str__(self):
        return f'{"Оплата и доставка :"}'


class Safeguards(models.Model):
    # Гарантии
    title = models.CharField(max_length=100, verbose_name='Титул')
    description = models.TextField(verbose_name='Опис')

    class Meta:
        verbose_name = 'Гарантії'
        verbose_name_plural = 'Гарантії'

    def __str__(self):
        return f'{"Гарантії :"}'


class ReturnAgoods(models.Model):
    # Возврат товара
    title = models.CharField(max_length=100, verbose_name='Титул')
    description = models.TextField(verbose_name='Опис')

    class Meta:
        verbose_name = 'Повернення товару'
        verbose_name_plural = 'Повернення товару'

    def __str__(self):
        return f'{"Повернення товару :"}'


class ContactInfo(models.Model):
    phone_number = models.CharField(max_length=20, verbose_name="Номер телефона")

    class Meta:
        verbose_name = 'Контакти'
        verbose_name_plural = 'Контакти'

    def str(self):
        return self.phone_number




