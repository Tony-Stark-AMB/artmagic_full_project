import re  # Обновлено
from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views import View
from rest_framework.views import APIView
from .serializers import ProductSerializer
from rest_framework import status
from rest_framework.response import Response

import requests
import logging
from rest_framework.decorators import api_view
from itertools import islice

from .models import (Products,
                     Category,
                     ProductToCategory,  # Обновлено
                     Manufacturer,
                     ProductFilter,  # Обновлено
                     FilterCategory,  # Обновлено
                     FilterValue,
                     ProductImage,
                     Stocks)  # Обновлено
from main.models import Carousel
from .filters import ProductsFilter
from .serializers import ProductSerializer
from .tasks import fetch_products_from_1c_task


logger = logging.getLogger(__name__)

def alphanumeric_sort(text):
    """Функция для сортировки строк, содержащих как буквы, так и цифры."""

    def convert(text):
        return int(text) if text.isdigit() else text.lower()

    return [convert(c) for c in re.split('([0-9]+)', text)]


from django.http import JsonResponse
from .models import FilterCategory, ProductFilter

from django.http import JsonResponse

def get_filter_data(request, group_id):
    product_id = request.GET.get('product_id')
    category_id = request.GET.get('category_id')
    value_id = request.GET.get('value_id')

    # Получаем все категории фильтров для данной группы
    filter_categories = FilterCategory.objects.filter(group_id=group_id).order_by('name')
    
    # Определяем предустановленное значение для категорий и значений
    selected_category_id = None
    selected_value_id = None

    if product_id:
        if category_id and value_id:
            try:
                product_filter = ProductFilter.objects.get(product_id=product_id, filter_category_id=category_id, filter_value_id=value_id)
                selected_category_id = product_filter.filter_category_id
                selected_value_id = product_filter.filter_value_id
                # print('~~~~~~~~', selected_category_id, '--------selected_category_id-----selected_value_id-------', selected_value_id)
            except ProductFilter.DoesNotExist:
                pass

        # if value_id:
        #     try:
        #         selected_value = ProductFilter.objects.get(product_id=product_id, filter_category_id=category_id, filter_value_id = value_id)
        #         print('---', selected_value)
        #         selected_value_id = selected_value.filter_value_id
        #     except ProductFilter.DoesNotExist:
        #         pass
        

    categories = [{'id': category.id, 'name': category.name, 'selected': category.id == selected_category_id} for category in filter_categories]
    # Получаем все значения фильтров для выбранной категории, если она указана
    values = []

    if not category_id:
        category_id = categories[0]['id']

    filter_values = FilterValue.objects.filter(category_id=category_id)
    sorted_filter_values = sorted(filter_values, key=lambda fv: alphanumeric_sort(fv.value))
    values = [{'id': value.id, 'value': value.value, 'selected': value.id == selected_value_id} for value in sorted_filter_values]

    # print('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', values)
    return JsonResponse({'categories': categories, 'values': values})



# def get_filter_values(request, category_id):
#     product_id = request.GET.get('product_id')
    
#     # Получаем все значения фильтра для данной категории
#     filter_values = FilterValue.objects.filter(category_id=category_id)
#     sorted_filter_values = sorted(filter_values, key=lambda fv: alphanumeric_sort(fv.value))
    
#     # Определяем предустановленное значение, если есть выбранное для этого продукта
#     selected_value_id = None
#     if product_id:
#         try:
#             value_id = request.GET.get('value_id')

#             if value_id:
#                 selected_value = ProductFilter.objects.get(product_id=product_id, filter_category_id=category_id, filter_value_id = value_id)
#                 selected_value_id = selected_value.filter_value_id
#             else:
#                 selected_value_id = None
#         except ProductFilter.DoesNotExist:
#             pass

#     # Формируем массив значений фильтра
#     values = [{'id': value.id, 'value': value.value, 'selected': value.id == selected_value_id} for value in sorted_filter_values]
#     return JsonResponse({'values': values})

def add_to_cart(request):
    product_id = int(request.GET["id"])
    try:
        product = Products.objects.filter(pk=product_id)

        json_data = list(product.values('id', 'name', 'image', 'price', 'model'))[0]
        if not json_data['image']:
            json_data['image']
        else:
            json_data['image'] = "/media/" + json_data['image']
        return JsonResponse(json_data, safe=False)
    except Products.DoesNotExist:
        return JsonResponse(status=404)


def parent_categories(request):
    categories = Category.objects.filter(parent=None)
    stocks = Stocks.objects.all()
    carousel = Carousel.objects.all()
    return render(request, 'products/index.html', {'categories': categories, 'stocks': stocks, 'carousel': carousel})

