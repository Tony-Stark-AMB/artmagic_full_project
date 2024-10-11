from django.urls import path
from . import views
from .views import SubProductView, SubCategoriesView, DetaileProductView
# , SyncProductsAPIView
from .views import sync_products, fetch_products_from_1c

urlpatterns = [
    path('', views.parent_categories, name='parent_categories'),
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('get-new-arrivals/', views.get_new_arrivals, name='get_new_arrivals'),
    path('category/<str:slug>/', SubCategoriesView.as_view(), name='sub_categories'),
    path('category/<str:slug>/add-category/', SubCategoriesView.as_view(), name='add_category'),
    path('product/<str:slug>/', SubProductView.as_view(), name='sub_product'),
    path('product/<str:slug>/add-filters/', SubProductView.as_view(), name='add_filters'),
    path('product/detaile-product/<int:id>/', DetaileProductView.as_view(), name='detaile_product'),    
    path('product/<str:slug>/', SubProductView.as_view(), name='search_products'),  # Новый URL для поиска
    path('get-filter-data/<int:group_id>/', views.get_filter_data, name='get_filter_data'),
        # path('sync_products/', SyncProductsAPIView.as_view(), name='sync_products'),
    path('sync-products/', views.sync_products, name='sync_products'),  # для приема данных из 1С
    path('fetch-products-from-1c/', views.fetch_products_from_1c, name='fetch_products_from_1c'),
    # для получения данных из 1С
]
