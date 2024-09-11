from django.contrib import admin
from django import forms
from mptt.admin import MPTTModelAdmin

from .models import Products, Category, ProductFilter, FilterCategory, FilterValue, Manufacturer, ProductImage, ProductToCategory

class HiddenModelAdmin(admin.ModelAdmin):
    def get_model_perms(self, request):
        return {}

@admin.register(Category)
class CategoryAdmin(MPTTModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'date_added', 'date_modified')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'meta_title', 'meta_description', 'seo_keyword', 'meta_keyword')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('tree_id', 'lft')
    mptt_level_indent = 20
    list_editable = ('is_active',)
    readonly_fields = ('date_added', 'date_modified')

    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'parent', 'description', 'image')
        }),
        ('SEO Settings', {
            'classes': ('collapse',),
            'fields': ('meta_title', 'meta_description', 'meta_keyword', 'seo_keyword')
        }),
        ('Status and Dates', {
            'fields': ('is_active', 'date_added', 'date_modified')
        }),
    )

class ProductFilterInline(admin.TabularInline):
    model = ProductFilter
    verbose_name = "Фільтр продукта"
    verbose_name_plural = "Фільтра продуктів"
    extra = 1

    class Media:
        js = ('js/filter_dynamic.js',)  # Подключаем файл с вашим JS

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    verbose_name = "Зображення"
    verbose_name_plural = "Додаткові Зображення продукту"
    extra = 1

class ProductToCategoryInline(admin.TabularInline):
    model = ProductToCategory
    verbose_name = "Категорію"
    verbose_name_plural = "Додати категорію"
    extra = 1

@admin.register(Products)
class ProductsAdmin(admin.ModelAdmin):
    inlines = [ProductToCategoryInline, ProductFilterInline, ProductImageInline]
    
    
    list_display = ('name', 'model', 'manufacturer', 'price', 'quantity', 'stock_status_id', 'status', 'date_added',
    'date_modified')
    # list_filter = ('manufacturer', 'status', 'stock_status_id')
    search_fields = ('name', 'model', 'description', 'manufacturer__name')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('price', 'quantity', 'status')
    readonly_fields = ('date_added', 'date_modified')
    ordering = ('-date_added',)

    fieldsets = (
    (None, {
        'fields': ('name', 'slug', 'description', 'model', 'image', 'manufacturer')
    }),
    ('Stock and Pricing', {
        'fields': ('price', 'discount', 'quantity', 'stock_status_id')
    }),
    ('Status and Dates', {
        'fields': ('status', 'date_added', 'date_modified')
    }),

)

admin.site.register(Manufacturer, HiddenModelAdmin)
admin.site.register(FilterCategory, HiddenModelAdmin)
admin.site.register(FilterValue, HiddenModelAdmin)
admin.site.register(ProductFilter, HiddenModelAdmin)