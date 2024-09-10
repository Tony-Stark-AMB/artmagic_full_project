from django.db import models
from products.models import Products
from users.models import CustomUser


class CartQueryset(models.QuerySet):
    
    def total_price(self):
        return sum(cart.products_price() for cart in self)
    
    def total_quantity(self):
        if self:
            return sum(cart.quantity for cart in self)
        return 0
    

class Cart(models.Model):

    user = models.ForeignKey(to=CustomUser, on_delete=models.CASCADE, blank=True, null=True, verbose_name='Пользователь')
    product = models.ForeignKey(to=Products, on_delete=models.CASCADE, verbose_name='Товар')
    quantity = models.PositiveSmallIntegerField(default=0, verbose_name='Количество')
    session_key = models.CharField(max_length=32, null=True, blank=True)
    created_timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')

    class Meta:
        db_table = 'cart'
        verbose_name = "Корзина"
        verbose_name_plural = "Корзина"

    objects = CartQueryset().as_manager()

    def products_price(self):
        return round(self.product.sell_price() * self.quantity, 2)


    def __str__(self):
        if self.user:
            return f'Корзина {self.user.username} | Товар {self.product.name} | Количество {self.quantity}'
            
        return f'Анонимная корзина | Товар {self.product.name} | Количество {self.quantity}'


class Order(models.Model):
    user = models.ForeignKey(
        to=CustomUser,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        verbose_name='Користувач'  # User
    )
    order_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name='№ замовлення'  # Order Number
    )
    name = models.CharField(
        max_length=255,
        verbose_name='ПІБ'  # Name
    )
    phone = models.CharField(
        max_length=20,
        verbose_name='Телефон'  # Phone
    )
    email = models.EmailField(
        verbose_name='Email'  # Email
    )
    payment = models.CharField(
        max_length=50,
        verbose_name='Спосіб оплати'  # Payment Method
    )
    address = models.TextField(
        verbose_name='Адреса'  # Address
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Загальна сума'  # Total Price
    )
    products = models.JSONField(
        verbose_name='Продукти'  # Products
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата створення'  # Created At
    )

    class Meta:
        verbose_name = 'Замовлення'  # Singular name
        verbose_name_plural = 'Замовлення'  # Plural name
        ordering = ['-created_at']  # Optionally add default ordering

    def __str__(self):
        return f"Order {self.order_number} by {self.name}"
    # другие поля для заказа

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super(Order, self).save(*args, **kwargs)

    def generate_order_number(self):
        last_order = Order.objects.all().order_by('id').last()
        if not last_order:
            return 'ORDER00001'
        order_id = last_order.id + 1
        return f'ORDER{str(order_id).zfill(5)}'