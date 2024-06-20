from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST
from urllib.parse import urlparse, parse_qs
from django.core.serializers import serialize
from django.views import View
from django.db.models import Q
from itertools import islice

from .models import (Products,
                     Category,
                     Attribute,
                     ProductAttribute,
                     ProductFilter,
                     FilterGroup,
                     Filter,
                     Manufacturer)

def add_to_cart(request):

    product_id = int(request.GET["id"])
    try:
        product = Products.objects.filter(pk=product_id)
        json_data = list(product.values('id', 'name', 'image', 'price'))[0]

        return JsonResponse(json_data, safe=False)
    except Products.DoesNotExist:
        return JsonResponse(status=404)


def parent_categories(request):
    products = list(Products.objects.order_by('-date_added')[:20].values('name', 'image', 'price', 'pk'))

    first_half = products[:10]
    second_half = products[10:]
    split_products = {
        'first_half': first_half,
        'second_half': second_half
    }

    categories = Category.objects.filter(parent=None)
    return render(request, 'products/index.html', {'categories': categories, 'products': split_products})


def products_view(request):
    products = Products.objects.all()[:20].values('name', 'image', 'price')

    # Преобразование QuerySet в список для сериализации
    products_list = list(products)
    return JsonResponse(products_list, safe=False)


def chunk_queryset(queryset, chunk_size):
    """Разбивает QuerySet на вложенные списки фиксированного размера."""
    iterator = iter(queryset)
    for first in iterator:
        chunk = [first] + list(islice(iterator, chunk_size - 1))
        yield chunk


def sub_categories(request, slug):
    parent_category = get_object_or_404(Category, slug=slug)
    sub_categories = parent_category.children.all()
    products = Products.objects.filter(category_id=parent_category)[:64]

    products_by_sub_category = list(chunk_queryset(products, 8))

    return render(request, 'products/category.html', {'parent_category': parent_category, 'sub_categories': sub_categories, 'products_by_sub_category': products_by_sub_category})

class SubProductView(View):
    template_name = 'products/catalog.html'
    paginate_by = 12

    def get(self, request, slug):
        parent_category = get_object_or_404(Category, slug=slug)
        sub_categories = parent_category.children.all()
        
        descendants = parent_category.get_descendants(include_self=True)
        category_ids = [descendant.pk for descendant in descendants]
        
        products = Products.objects.filter(category_id__in=category_ids)   

        products = products.values('id', 'name', 'image', 'price', 'manufacturer')
        # Пагинация
        paginator = Paginator(products, self.paginate_by)
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)
        

        if request.path == f'/add-filters/{slug}/':
            products_data = list(page_obj)
            json_data = {
                'products': products_data,
                'productsPerPage': paginator.per_page,
                'productsAmount': paginator.count,
                'currentPage': page_obj.number,
            }
            return JsonResponse(json_data)

        filters = self.build_filters(products, parent_category, sub_categories)

        return render(request, self.template_name, {
            'parent_category': parent_category,
            'filters': filters,
        })

    def build_filters(self, products, parent_category, sub_categories):
        products_ids = products.values_list("pk", flat=True)
        product_filters = ProductAttribute.objects.filter(product__in=products_ids)
        
        attributes_dict = {}
        for attr in product_filters:
            attr_name = attr.attribute.name
            if attr_name not in attributes_dict:
                attributes_dict[attr_name] = set()
            attributes_dict[attr_name].add(attr.text if attr.text is not None else "None")

        filters = [{'name': name.upper(), 'text': list(texts)} for name, texts in attributes_dict.items()]
        
        manufacturer = Manufacturer.objects.filter(products__category=parent_category).distinct()
        if manufacturer.exists():
            filters.insert(0, {'name': 'ВИРОБНИК', 'text': list(manufacturer.values_list('name', flat=True))})

        if sub_categories.exists():
            filters.insert(0, {'name': 'ПІДКАТЕГІЯ', 'text': list(sub_categories.values_list('name', flat=True))})

        return filters

def get_new_arrivals(request):
    products = list(Products.objects.order_by('-date_added')[:20].values('name', 'image', 'price', 'pk'))

    paginate_by = request.GET.get('productsPerPage')
    page_number = request.GET.get('page', 1)

    paginator = Paginator(products, paginate_by)
    page_obj = paginator.get_page(page_number)

    products_data = list(page_obj)

    json_data = {
        'products': products_data,
        'productsPerPage': paginator.per_page,
    }
    print(json_data)
    return JsonResponse(json_data)
