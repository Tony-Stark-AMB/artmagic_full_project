#!/bin/bash

# Находим и удаляем все директории с именем "migrations" во всех поддиректориях
find . -maxdepth 2 -type d -name "migrations" -exec rm -rf {} +

python manage.py makemigrations carts
python manage.py makemigrations delivery
python manage.py makemigrations liqpay_app
python manage.py makemigrations main
python manage.py makemigrations products
python manage.py makemigrations users
python manage.py migrate
python manage.py loaddata fixtures/category.json
python manage.py loaddata fixtures/manufacturer.json
python manage.py loaddata fixtures/filter_categories.json
python manage.py loaddata fixtures/filter_values.json
python manage.py loaddata fixtures/products.json
python manage.py loaddata fixtures/producttocategory.json
python manage.py loaddata fixtures/product_image.json
python manage.py loaddata fixtures/product_filters.json