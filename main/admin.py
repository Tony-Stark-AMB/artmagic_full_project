from django.contrib import admin
from .models import Header, AboutUs, PaymentDelivery, Safeguards, ReturnAgoods, ContactInfo, Carousel

@admin.register(Header)
class HeaderAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'email')

@admin.register(AboutUs)
class AboutUsAdmin(admin.ModelAdmin):
    list_display = ('title',)

@admin.register(PaymentDelivery)
class PaymentDeliveryAdmin(admin.ModelAdmin):
    list_display = ('title',)

@admin.register(Safeguards)
class SafeguardsAdmin(admin.ModelAdmin):
    list_display = ('title',)

@admin.register(ReturnAgoods)
class ReturnAgoodsAdmin(admin.ModelAdmin):
    list_display = ('title',)

@admin.register(ContactInfo)
class ContactInfo(admin.ModelAdmin):
    list_display = ('phone_number',)
    
@admin.register(Carousel)
class CarouselAdmin(admin.ModelAdmin):
    list_display = ('title',)
    search_fields = ('title',)
