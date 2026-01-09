from django.urls import path
from django.views.decorators.cache import cache_page
from django.contrib.sitemaps.views import sitemap
from .sitemaps import StaticViewSitemap, CategorySitemap, ProductSitemap, SubCategorySitemap

from . import views
from .views import SubProductView, SubCategoriesView, DetaileProductView
# , SyncProductsAPIView

sitemaps = {
    'static': StaticViewSitemap,      # Главная и о нас
    'categories': CategorySitemap,   # Категории
    'sub_categories': SubCategorySitemap,
    'products': ProductSitemap       # Продукты
}

urlpatterns = [
    path('', views.parent_categories, name='parent_categories'),
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('get-new-arrivals/', views.get_new_arrivals, name='get_new_arrivals'),
    path('category/<str:slug>/', SubCategoriesView.as_view(), name='sub_categories'),
    path('category/<str:slug>/add-category/', SubCategoriesView.as_view(), name='add_category'),
    path('product/<str:slug>/', SubProductView.as_view(), name='sub_product'),
    path('product/<str:slug>/add-filters/', SubProductView.as_view(), name='add_filters'),
    path('product/detaile-product/<int:id>/', DetaileProductView.as_view(), name='detaile_product'),
    path('get-subcategories/<int:parent_id>/', views.get_subcategories, name='get_subcategories'),
    path('load-initial-filter-data/<int:group_id>/', views.load_initial_filter_data, name='load_initial_filter_data'),
    path('update-filter-data-on-change/<int:group_id>/', views.update_filter_data_on_change, name='update_filter_data_on_change'),
    path('sync-products/', views.upsert_product, name='sync_products'),  # для приема данных из 1С
    path('sitemap.xml', cache_page(60 * 60)(sitemap), {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    # для получения данных из 1С
    path('products-feed.xml', cache_page(60 * 60)(views.generate_google_merchant_feed), name='google_merchant_feed'),
]
