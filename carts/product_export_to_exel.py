import os
from django.http import JsonResponse
from .views import ProcessOrderView
from openpyxl import Workbook
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class GenerateOrderExcelView(ProcessOrderView):

    def get(self, request):
        try:
            # Получение данных из сессии
            order_data = request.session.get('order_data')

            if not order_data:
                return JsonResponse({'status': 'error', 'message': 'Нет данных для создания Excel файла'}, status=400)

            name = order_data.get('name')
            products = order_data.get('products')
            total_price = order_data.get('total_price')

            # Создание Excel файла
            wb = Workbook()
            ws = wb.active
            ws.title = "Order Details"

            # Заголовки столбцов
            ws.append(["Название товара", "Количество", "Цена за единицу", "Общая стоимость"])

            # Заполнение данных о товарах
            for product in products:
                ws.append([
                    product.get('name'),
                    product.get('quantity'),
                    product.get('price'),
                    round(int(product['quantity']) * float(product['price']), 2)
                ])

            # Добавление общей суммы
            ws.append(["", "", "Общая сумма", total_price])

            # Определение пути для сохранения файла
            directory = os.path.join(settings.MEDIA_ROOT, 'orders')
            print(f'Directory path: {directory}')
            if not os.path.exists(directory):
                os.makedirs(directory)
            file_path = os.path.join(directory, f'order_{name}.xlsx')

            # Сохранение файла локально
            wb.save(file_path)

            logger.debug(f'Excel file created and saved at {file_path}')
            return JsonResponse({'status': 'success', 'message': f'Файл успешно сохранен: {file_path}'}, status=200)

        except Exception as e:
            logger.error('Error generating and saving Excel file: %s', e)
            return JsonResponse({'status': 'error', 'message': 'Ошибка при создании и сохранении Excel файла'}, status=500)