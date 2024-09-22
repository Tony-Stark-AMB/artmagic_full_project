from django.contrib import admin
from django import forms
from mptt.admin import MPTTModelAdmin
from django.utils.safestring import mark_safe

from .models import Products, Category, ProductFilter, FilterCategory, FilterValue, Manufacturer, ProductImage, ProductToCategory

class HiddenModelAdmin(admin.ModelAdmin):
    def get_model_perms(self, request):
        return {}
    

from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from .models import Category
from django.contrib.admin import SimpleListFilter
import time

class CategoryFilter(admin.SimpleListFilter):
    template = 'admin/filters/filter.html'
    title = 'категоріями'
    parameter_name = 'category'

    def lookups(self, request, model_admin):
        # Получение всех категорий, замените на вашу логику
        categories = Category.objects.all()
        return [(cat.id, cat.name) for cat in categories]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(producttocategory__category_id=self.value())
    
    def choices(self, changelist):
        choices = [
                {
                    'Всі': [
                        {'selected': True, 'query_string': '?', 'display': 'Всі'}
                    ],                    
                }
            ]
        category_choices = self.lookups(None, changelist.model_admin)
        category_ids = [k for k, v in category_choices]

        categories = Category.objects.filter(pk__in=category_ids).select_related('parent')

        for category in categories:
            temp_dict = {}
            parent_category = category.parent 
            if parent_category:
                for item in choices:
                    if parent_category.name in item:
                        item[parent_category.name].append({
                            'selected': False, 
                            'query_string': f'?category={category.pk}', 
                            'display': category.name
                            })
            else:
                temp_dict.setdefault(category.name, [])
                choices.append(temp_dict)
        return choices











        # all_list = []
        # internal_list = []
        # # Вызываем оригинальный метод choices
        # for choice in super().choices(changelist):
        #     try:
        #         # sa = choice['query_string'].split('=')[1]
        #         # print(sa)
        #         parent = Category.objects.get(pk=choice['query_string'].split('=')[1])
        #         print(parent.parent.pk)
        #         # print(parent)
        #         # Добавляем новый ключ 'qwe'
        #         choice['parent'] = parent.parent.pk
        #     except:
        #         pass
        #     # print(choice)    
        #     yield choice
        
            # {% for choice in choices %}
            # {%if choice.display == "Всі" %}
            #     <li{% if choice.selected %} class="selected"{% endif %}>
            #     <a href="{{ choice.query_string|iriencode }}">{{ choice.display }}</a></li>
            # {% endif %}


'''wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'''
# {% load i18n %}
# <details data-filter-title="{{ title }}" open>
#   <summary>
#     {% blocktranslate with filter_title=title %} By {{ filter_title }} {% endblocktranslate %}
#     <h1>Hello world</h1>
# </summary>
#         {% for choice in choices %}
#             {% if not choice.parent %}
#                 <h3 class="list-title">{{ choice.display }}</h3> 
#             {% else %}      
#                 <ul class="list-items">
#                     <li{% if choice.selected %} class="selected"{% endif %}>
#                     <a href="{{ choice.query_string|iriencode }}">{{ choice.display }}</a></li>         
#                 </ul>
#             {% endif %}
#         {% endfor %}
# </details>
# <script>
#     // Получаем все элементы с классом "list-title"
#     const listTitles = document.querySelectorAll('.list-title');

#     // Добавляем обработчики событий для каждого заголовка списка
#     listTitles.forEach(title => {
#         title.addEventListener('click', () => {
#             // Следующий элемент после заголовка (список) скрывается/отображается
#             const list = title.nextElementSibling;
#             if (list.style.display === 'none' || list.style.display === '') {
#                 list.style.display = 'block'; // Показываем список
#             } else {
#                 list.style.display = 'none'; // Скрываем список
#             }
#         });
#     });
# </script>



    # def choices(self, request):
    #     choices = []
    #     for value, display in self.lookups(request, self.model_admin):
    #         selected = value == self.value()
    #         query_string = self.query_string(value)
    #         choices.append({
    #             'selected': selected,
    #             'query_string': query_string,
    #             'display': display,
    #             'qwe': 'wdd',
    #         })
    #     return choices
    # def get_model_admin(self, request):
    #     # Это вспомогательный метод для получения model_admin
    #     # Возможно, вам придется адаптировать эту часть в зависимости от вашего контекста
    #     # Например, если фильтр связан с конкретной моделью, то здесь можно получить model_admin
    #     return ProductsAdmin()  # Измените на вашу логику получения model_admin

# class CategoryAccordionFilter(SimpleListFilter):
#     title = 'Категорія'
#     parameter_name = 'category'
#     template = 'admin/filters/category_accordion_filter.html'  # Указываем путь к кастомному шаблону

#     def lookups(self, request, model_admin):
#         # Получаем родительские категории (без родителей)
#         parents = Category.objects.filter(parent__isnull=True)
#         return [(category.id, category.name) for category in parents]

#     def queryset(self, request, queryset):
#         # Фильтрация по категории
#         if self.value():
#             return queryset.filter(producttocategory__category_id=self.value())
#         return queryset

    # def choices(self, changelist):
    #     # Формируем список категорий для передачи в шаблон
    #     subcategories = {}
    #     for category_id, category_name in self.lookup_choices:
    #         # Получаем дочерние категории для каждой родительской категории
    #         subcategories[category_name] = Category.objects.filter(parent_id=category_id)
        
    #     # Формируем контекст для шаблона
    #     return {
    #         'parameter_name': self.parameter_name,
    #         'lookups': self.lookup_choices,
    #         'subcategories': subcategories,  # Передаем подкатегории в шаблон
    #         'spec': self,
    #     }
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
    
    list_display = ('name', 'model', 'get_categories', 'manufacturer', 'price', 'quantity')
    search_fields = ('name', 'model', 'manufacturer__name')
    list_filter = (CategoryFilter,)  # Используем кастомный фильтр
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('price', 'quantity')
    readonly_fields = ('date_added', 'date_modified')
    ordering = ('-date_added',)

    
    def get_categories(self, obj):
        categories = [category.category_id.name for category in obj.producttocategory_set.all()]
        return mark_safe("<br>".join(categories))
    get_categories.short_description = 'Категорії'

    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'model', 'image', 'manufacturer')
        }),
        ('Наявність та ціни', {
            'fields': ('price', 'discount', 'quantity', 'stock_status_id')
        }),
        ('Статус', {
            'fields': ('status', )
        }),
    )

admin.site.register(Manufacturer, HiddenModelAdmin)
admin.site.register(FilterCategory)
admin.site.register(FilterValue)
admin.site.register(ProductFilter, HiddenModelAdmin)