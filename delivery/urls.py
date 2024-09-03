from django.urls import path
from .views import delivery_options, get_branches_and_postomats, get_cities, get_regions


urlpatterns = [
    path('options/', delivery_options, name='delivery_options'),
    path('api/get_branches_and_postomats/', get_branches_and_postomats, name='get_branches_and_postomats'),
    path('api/get_cities/', get_cities, name='get_cities'),
    path('api/get_regions/', get_regions, name='get_regions'),
]
