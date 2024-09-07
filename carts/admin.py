from django.contrib import admin

from carts.models import Cart, Order

# # admin.site.register(Cart)
# class CartTabAdmin(admin.TabularInline):
#     model = Cart
#     fields = "product", "quantity", "created_timestamp"
#     search_fields = "product", "quantity", "created_timestamp"
#     readonly_fields = ("created_timestamp",)
#     extra = 1


# @admin.register(Cart)
# class CartAdmin(admin.ModelAdmin):
#     list_display = ["user_display", "product_display", "quantity", "created_timestamp",]
#     list_filter = ["created_timestamp", "user", "product__name",]

#     def user_display(self, obj):
#         if obj.user:
#             return str(obj.user)
#         return "Анонимный пользователь"

#     def product_display(self, obj):
#         return str(obj.product.name)



class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'name', 'phone', 'email', 'payment', 'total_price', 'created_at')
    list_filter = ('created_at', 'payment')
    search_fields = ('order_number', 'name', 'phone', 'email')

    def save_model(self, request, obj, form, change):
        # Устанавливаем пользователя, если он авторизован и еще не установлен
        if not obj.user and request.user.is_authenticated:
            obj.user = request.user
        super().save_model(request, obj, form, change)

admin.site.register(Order, OrderAdmin)

    