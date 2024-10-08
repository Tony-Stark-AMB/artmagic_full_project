from django.urls import path
from carts.views import ProcessOrderView
from carts import views

app_name = 'carts'

urlpatterns = [
    path('process-order/', ProcessOrderView.as_view(), name='process_order'),
]