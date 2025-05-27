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
        if response.status_code == 404:
            path = self.normalize_path(request.get_full_path())

            if path in self.invalid_paths:
                print(f'[Redirecting] {request.get_full_path()} → {path}')
                return HttpResponsePermanentRedirect('/')
        return response

    def load_invalid_paths(self):
        csv_path = os.path.join(settings.BASE_DIR, 'invalid_urls.csv')
        print(f'[Middleware INIT] Loading from: {csv_path}')
        invalid = set()
        try:
            with open(csv_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.reader(csvfile)
                for row in reader:
                    if not row:
                        continue
                    url = row[0].strip()
                    path = self.normalize_path(url)
                    invalid.add(path)
            print(f'[Middleware INIT] Loaded {len(invalid)} invalid paths.')
            return invalid
        except FileNotFoundError:
            print('[Middleware ERROR] CSV файл не найден!')
            return set()

    def normalize_path(self, url: str) -> str:
        """ Приводит URL к нормализованному виду: без query, без даты, без \, без / на конце """
        if url.startswith('http'):
            url = '/' + url.split('://')[-1].split('/', 1)[-1]

        path = url.split('?', 1)[0]
        path = path.split(',', 1)[0]
        path = path.replace('\\', '').strip()
        if not path.startswith('/'):
            path = '/' + path
        path = path.rstrip('/') or '/'
        return path
