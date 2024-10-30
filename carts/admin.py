import json

from django.contrib import admin
from django.utils.safestring import mark_safe

from carts.models import Cart, Order, PreOrder



@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'name', 'phone', 'email', 'payment', 'total_price', 'created_at', 'display_products')
    # list_filter = ('created_at', 'payment')
    search_fields = ('order_number', 'name', 'phone', 'email')

    readonly_fields = ('display_products',)
    exclude = ('products',)

    def display_products(self, obj):
        products = obj.products
        if not products:
            return "No products ordered."

        # Создаем HTML-таблицу
        html = '<table style="width:100%; border:1px solid black; border-collapse:collapse;">'
        html += '<thead><tr><th>Назва продукту</th><th>К-сть</th><th>Ціна</th><th>Артикул</th></tr></thead>'
        html += '<tbody>'

        for product in products:
            product_name = product.get("name", "N/A")
            quantity = product.get("quantity", 0)
            price = product.get("price", 0)
            model = product.get("model", "")
            # total = quantity * price
            html += f'<tr><td>{product_name}</td><td>{quantity}</td><td>{price}грн</td></td><td>{model}</td></tr>'

        html += '</tbody></table>'
        return mark_safe(html)  # Используем mark_safe для корректного отображения HTML
    display_products.short_description = 'Перелік продуктів'

    def save_model(self, request, obj, form, change):
        # Устанавливаем пользователя, если он авторизован и еще не установлен
        if not obj.user and request.user.is_authenticated:
            obj.user = request.user
        super().save_model(request, obj, form, change)


@admin.register(PreOrder)
class PreOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'name', 'created_at', 'display_products')
    search_fields = ('order_number', 'name', 'user__username')
    readonly_fields = ('display_products',)
    exclude = ('products',)

    def display_products(self, obj):
        products = obj.products
        if isinstance(products, str):  # Проверяем, если products – строка
            products = json.loads(products)  # Преобразуем JSON-строку в словарь

        if not products:
            return "No products ordered."

            # Создаем HTML-таблицу
        html = '<table style="width:100%; border:1px solid black; border-collapse:collapse;">'
        html += '<thead><tr><th>Назва продукту</th><th>К-сть</th><th>Ціна</th><th>Артикул</th></tr></thead>'
        html += '<tbody>'

        for product in products:
            product_name = product.get("name", "N/A")
            quantity = product.get("quantity", 0)
            price = product.get("price", 0)
            model = product.get("model", "")
            html += f'<tr><td>{product_name}</td><td>{quantity}</td><td>{price} грн</td><td>{model}</td></tr>'

        html += '</tbody></table>'
        return mark_safe(html)

    def save_model(self, request, obj, form, change):
        # Устанавливаем пользователя, если он авторизован и еще не установлен
        if not obj.user and request.user.is_authenticated:
            obj.user = request.user
        super().save_model(request, obj, form, change)