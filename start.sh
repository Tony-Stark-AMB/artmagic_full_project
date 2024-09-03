#!/bin/bash

cd /var/artmagic_project/artmagic_full_project

source venv/bin/activate

python manage.py runserver
