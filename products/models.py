from django.db import models

from mptt.models import MPTTModel, TreeForeignKey


class ActiveCategoryManager(models.Manager):
    # def get_queryset(self):
    #     return self.get_queryset().filter(is_active=True)
    pass


class Category(MPTTModel):
    name = models.CharField(max_length=295)
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

    objects = ActiveCategoryManager()

    class MPTTMeta:
        order_insertion_by = ['name']

    def __str__(self):
        return self.name


class Manufacturer(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='catalog/', null=True, max_length=300)

    def __str__(self):
        return self.name


class AttributeGroup(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True, verbose_name='Имя группы')

    def __str__(self):
        return f"{self.name}"


class FilterGroup(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True, verbose_name='Имя группы')

    def __str__(self):
        return self.name


class Attribute(models.Model):
    attribute_group_id = models.ForeignKey(AttributeGroup, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=255, null=True, blank=True, verbose_name='Атрибут')

    def __str__(self):
        return self.name


class Filter(models.Model):
    filter_group_id = models.ForeignKey(FilterGroup, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=255, null=True, blank=True, verbose_name='Фильтр')

    def __str__(self):
        return self.name


class StockStatus(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Products(models.Model):
    name = models.CharField(max_length=299)
    description = models.TextField(null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True)
    model = models.CharField(max_length=255, blank=True)
    quantity = models.IntegerField(null=True, blank=True)
    stock_status_id = models.ForeignKey(StockStatus, on_delete=models.CASCADE, max_length=300)
    image = models.ImageField(upload_to='catalog/', null=True, max_length=300, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    manufacturer = models.ForeignKey(Manufacturer, null=True, on_delete=models.CASCADE, max_length=300)
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    slug = models.SlugField(max_length=299, blank=True, null=True)
    discount = models.DecimalField(default=0.00, max_digits=4, null=True, blank=True, decimal_places=2,
                                   verbose_name='Скидка в %')

    def __str__(self):
        return self.name


class ProductAttribute(models.Model):
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE)
    text = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.attribute}: {self.text}"


class ProductFilter(models.Model):
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    filter = models.ForeignKey(Filter, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.filter}"


class ProductImage(models.Model):
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='catalog/', null=True, max_length=300, blank=True)

    def __str__(self):
        return f"{self.product}___________ {self.image}"