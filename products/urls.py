from django.urls import path
from . import views
from .views import SubProductView, SubCategoriesView

urlpatterns = [
    path('', views.parent_categories, name='parent_categories'),
    path('category/<str:slug>/', SubCategoriesView.as_view(), name='sub_categories'),
    path('product/<str:slug>/', SubProductView.as_view(), name='sub_product'),
    path('products/', views.products_view, name='products_list'),
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('add-filters/<str:slug>/', SubProductView.as_view(), name='add_filters'),
    path('add-category/<str:slug>/', SubCategoriesView.as_view(), name='add_category'),
    path('get-new-arrivals/', views.get_new_arrivals, name='get_new_arrivals'),
]