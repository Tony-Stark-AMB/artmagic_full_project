import re  # Обновлено
import json
from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views import View
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from unidecode import unidecode    
from django.utils.text import slugify
from rest_framework.decorators import api_view
from rest_framework.exceptions import PermissionDenied

import logging


from .models import (Products,
                     Category,
                     ProductToCategory,  # Обновлено
                     Manufacturer,
                     ProductFilter,  # Обновлено
                     FilterCategory,  # Обновлено
                     FilterValue,
                     ProductImage,
                     Stocks)  # Обновлено
from main.models import Carousel, ContactInfo
from django.conf import settings
from .filters import ProductsFilter


logger = logging.getLogger(__name__)

def alphanumeric_sort(text):
    """Функция для сортировки строк, содержащих как буквы, так и цифры."""

    def convert(text):
        return int(text) if text.isdigit() else text.lower()

    return [convert(c) for c in re.split('([0-9]+)', text)]


from django.http import JsonResponse
from .models import FilterCategory, ProductFilter

from django.http import JsonResponse

def get_subcategories(request, parent_id):
    subcategories = Category.objects.filter(parent_id=parent_id)
    data = {
        'subcategories': [{'id': sub.id, 'name': sub.name} for sub in subcategories]
    }
    return JsonResponse(data)

from django.http import JsonResponse
from .models import FilterCategory, FilterValue, ProductFilter




def update_filter_data_on_change(request, group_id):
    # Получаем данные из запроса
    product_id = request.GET.get('product_id')
    category_id = request.GET.get('category_id')
    value_id = request.GET.get('value_id')
    # Устанавливаем выбранную категорию и значение, если они указаны
    selected_category_id = int(category_id) if category_id else None
    selected_value_id = int(value_id) if value_id else None

    # Получаем категории фильтров, связанные с группой
    if group_id == 0:
        filter_categories = FilterCategory.objects.all().order_by('name')
    else:
        filter_categories = FilterCategory.objects.filter(group_id=group_id).order_by('name')

    # Формируем список категорий, выделяя выбранную категорию
    categories = [{
        'id': category.id,
        'name': category.name,
        'selected': category.id == selected_category_id
    } for category in filter_categories]
    if not category_id:
        category_id = categories[0]['id']
    # Получаем значения фильтров только для выбранной категории, если она указана
    values = []
    if category_id:
        filter_values = FilterValue.objects.filter(category_id=category_id)
        sorted_filter_values = sorted(filter_values, key=lambda fv: alphanumeric_sort(fv.value))
        values = [{
            'id': value.id,
            'value': value.value,
            'selected': value.id == selected_value_id
        } for value in sorted_filter_values]

    # Возвращаем категории и значения в формате JSON
    return JsonResponse({'categories': categories, 'values': values})



def load_initial_filter_data(request, group_id):
    # Получаем данные из запроса
    product_id = request.GET.get('product_id')
    category_id = request.GET.get('category_id')
    value_id = request.GET.get('value_id')
    # Проверка на наличие выбранного значения категории
    selected_category_id = int(category_id) if category_id else None
    selected_value_id = int(value_id) if value_id else None

    # Получаем список категорий фильтров, связанных с текущей группой
    if group_id == 0:
        filter_categories = FilterCategory.objects.all().order_by('name')
    else:
        filter_categories = FilterCategory.objects.filter(group_id=group_id).order_by('name')

    # Если product_id, category_id и value_id указаны, проверяем, есть ли такая запись в ProductFilter
    if product_id and category_id and value_id:
        try:
            product_filter = ProductFilter.objects.get(
                product_id=product_id, 
                filter_category_id=category_id, 
                filter_value_id=value_id
            )
            # Устанавливаем выбранные категории и значения
            selected_category_id = product_filter.filter_category_id
            selected_value_id = product_filter.filter_value_id
        except ProductFilter.DoesNotExist:
            # Если не найдено, ничего не меняем, используем текущие значения
            print("ProductFilter для указанных данных не найден.")

    # Формируем список категорий с учетом выбранной
    categories = [{
        'id': category.id,
        'name': category.name,
        'selected': category.id == selected_category_id
    } for category in filter_categories]
    
    # Получаем значения для выбранной категории, если она указана
    values = []
    if category_id:
        filter_values = FilterValue.objects.filter(category_id=category_id)
        sorted_filter_values = sorted(filter_values, key=lambda fv: alphanumeric_sort(fv.value))
        values = [{
            'id': value.id,
            'value': value.value,
            'selected': value.id == selected_value_id
        } for value in sorted_filter_values]
    # Возвращаем категории и значения в формате JSON
    return JsonResponse({'categories': categories, 'values': values})

