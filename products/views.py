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
from django.utils.html import strip_tags
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
from main.models import Carousel, ContactInfo, Informations
from django.conf import settings
from .filters import ProductsFilter
from .utils import alphanumeric_sort, get_sorted_product_attributes


logger = logging.getLogger(__name__)

def get_subcategories(request, parent_id):
    subcategories = Category.objects.filter(parent_id=parent_id)
    data = {
        'subcategories': [{'id': sub.id, 'name': sub.name} for sub in subcategories]
    }
    return JsonResponse(data)


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
        category_id = None
        # category_id = categories[0]['id']
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
    informations = Informations.objects.first()
    
    if informations:
        informations.description = (informations.description or '').replace('&nbsp;', '')


    return render(request, 'products/index.html', {'categories': categories, 'stocks': stocks, 'carousel': carousel, 'informations': informations})

class SubCategoriesView(View):
    template_name = 'products/category.html'

    def get(self, request, slug):
        try:
            parent_category = get_object_or_404(Category, slug=slug)
            parent_category.description = (parent_category.description or '').replace('&nbsp;', '')
            sub_categories = parent_category.children.all()

            breadcrumbs = [
                {'name': 'Головна', 'url': '/'},
                {'name': parent_category.name, 'url': request.path},
            ]

            descendants = parent_category.get_descendants(include_self=True)
            category_ids = [descendant.pk for descendant in descendants]

            products = Products.objects.filter(
                producttocategory__category_id__in=category_ids
            ).distinct()

        except Exception as e:
            logger.error(f"Ошибка при получении данных категории: {e}")
            return JsonResponse({'error': 'Ошибка загрузки данных категории'}, status=500)

        if 'add-category' in request.path:
            try:
                products_values = products.values('id', 'name', 'image', 'price', 'model')
                paginate_by = int(request.GET.get('productsPerPage', 10))
                paginator = Paginator(products_values, paginate_by)
                page_number = request.GET.get('page', 1)
                page_obj = paginator.get_page(page_number)

                products_data = list(page_obj)
                for product in products_data:
                    if product.get('image'):
                        product['image'] = "/media/" + product['image']
                    else:
                        product['image'] = ""

                json_data = {
                    'products': products_data,
                    'productsPerPage': paginator.per_page,
                    'productsAmount': paginator.count,
                    'currentPage': page_obj.number,
                }
                return JsonResponse(json_data)
            except Exception as e:
                logger.error(f"Ошибка при обработке продуктов или пагинации: {e}")
                return JsonResponse({'error': 'Ошибка загрузки продуктов'}, status=500)
        else:
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
        searchquery = request.GET.get('query', '')

        if slug != 'search':
            parent_category = get_object_or_404(Category, slug=slug)
            parent_category.description = (parent_category.description or '').replace('&nbsp;', '')
            

        if parent_category:
            product_ids = ProductToCategory.objects.filter(category_id=parent_category.pk).values_list('product_id',
                                                                                                       flat=True)
            
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

        product_filter = ProductsFilter(request.GET, queryset=products)
        filtered_queryset = product_filter.qs()
        filtered_queryset = filtered_queryset.values('id', 'name', 'image', 'price', 'model')
        filters = self.build_filters(filtered_queryset)
        

        if len(filtered_queryset)==0:
            return render(request, 'products/not_find_products.html', {
                'parent_category': parent_category,
                'filters': filters,
                'breadcrumbs': breadcrumbs,
                'searchquery': searchquery,
            })
        
        # Пагинация
        paginate_by = request.GET.get('productsPerPage', 10)
        paginator = Paginator(filtered_queryset, paginate_by)
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)
        
        if 'add-filters' in request.path:
        # if request.headers.get('Accept', '') == 'application/json':
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


        print('222', filters)
        return render(request, self.template_name, {
            'parent_category': parent_category,
            'filters': filters,
            'breadcrumbs': breadcrumbs,
            'searchquery': searchquery,
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
            product['image'] = "/static/product-placeholder.png"
        else:
            product['image'] = "/media/" + product['image']
    json_data = {
        'products': products_data,
        'productsPerPage': paginator.per_page,
        'productsAmount': paginator.count,  # Добавить общее количество продуктов
    }
    return JsonResponse(json_data)


class DetaileProductView(View):
    template_name = 'products/detaile.html'

    def get(self, request, id):        
        
        product = get_object_or_404(Products, id=id)
        product.description = (product.description or '').replace('&nbsp;', '')
        product_attribute = ProductFilter.objects.filter(product_id=product.pk)
        
        attributes = get_sorted_product_attributes(product_attribute)

        images = ProductImage.objects.filter(product=product.pk)
        all_images = self.build_images(product, images)
        
        categories = ProductToCategory.objects.filter(product_id=product.id).select_related('category_id')
        breadcrumbs = self.get_breadcrumbs(categories)

        if product.image:
            image_address = f"https://artmagic.com.ua/media/{product.image}"
        else:
            image_address = "https://artmagic.com.ua/static/product-placeholder.png"

        brand = ProductFilter.objects.filter(product_id=product.id, filter_category=4).first()
        brand_name = brand.filter_value.value if brand else ""        
        description = product.description if product.description else ""
        prod_quantity = "https://schema.org/InStock" if product.quantity > 0 else "https://schema.org/PreOrder"

        context = {
            'product': product,
            'description': description,
            'prod_quantity': prod_quantity,
            'attributes': attributes,
            'all_images': all_images,
            'breadcrumbs': breadcrumbs,
            'image_address': image_address,
            'brand_name': brand_name
        }

        return render(request, self.template_name, context=context)

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
        parent = categories[0].category_id.parent

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

from django.http import HttpResponse
import xml.etree.ElementTree as ET

def generate_google_merchant_feed(request):
    
    rss = ET.Element("rss", attrib={"version": "2.0", "xmlns:g": "http://base.google.com/ns/1.0"})
    channel = ET.SubElement(rss, "channel")
    
    ET.SubElement(channel, "title").text = "Артмагія"
    ET.SubElement(channel, "link").text = "https://artmagic.com.ua"
    ET.SubElement(channel, "description").text = "Ми працюємо для вас з 2008 року і вже завоювали серця клієнтів по всій Україні. Ми найбільш цікавий продавець художніх матеріалів для всіх, хто займається творчістю. Ми можемо задовольнити всі творчі потреби художників, студентів, дизайнерів, аматорів, у нас є все для хобі. Ми надихаємо людей займатися улюбленою справою."

    products = Products.objects.filter(quantity__isnull=False, quantity__gt=0)    
    product_ids = [p.id for p in products]

    brand_filters = ProductFilter.objects.filter(filter_category_id=4).select_related('filter_value')
    brand_dict = {pf.product_id: pf.filter_value.value for pf in brand_filters}


    product_categories = ProductToCategory.objects.filter(
        product_id__in=product_ids
    ).select_related('category_id__parent')
    category_dict = {}
    for pc in product_categories:
        if pc.product_id_id not in category_dict:
            parent = pc.category_id.parent
            category_dict[pc.product_id_id] = (
                f"{parent.name} > {pc.category_id.name}" 
                if parent 
                else ''
            )

    for product in products:
        item = ET.SubElement(channel, "item")

        image = f'https://artmagic.com.ua/media/{str(product.image)}'
        no_image = f'https://artmagic.com.ua/static/product-placeholder.png'

        brand_name = brand_dict.get(product.id, "")
        result_category = category_dict.get(product.id, "")

        ET.SubElement(item, "g:id").text = str(product.id)
        ET.SubElement(item, "g:title").text = product.name
        ET.SubElement(item, "g:description").text = str(strip_tags(product.description))[:500] if product.description else ''
        ET.SubElement(item, "g:link").text = f'https://artmagic.com.ua/product/detaile-product/{product.id}/'
        ET.SubElement(item, "g:image_link").text = image if product.image else no_image
        ET.SubElement(item, "g:price").text = f'{product.price} UAH'
        ET.SubElement(item, "g:product_type").text = result_category
        ET.SubElement(item, "g:brand").text = brand_name
        ET.SubElement(item, "g:availability").text = 'in_stock'

    tree = ET.ElementTree(rss)

    response = HttpResponse(content_type='application/xml')
    tree.write(response, encoding="UTF-8", xml_declaration=True)
    return response


def tr_handler404(request, exception):
    """
    Обработка ошибки 404
    """
    return render(request=request, template_name='products/error_page.html', status=404, context={
        'title': 'Сторінку не знайдено',
        'error_message': 'Неправильно набрано адресу або такої сторінки на сайті більше не існує.',
    })


def tr_handler500(request):
    """
    Обработка ошибки 500
    """
    return render(request=request, template_name='products/error_page.html', status=500, context={
        'title': 'Помилка сервера',
        'error_message': 'На сервері сталася помилка. Спробуйте оновити сторінку або повернутися трохи пізніше.',
    })