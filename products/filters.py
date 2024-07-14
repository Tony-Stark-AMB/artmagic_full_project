import django_filters
from django.db.models import Q
from .models import Products, Category



class ProductsFilter(django_filters.FilterSet):
    subcategory = django_filters.CharFilter(method='filter_by_subcategory')
    manufacturer = django_filters.CharFilter(method='filter_by_manufacturer')

    class Meta:
        model = Products
        fields = ['subcategory', 'manufacturer']

    def __init__(self, data=None, queryset=None, *args, **kwargs):
        print(data, "16")
        if data is not None:
            data = data.copy()
            if 'ПІДКАТЕГОРІЯ' in data:
                data['subcategory'] = data.pop('ПІДКАТЕГОРІЯ')
            if 'ВИРОБНИК' in data:
                data['manufacturer'] = data.pop('ВИРОБНИК')
            if 'page' in data:
                data.pop('page')
            if 'productsPerPage' in data:
                data.pop('productsPerPage')
        self.attribute_params = {key.capitalize(): data.pop(key) for key in list(data.keys()) if key not in ['subcategory', 'manufacturer']}
        super().__init__(data=data, queryset=queryset, *args, **kwargs)

    def filter_by_subcategory(self, queryset, name, value):
        category_list_id=[]
        subcategory_id = value.strip('[]').strip("''").split('|')

        for el in subcategory_id:
            parent_category = Category.objects.get(name=el)
            descendants = parent_category.get_descendants(include_self=True)
            list_id = [descendant.pk for descendant in descendants]
            category_list_id = list(set(category_list_id) | set(list_id))

        return queryset.filter(category__in=category_list_id).distinct()

    def filter_by_manufacturer(self, queryset, name, value):
        manufacturer_names = value.strip("['']").split('|')
        return queryset.filter(manufacturer__name__in=manufacturer_names).distinct()

    def filter_by_attributes(self, queryset):

        if self.attribute_params:
            conditions = Q()
            for attr_name, attr_values in self.attribute_params.items():
                values = attr_values[0].strip("['']").split('|')
                for val in values:
                    conditions |= Q(productattribute__attribute__name__iexact=attr_name, productattribute__text__iexact=val)
            queryset = queryset.filter(conditions).distinct()
        return queryset

    def qs(self):
        queryset = super().qs
        return self.filter_by_attributes(queryset)