from django.urls import path
from .views import about_us, payment_delivery, safeguards, return_a_goods, contact_page

app_name = 'main'


urlpatterns = [
    # path('', header, name = 'main_page'),
    path('about/', about_us, name='about_detail'),
    path('payment-delivery/', payment_delivery, name='payment_delivery_detail'),
    path('safeguards/', safeguards, name='safeguards_detail'),
    path('return-agoods/', return_a_goods, name='return_agoods_detail'),
    path('contacts/', contact_page, name="contacts_detail"),
]
