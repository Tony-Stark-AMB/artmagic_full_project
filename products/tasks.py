from celery import shared_task
import requests
from .models import Products
from .serializers import ProductSerializer
import logging

logger = logging.getLogger(__name__)

@shared_task
def fetch_products_from_1c_task():
    """
    Фоновая задача для получения данных о продуктах от 1С и их синхронизации с базой данных.
    """
    url = "https://api-1c.com/products"  # Укажите реальный URL 1С
    try:
        response = requests.get(url)
        response.raise_for_status()
        products_data = response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch data from 1C: {str(e)}")
        return {'status': f'Failed to fetch data from 1C: {str(e)}'}

    # Проходим по каждому продукту и обновляем или создаем его
    for product_data in products_data:
        try:
            product = Products.objects.get(model=product_data.get('model'))
        except Products.DoesNotExist:
            product = Products()

        serializer = ProductSerializer(product, data=product_data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            logger.error(f"Error updating product {product.model if product.model else 'new'}: {serializer.errors}")

    return {'status': 'Products synchronized successfully'}