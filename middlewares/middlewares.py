# middlewares.py
import csv
import os
from django.conf import settings
from django.http import HttpResponsePermanentRedirect

class RedirectInvalidURLsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.invalid_paths = self.load_invalid_paths()

    def __call__(self, request):
        response = self.get_response(request)
        return self.process_response(request, response)

    def process_response(self, request, response):
        # Срабатывает даже на 404
        if response.status_code == 404:
            path = request.path
            if path in self.invalid_paths:
                print(f'Redirecting invalid path: {path}')
                return HttpResponsePermanentRedirect('/')  # Редирект на главную
        return response

    def load_invalid_paths(self):
        csv_path = os.path.join(settings.BASE_DIR, './invalid_urls.csv')
        print(csv_path)
        invalid = set()
        try:
            with open(csv_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.reader(csvfile)
                for row in reader:
                    if not row:
                        continue
                    url = row[0]
                    if url.startswith('http'):
                        # Преобразуем полный URL в относительный путь
                        path = '/' + url.split('://')[-1].split('/', 1)[-1]
                        if '?' in path:
                            path = path.split('?', 1)[0]
                        invalid.add('/' + path.strip('/'))
                    else:
                        invalid.add(url.strip())
            return invalid
        except FileNotFoundError:
            print('CSV файл не найден!')
            return set()