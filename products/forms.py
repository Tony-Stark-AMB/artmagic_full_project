from django import forms

from .models import ProductFilter, FilterGroup, FilterCategory, ProductToCategory, Category

class ProductToCategoryForm(forms.ModelForm):
    parent_category = forms.ModelChoiceField(
        queryset=Category.objects.filter(parent=None),  # Только те категории, которые не имеют родителя
        label='Родительская категория',
        required=False
    )

    class Meta:
        model = ProductToCategory
        fields = ['parent_category', 'category_id']

    def __init__(self, *args, **kwargs):
        super(ProductToCategoryForm, self).__init__(*args, **kwargs)

        if self.instance and self.instance.pk:
            if self.instance.category_id and self.instance.category_id.parent:
                self.fields['parent_category'].initial = self.instance.category_id.parent

            if self.instance.category_id:
                self.fields['category_id'].initial = self.instance.category_id.id

            parent_category_id = self.instance.category_id.parent_id if self.instance.category_id else None
            if parent_category_id:
                self.fields['category_id'].queryset = Category.objects.filter(parent_id=parent_category_id).order_by("name")
            else:
                self.fields['category_id'].queryset = Category.objects.exclude(parent=None).order_by("name")
        else:
            self.fields['category_id'].queryset = Category.objects.exclude(parent=None).order_by("name")


    
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
        if instance and instance.pk:
            if instance.filter_category and instance.filter_category.group:
                self.fields['filter_group'].initial = instance.filter_category.group
                
                self.fields['filter_category'].queryset = FilterCategory.objects.filter(
                    group=instance.filter_category.group
                ).order_by('name')

            if instance.filter_value:
                self.fields['filter_value'].widget.attrs['data-selected'] = instance.filter_value_id

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
        instance.group = self.cleaned_data.get('group')
        if commit:
            instance.save()
        return instance    
