# Generated by Django 5.0.3 on 2024-09-10 15:14

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='filtervalue',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='values', to='products.filtercategory', verbose_name='Категория фильтра'),
        ),
        migrations.AlterField(
            model_name='productfilter',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='filters', to='products.products', verbose_name='Продукт'),
        ),
    ]