def add_to_cart(request):
    product_id = int(request.GET["id"])
    try:
        product = get_object_or_404(Products, pk=product_id)
        
        json_data = {
            'id': product.id,
            'name': product.name,
            'image': f'{product.image}' if not product.image else f'/media/{product.image}',
            'price': product.price,
            'model': product.model,
            'storageQuantity': product.quantity,
            'preorder': None
        }
        print(json_data)
        return JsonResponse(json_data, safe=False)
    except Products.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)


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
            print('---------------------------------------', parent_category.pk)
            

        if parent_category:
            product_ids = ProductToCategory.objects.filter(category_id=parent_category.pk).values_list('product_id',
                                                                                                       flat=True)
            print('------------------------------------------100------------', len(product_ids))
            parent_of_parent_category = parent_category.parent
            products = Products.objects.filter(id__in=product_ids).distinct()
            print('------------------------------------------10,01------------', len(products))
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
        product_filter = ProductsFilter(request.GET, queryset=products)
        filtered_queryset = product_filter.qs()
        filtered_queryset = filtered_queryset.values('id', 'name', 'image', 'price', 'model')
        filters = self.build_filters(filtered_queryset)
        print('------------------------------------------filtered_queryset------------', len(filtered_queryset))
        

        if len(filtered_queryset)==0:
            return render(request, 'products/not_find_products.html')
        
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

        # print('///////////////', filters)
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
        if not categories:
            breadcrumbs.append({'name': '', 'url': ''})
            return breadcrumbs
        print('-----------------------------------------------------categories', categories)
        parent = categories[0].category_id.parent
        print('-----------------------------------------------------parent', parent)

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



@api_view(['POST'])
def upsert_product(request):
    # Проверка специального ключа для 1С


    onec_api_key = request.headers.get('X-1C-API-Key')
    if not onec_api_key or onec_api_key != settings.ONEC_API_KEY:
        raise PermissionDenied('Invalid 1C API key')

    try:
        # Получаем сырые данные
        byte_string = request.body
        logger.debug(f"Received raw data length: {len(byte_string)}")

        try:
            # Декодируем и очищаем данные
            raw_data = byte_string.decode('utf-8')
            
            # Очищаем JSON от проблемных символов
            raw_data = raw_data.replace('\n', '')
            raw_data = raw_data.replace('\r', '')
            raw_data = raw_data.replace('\t', '')
            raw_data = re.sub(r'\s*,\s*]', ']', raw_data)  # Убираем запятую перед закрывающей скобкой
            raw_data = re.sub(r',\s*}', '}', raw_data)     # Убираем запятую перед закрывающей фигурной скобкой
            
            # Проверяем, что JSON начинается и заканчивается правильно
            raw_data = raw_data.strip()
            if not raw_data.startswith('['):
                raw_data = '[' + raw_data
            if not raw_data.endswith(']'):
                raw_data = raw_data + ']'

            logger.debug(f"Cleaned data: {raw_data[:200]}...")  # Логируем первые 200 символов

            try:
                # Пробуем распарсить JSON
                data = json.loads(raw_data)
                logger.debug("JSON successfully parsed")
            except json.JSONDecodeError as e:
                # Если не получилось, пробуем исправить возможные проблемы
                logger.error(f"First JSON parse attempt failed: {str(e)}")
                
                # Попытка исправить проблемы с JSON
                raw_data = re.sub(r'}\s*{', '},{', raw_data)  # Исправляем отсутствующие запятые между объектами
                raw_data = re.sub(r'\}\s*\]', '}]', raw_data)  # Убираем пробелы перед закрывающей скобкой
                
                # Пробуем снова распарсить
                data = json.loads(raw_data)
                logger.debug("JSON parsed after cleanup")

        except UnicodeDecodeError as e:
            logger.error(f"Unicode decode error: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Unable to decode data',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        # Проверяем результат
        if not isinstance(data, list):
            data = [data]

        responses = []
        success_count = 0
        error_count = 0

        for product_data in data:
            try:
                if not product_data.get('model'):
                    error_count += 1
                    responses.append({
                        'status': 'error',
                        'message': 'Model is required',
                        'data': product_data
                    })
                    continue
                
                model = product_data.get('model')
                name = product_data.get('name', '').strip()

                # Безопасное преобразование числовых значений
                try:
                    price = float(product_data.get('price', 0))
                except (ValueError, TypeError):
                    price = 0
                    logger.warning(f"Invalid price for model {model}")

                try:
                    quantity = float(product_data.get('quantity', 0))
                except (ValueError, TypeError):
                    quantity = 0
                    logger.warning(f"Invalid quantity for model {model}")

                product, created = Products.objects.update_or_create(
                    model=model,
                    defaults={
                        'slug': slugify(unidecode(name)),
                        'name': name,
                        'price': price,
                        'quantity': quantity
                    }
                )

                success_count += 1
                responses.append({
                    'status': 'success',
                    'message': f'Product {model} was {"created" if created else "updated"}',
                    'product_id': product.id
                })

            except Exception as e:
                error_count += 1
                logger.error(f"Error processing product {model}: {str(e)}")
                responses.append({
                    'status': 'error',
                    'message': 'Error processing product',
                    'error': str(e),
                    'data': product_data
                })

        return Response({
            'status': 'completed',
            'summary': {
                'total': len(responses),
                'successful': success_count,
                'failed': error_count
            },
            'details': responses
        })

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        # Возвращаем больше информации для отладки
        return Response({
            'status': 'error',
            'message': 'Invalid JSON format',
            'error': str(e),
            'received_data': raw_data[:500] if 'raw_data' in locals() else None,
            'error_position': {
                'line': e.lineno,
                'column': e.colno,
                'char_position': e.pos
            }
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Unexpected error during processing',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)