from django import forms

from .models import ProductFilter, FilterGroup, FilterCategory

# class ProductFilterForm(forms.ModelForm):
#     class Meta:
#         model = ProductFilter
#         fields = '__all__'

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         if self.instance.pk:
#             # Установить выбранное значение как data-selected
#             self.fields['filter_value'].widget.attrs['data-selected'] = self.instance.filter_value_id


class ProductFilterForm(forms.ModelForm):
    filter_group = forms.ModelChoiceField(
        queryset=FilterGroup.objects.all(),
        required=False,
        label="Група категорій фільтрів",
        widget=forms.Select(attrs={'class': 'filter-group'})
    )

    class Meta:
        model = ProductFilter
        fields = ['filter_group', 'filter_category', 'filter_value']

    def __init__(self, *args, **kwargs):
        super(ProductFilterForm, self).__init__(*args, **kwargs)
        instance = kwargs.get('instance')

        # Инициализация поля категории фильтров на основе выбранной группы фильтров
        if instance and instance.pk:
            # Инициализация поля группы фильтров на основе категории фильтров
            if instance.filter_category and instance.filter_category.group:
                self.fields['filter_group'].initial = instance.filter_category.group
                # Фильтруем категории фильтров по группе
                self.fields['filter_category'].queryset = FilterCategory.objects.filter(
                    group=instance.filter_category.group
                ).order_by('name')

            # Инициализация для поля значения фильтра
            if instance.filter_value:
                self.fields['filter_value'].widget.attrs['data-selected'] = instance.filter_value_id

        # Если в данных POST указана группа фильтров (например, при редактировании через форму)
        if 'filter_group' in self.data:
            try:
                group_id = int(self.data.get('filter_group'))
                self.fields['filter_category'].queryset = FilterCategory.objects.filter(
                    group_id=group_id
                ).order_by('name')
            except (ValueError, TypeError):
                self.fields['filter_category'].queryset = FilterCategory.objects.none()


    def save(self, commit=True):
        instance = super().save(commit=False)
        # Сохранение выбранной группы фильтров и категорий фильтров
        instance.group = self.cleaned_data.get('group')
        if commit:
            instance.save()
        return instance    









# class ProductFilterForm(forms.ModelForm):
#     class Meta:
#         model = ProductFilter
#         fields = '__all__'

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         if self.instance.pk:
#             # Установить выбранное значение как data-selected
#             self.fields['filter_value'].widget.attrs['data-selected'] = self.instance.filter_value_id

            