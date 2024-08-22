from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST
from urllib.parse import urlparse, parse_qs
from django.core.serializers import serialize
from django.views import View
from django.db.models import Q
from itertools import islice
from .filters import ProductsFilter
import re  # Обновлено

from .models import (Products,
                     Category,
                     ProductToCategory,  # Обновлено
                     Manufacturer,
                     ProductFilter,  # Обновлено
                     FilterCategory,  # Обновлено
                     FilterValue,
                     ProductImage,
                     CategoryImage,
                     Stocks)  # Обновлено


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
    stocks = Stocks.objects.all()
    return render(request, 'products/index.html', {'categories': categories, 'products': split_products, 'stocks': stocks})


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


class SubCategoriesView(View):
    template_name = 'products/category.html'

    def get(self, request, slug):
        parent_category = get_object_or_404(Category, slug=slug)
        sub_categories = parent_category.children.all()

        descendants = parent_category.get_descendants(include_self=True)
        category_ids = [descendant.pk for descendant in descendants]
        print('=---SubCategoriesView---------------------', category_ids, parent_category.pk,
              len(ProductToCategory.objects.filter(category_id=parent_category.pk).distinct()))
        category_images = CategoryImage.objects.filter(product=parent_category.pk)
        print('---------------------------------------------------------------------------------------------------',
              category_images)

        products = Products.objects.filter(
            producttocategory__category_id__in=category_ids).distinct()  # .values_list('product_id', flat=True) # Обновлено

        brand_ids = products.values_list('manufacturer_id', flat=True).distinct()
        brands = Manufacturer.objects.filter(id__in=brand_ids)[:9]

        if request.headers['Content-Type'] == 'application/json':
            # add-category/<str:slug>/

            print('-----123---', len(products))
            products_values = products.values('id', 'name', 'image', 'price', 'manufacturer')

            # Пагинация
            paginate_by = request.GET.get('productsPerPage', 10)
            paginator = Paginator(products_values, paginate_by)
            page_number = request.GET.get('page', 1)
            page_obj = paginator.get_page(page_number)

            products_data = list(page_obj)
            json_data = {
                'products': products_data,
                'productsPerPage': paginator.per_page,
                'productsAmount': paginator.count,
                'currentPage': page_obj.number,
            }
            return JsonResponse(json_data)

        return render(request, self.template_name, {
            'parent_category': parent_category,
            'sub_categories': sub_categories,
            'category_images': category_images,
            'brands': brands
        })


def alphanumeric_sort(text):
    """Функция для сортировки строк, содержащих как буквы, так и цифры."""

    def convert(text):
        return int(text) if text.isdigit() else text.lower()

    return [convert(c) for c in re.split('([0-9]+)', text)]


class SubProductView(View):
    template_name = 'products/catalog.html'

    def get(self, request, slug):
        parent_category = None

        if slug != 'search':
            parent_category = get_object_or_404(Category, slug=slug)

        if parent_category:
            product_ids = ProductToCategory.objects.filter(category_id=parent_category.pk).values_list('product_id',
                                                                                                       flat=True)
            print('------------------------------------------100------------', len(product_ids))
            products = Products.objects.filter(id__in=product_ids).distinct()
        else:
            products = Products.objects.all().distinct()
        print('------------------------------------------101------------', len(products))
        # , products.filter(filters__filter_value__value="Маркер")
        product_filter = ProductsFilter(request.GET, queryset=products)
        filtered_queryset = product_filter.qs()
        filtered_queryset = filtered_queryset.values('id', 'name', 'image', 'price', 'manufacturer')
        filters = self.build_filters(filtered_queryset)
        print('------------------------------------------filtered_queryset------------', len(filtered_queryset))
        # Пагинация
        paginate_by = request.GET.get('productsPerPage', 10)
        paginator = Paginator(filtered_queryset, paginate_by)
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)

        if request.headers['Content-Type'] == 'application/json':
            products_data = list(page_obj)
            json_data = {
                'products': products_data,
                'productsPerPage': paginator.per_page,
                'productsAmount': paginator.count,
                'currentPage': page_obj.number,
            }
            return JsonResponse(json_data)

        # http://127.0.0.1:8000/product/bloknoti-dlja-esk%D1%96z%D1%96v-ta-maljunku-tverda-obkladinka/

        print('222', filters)
        return render(request, self.template_name, {
            'parent_category': parent_category,
            'filters': filters,
        })

    def build_filters(self, products):
        # Получаем ID продуктов
        products_ids = products.values_list("pk", flat=True)

        # Получаем все фильтры для этих продуктов
        product_filters = ProductFilter.objects.filter(product__in=products_ids).select_related('filter_category',
                                                                                                'filter_value').distinct()

        # Создаем словарь для фильтров
        attributes_dict = {}
        for pf in product_filters:
            category_name = pf.filter_category.name
            value = pf.filter_value.value
            if category_name not in attributes_dict:
                attributes_dict[category_name] = set()
            attributes_dict[category_name].add(value)

        # Преобразуем словарь в список фильтров
        filters = [{'name': name.upper(), 'text': sorted(list(texts), key=alphanumeric_sort)} for name, texts in
                   sorted(attributes_dict.items(), key=lambda x: alphanumeric_sort(x[0]))]

        return filters


def get_new_arrivals(request):
    products = list(Products.objects.order_by('-date_added')[:20].values('name', 'image', 'price', 'pk'))

    paginate_by = request.GET.get('productsPerPage', 10)
    page_number = request.GET.get('page', 1)

    paginator = Paginator(products, paginate_by)
    page_obj = paginator.get_page(page_number)

    # Переименовать ключ 'pk' на 'id'
    products_data = [
        {'name': product['name'], 'image': product['image'], 'price': product['price'], 'id': product['pk']}
        for product in page_obj
    ]

    json_data = {
        'products': products_data,
        'productsPerPage': paginator.per_page,
        'productsAmount': paginator.count,  # Добавить общее количество продуктов
    }
    print(json_data)
    return JsonResponse(json_data)


class DetaileProductView(View):
    template_name = 'products/detaile.html'

    def get(self, request, id):

        product = Products.objects.get(id=id)
        att = ProductFilter.objects.filter(product_id=product.pk)
        print('----------', att)
        images = ProductImage.objects.filter(product=product.pk)
        all_images = self.build_images(product, images)

        return render(request, self.template_name, {'product': product, 'att': att, 'all_images': all_images})

    def build_images(self, product, images):
        all_images = []

        if product.image:
            all_images.append(product.image.url)

        for image in images:
            if image.image:
                all_images.append(image.image.url)
        return all_images