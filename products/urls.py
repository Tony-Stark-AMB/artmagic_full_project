from django.urls import path
from . import views
from .views import SubProductView, SubCategoriesView, DetaileProductView


urlpatterns = [
    path('', views.parent_categories, name='parent_categories'),
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('get-new-arrivals/', views.get_new_arrivals, name='get_new_arrivals'),
    path('category/<str:slug>/', SubCategoriesView.as_view(), name='sub_categories'),
    path('category/<str:slug>/add-category/', SubCategoriesView.as_view(), name='add_category'),
    path('product/<str:slug>/', SubProductView.as_view(), name='sub_product'),
    path('product/<str:slug>/add-filters/', SubProductView.as_view(), name='add_filters'),
    path('product/detaile-product/<int:id>/', DetaileProductView.as_view(), name='detaile_product'),    
    path('products/', views.products_view, name='products_list'), 
]
