from django.db import models

from mptt.models import MPTTModel, TreeForeignKey


class Category(MPTTModel):
    name = models.CharField(max_length=295, unique=True)
    description = models.TextField(null=True, blank=True)
    meta_title = models.CharField(max_length=255, null=True)
    meta_description = models.TextField(max_length=255, null=True, blank=True)
    meta_keyword = models.CharField(max_length=255, blank=True, null=True)
    seo_keyword = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='catalog/', null=True, blank=True, max_length=300)
    parent = TreeForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    slug = models.SlugField(max_length=299, blank=True, null=True)
    lft = models.PositiveIntegerField(editable=False, db_index=True, null=True)
    rght = models.PositiveIntegerField(editable=False, db_index=True, null=True)
    tree_id = models.PositiveIntegerField(editable=False, db_index=True, null=True)
    level = models.PositiveIntegerField(editable=False, null=True)
    is_active = models.BooleanField(default=True)

    class MPTTMeta:
        order_insertion_by = ['name']

    def __str__(self):
        return self.name


class CategoryImage(models.Model):
    product = models.ForeignKey(Category, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='catalog/', null=True, max_length=300, blank=True)

    def __str__(self):
        return f"{self.image}"


class Stocks(models.Model):
    image = models.ImageField(upload_to='stocks/', null=True, max_length=300, blank=True)
    title = models.CharField(max_length=100, verbose_name='Тітул')
    description = models.TextField(verbose_name='Опис')

    def __str__(self):
        return self.title

class Manufacturer(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='catalog/', null=True, max_length=300)

    def __str__(self):
        return self.image


class StockStatus(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class FilterCategory(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Категория фильтра")

    def __str__(self):
        return self.name


class FilterValue(models.Model):
    category = models.ForeignKey(FilterCategory, on_delete=models.CASCADE, related_name="values",
                                 verbose_name="Категория фильтра")
    value = models.CharField(max_length=100, verbose_name="Значение фильтра")

    def __str__(self):
        return self.value


class Products(models.Model):
    name = models.CharField(max_length=299, unique=True)
    description = models.TextField(null=True, blank=True)

    model = models.CharField(max_length=255, blank=True, unique=True)
    quantity = models.IntegerField(null=True, blank=True)
    stock_status_id = models.ForeignKey(StockStatus, on_delete=models.CASCADE, max_length=300)
    image = models.ImageField(upload_to='catalog/', null=True, max_length=300, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    manufacturer = models.ForeignKey(Manufacturer, null=True, on_delete=models.CASCADE, max_length=300)
    status = models.BooleanField()
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    slug = models.SlugField(max_length=299, blank=True, null=True)
    discount = models.DecimalField(default=0.00, max_digits=4, null=True, blank=True, decimal_places=2,
                                   verbose_name='Скидка в %')

    def __str__(self):
        return self.name


class ProductToCategory(models.Model):
    product_id = models.ForeignKey(Products, on_delete=models.CASCADE)
    category_id = models.ForeignKey(Category, on_delete=models.CASCADE)


class ProductFilter(models.Model):
    product = models.ForeignKey(Products, on_delete=models.CASCADE, related_name="filters", verbose_name="Продукт")
    filter_category = models.ForeignKey(FilterCategory, on_delete=models.CASCADE, verbose_name="Категория фильтра")
    filter_value = models.ForeignKey(FilterValue, on_delete=models.CASCADE, verbose_name="Значение фильтра")

    def __str__(self):
        return f"{self.filter_category.name}: {self.filter_value.value}"


class ProductImage(models.Model):
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='catalog/', null=True, max_length=300, blank=True)

    def __str__(self):
        return f"{self.image}"