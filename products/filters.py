import django_filters
from django.db.models import Q
from .models import Products, Category, ProductFilter, FilterCategory, FilterValue  # Обновлено
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank


class ProductsFilter(django_filters.FilterSet):
    query = django_filters.CharFilter(method='filter_by_query')

    # manufacturer = django_filters.CharFilter(method='filter_by_manufacturer')

    class Meta:
        model = Products
        fields = ["query"]

    def __init__(self, data=None, queryset=None, *args, **kwargs):
        print(data, "16")
        cat_filter = FilterCategory.objects.all()

        # Получаем список доступных фильтров
        valid_filter_names = list(cat_filter.values_list('name', flat=True))
        print(f"Valid filters: {valid_filter_names}")

        if data is not None:
            data = data.copy()

            # Оставляем только те фильтры, которые есть в valid_filter_names
            self.attribute_params = {
                key: data.pop(key)
                for key in list(data.keys())
                if key in valid_filter_names
            }
            print(f"Filtered attribute_params: {self.attribute_params}")
        else:
            self.attribute_params = {}

        super().__init__(data=data, queryset=queryset, *args, **kwargs)

    def filter_by_query(self, queryset, name, value):
        print('-------------------------------------------------------------------------', name, value)
        vector = SearchVector("name", "model")
        query = SearchQuery(value)
        print('-2-2---2', name, value,
              len(queryset.annotate(rank=SearchRank(vector, query)).filter(rank__gt=0.0001).order_by('-rank')))
        return queryset.annotate(rank=SearchRank(vector, query)).filter(rank__gt=0.0001).order_by('-rank')

    def filter_by_attributes(self, queryset):
        print('0---', len(queryset), self.data)
        if self.attribute_params:
            conditions = Q()
            print('1', self.attribute_params)
            for attr_name, attr_values in self.attribute_params.items():
                print(attr_name, '-----------', attr_values)
                values = attr_values[0].strip("['']").split('|')
                print('++++values', values)
                # for val in values:
                #     print('2---', val)

                print('----------------')
                conditions = Q(filters__filter_value__pk__in=values)
                print('============1', conditions)
                # conditions &= conditions
                queryset = queryset.filter(conditions).distinct()
            print('============2', conditions)
        print('4---', len(queryset))
        # print(queryset)
        return queryset

    def qs(self):
        queryset = super().qs
        
        print('5---', len(queryset), self.attribute_params)
        if self.attribute_params:
            return self.filter_by_attributes(queryset)
        else:
            return queryset