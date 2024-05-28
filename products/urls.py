from django.urls import path
from . import views
from .views import SubProductView

urlpatterns = [
    path('', views.parent_categories, name='parent_categories'),
    path('category/<str:slug>/', views.sub_categories, name='sub_categories'),
    path('product/<str:slug>/', SubProductView.as_view(), name='sub_product'),
    path('products/', views.products_view, name='products_list'),
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('add-filters/<str:slug>/', SubProductView.as_view(), name='add_filters'),
    path('detail/<int:pk>/', views.detail, name='product_detail'),
]