class SubCategoriesView(View):
    template_name = 'products/category.html'

    def get(self, request, slug):
        parent_category = get_object_or_404(Category, slug=slug)
        sub_categories = parent_category.children.all()
        breadcrumbs = [
            {'name': 'Головна', 'url': '/'},
            {'name': parent_category.name, 'url': request.path},  # Текущая категория
        ]


        descendants = parent_category.get_descendants(include_self=True)
        category_ids = [descendant.pk for descendant in descendants]
        
        print('=---SubCategoriesView---------------------', category_ids, parent_category.pk,
              len(ProductToCategory.objects.filter(category_id=parent_category.pk).distinct()))
        

        products = Products.objects.filter(
            producttocategory__category_id__in=category_ids).distinct()  # .values_list('product_id', flat=True) # Обновлено


        if request.headers['Content-Type'] == 'application/json':
            # add-category/<str:slug>/

            print('-----123---', len(products))
            products_values = products.values('id', 'name', 'image', 'price', 'model')

            # Пагинация
            paginate_by = request.GET.get('productsPerPage', 10)
            paginator = Paginator(products_values, paginate_by)
            page_number = request.GET.get('page', 1)
            page_obj = paginator.get_page(page_number)

            products_data = list(page_obj)
            for product in products_data:
                if not product['image']:
                    product['image']
                else:
                    product['image'] = "/media/" + product['image']
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
            'breadcrumbs': breadcrumbs
        })


class SubProductView(View):
    template_name = 'products/catalog.html'

    def get(self, request, slug):
        parent_category = None
        breadcrumbs = [{'name': 'Головна', 'url': '/'}]

        if slug != 'search':
            parent_category = get_object_or_404(Category, slug=slug)
            

        if parent_category:
            product_ids = ProductToCategory.objects.filter(category_id=parent_category.pk).values_list('product_id',
                                                                                                       flat=True)
            print('------------------------------------------100------------', len(product_ids))
            parent_of_parent_category = parent_category.parent
            products = Products.objects.filter(id__in=product_ids).distinct()
            if parent_of_parent_category:
                breadcrumbs.append({'name': parent_of_parent_category.name, 'url': parent_of_parent_category.get_absolute_url()})

            breadcrumbs.append({'name': parent_category.name, 'url': request.path})
        else:
            products = Products.objects.all().distinct()
            breadcrumbs = [
                {'name': 'Головна', 'url': '/'},
                {'name': "Пошук", 'url': ''},  # Текущая категория
            ]
        print('------------------------------------------101------------', len(products))
        # , products.filter(filters__filter_value__value="Маркер")
        product_filter = ProductsFilter(request.GET, queryset=products)
        filtered_queryset = product_filter.qs()
        filtered_queryset = filtered_queryset.values('id', 'name', 'image', 'price', 'model')
        filters = self.build_filters(filtered_queryset)
        print('------------------------------------------filtered_queryset------------', len(filtered_queryset))
        # Пагинация
        paginate_by = request.GET.get('productsPerPage', 10)
        paginator = Paginator(filtered_queryset, paginate_by)
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)

        if request.headers['Content-Type'] == 'application/json':
            products_data = list(page_obj)
            for product in products_data:
                if not product['image']:
                    product['image']
                else:
                    product['image'] = "/media/" + product['image']
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
            'breadcrumbs': breadcrumbs
        })

    def build_filters(self, products):
        # Получаем ID продуктов
        products_ids = products.values_list("pk", flat=True)

        # Получаем все фильтры для этих продуктов
        product_filters = ProductFilter.objects.filter(product__in=products_ids).select_related('filter_category', 'filter_value').distinct()

        # Создаем словарь для фильтров
        attributes_dict = {}

        for pf in product_filters:
            category_name = pf.filter_category.name
            filter_id = pf.filter_value.id  # Получаем id фильтра
            value = pf.filter_value.value  # Получаем значение фильтра

            # Инициализируем список, если фильтров для этой категории еще нет
            if category_name not in attributes_dict:
                attributes_dict[category_name] = set()

            # Добавляем кортеж (id, value) в соответствующую категорию
            attributes_dict[category_name].add((filter_id, value))

        # Преобразуем словарь в список фильтров
        filters = [{
            'name': name.upper(),
            'text': sorted(list(texts), key=lambda x: alphanumeric_sort(x[1]))  # сортируем по value, а не по id
        } for name, texts in sorted(attributes_dict.items(), key=lambda x: alphanumeric_sort(x[0]))]

        print('///////////////', filters)
        return filters


def get_new_arrivals(request):
    products = list(Products.objects.order_by('-date_added')[:20].values('name', 'image', 'price', 'pk', 'model'))

    paginate_by = request.GET.get('productsPerPage', 10)
    page_number = request.GET.get('page', 1)

    paginator = Paginator(products, paginate_by)
    page_obj = paginator.get_page(page_number)

    # Переименовать ключ 'pk' на 'id'
    products_data = [
        {'name': product['name'], 'image': product['image'], 'price': product['price'], 'id': product['pk']}
        for product in page_obj
    ]
    for product in products_data:
        if not product['image']:
            product['image']
        else:
            product['image'] = "/media/" + product['image']
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
        print('----------', id)
        images = ProductImage.objects.filter(product=product.pk)
        all_images = self.build_images(product, images)
        
        categories = ProductToCategory.objects.filter(product_id=product).select_related('category_id')
        breadcrumbs = self.get_breadcrumbs(categories)

        return render(request, self.template_name, {'product': product, 'att': att, 'all_images': all_images, 'breadcrumbs': breadcrumbs})

    def build_images(self, product, images):
        all_images = []

        if product.image:
            all_images.append(product.image.url)

        for image in images:
            if image.image:
                all_images.append(image.image.url)
        return all_images
    
    def get_breadcrumbs(self, categories):
        breadcrumbs = [{'name': 'Головна', 'url': '/'}]
        print('categories', categories)
        parent = categories[0].category_id.parent
        print('parent', parent)
        breadcrumbs.append({
            'name': parent.name,
            'url': parent.get_absolute_url()})
        print('breadcrumbs', breadcrumbs)
        for category_to_product in categories:
            category = category_to_product.category_id
            print("category", category)            
                
            if not any(b['name'] == category.name and b['url'] == f'/product/{category.slug}/' for b in breadcrumbs):
                breadcrumbs.append({
                    'name': category.name,
                    'url': f'/product/{category.slug}/'
                })
        breadcrumbs.append({
                    'name': '',
                    'url': ''
                })
        print(breadcrumbs)        
        return breadcrumbs
    

from unidecode import unidecode    
from django.utils.text import slugify
@api_view(['POST'])
def sync_products(request):
    print('***************************************************************************')
    """
    Получение данных от 1С и отправка задачи на обновление записей в базе данных через Celery.
    """
    data = request.data
    for product_data in data:
        # Предполагаем, что product_data - это словарь с данными продукта
        try:
            product = Products.objects.get(model=product_data.get('model'))
        except Products.DoesNotExist:
            product = Products()
            
        serializer = ProductSerializer(product, data=product_data, partial=True)

        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response({'status': 'Products synchronized successfully'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def fetch_products_from_1c(request):
    print('------------------------------------------------------------------------')
    """
    Отправка задачи на синхронизацию данных о продуктах от 1С в Celery для фоновой обработки.
    """
    # Запускаем задачу через Celery
    
    task = fetch_products_from_1c_task.delay()

    # Возвращаем ответ, что задача запущена
    return Response({'status': 'Task started', 'task_id': task.id}, status=status.HTTP_200_OK)

# class SyncProductsAPIView(APIView):


#     def post(self, request):

#         data = request.data
#         model_value = data.get('model')  # Получаем значение артикула (model)


#         '''Не забыть добавить обработку имени для поля slug'''
#         name_value = data.get('name')  # Получаем значение name для slug
#         '''_______________________________________________________________'''

#         if model_value is None:
#             return Response({'error': 'Model (SKU) is required.'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             product = Products.objects.get(model=model_value)  # Ищем продукт по артикулу (model)
#         except Products.DoesNotExist:
#             product = Products(model=model_value)  # Создаем новый продукт, если не найден

#         # Обновляем или создаем продукт
#         serializer = ProductSerializer(product, data=data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'status': 'Product updated successfully'}, status=status.HTTP_200_OK)
#         else:
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#     def get(self, request):
#         """
#         Получение данных от API 1С и обновление БД.
#         Этот метод отправляет запрос к 1С для получения всех продуктов и синхронизации их в БД.
#         """
#         # URL API 1С
#         onec_api_url = 'https://example.com/api/products'  # Замените на реальный URL API 1С

#         try:
#             # Отправляем GET-запрос к 1С
#             response = request.get(onec_api_url)
#             response.raise_for_status()  # Если ответ не 200, выбросит исключение

#             # Получаем данные продуктов из ответа
#             products_data = response.json()

#             # Обновляем или создаем продукты на основе данных от 1С
#             for product_data in products_data:
#                 try:
#                     product = Products.objects.get(slug=product_data.get('slug'))
#                 except Products.DoesNotExist:
#                     product = Products()

#                 serializer = ProductSerializer(product, data=product_data, partial=True)
#                 if serializer.is_valid():
#                     serializer.save()
#                 else:
#                     print(f"Error updating product {product.slug}: {serializer.errors}")

#             return Response({'status': 'Products synchronized successfully'}, status=status.HTTP_200_OK)

#         except request.exceptions.RequestException as e:
#             # Если не удалось подключиться к API 1С
#             print(f"Failed to fetch data from 1C: {e}")
#             return Response({'status': 'Failed to fetch data from 1C'}, status=status.HTTP_400_BAD_REQUEST)