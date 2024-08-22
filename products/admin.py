from django.contrib import admin
from django import forms
from mptt.admin import MPTTModelAdmin

from .models import Products, Category, StockStatus, Manufacturer, CategoryImage, Stocks


# Register your models here.


# Перестройте дерево
# Category.objects.rebuild()
# def group_name(self, obj):
#     return obj.productattribute_set.first().attribute.group_name if obj.productattribute_set.first() else ""

# def attribute_name(self, obj):
#     return obj.productattribute_set.first().attribute.name if obj.productattribute_set.first() else ""

# def attribute_text(self, obj):
#     return obj.productattribute_set.first().text if obj.productattribute_set.first() else ""
"""
class ProductAttributeForm(forms.ModelForm):
    group_name = forms.ModelChoiceField(queryset=AttributeGroup.objects.all())

    class Meta:
        model = ProductAttribute
        fields = ['group_name', 'attribute', 'text']

    def __init__(self, *args, **kwargs):
        super(ProductAttributeForm, self).__init__(*args, **kwargs)
        instance = kwargs.get('instance')
        print('________', self.data)
        if instance and instance.attribute and instance.attribute.attribute_group_id:
            self.fields['group_name'] = forms.ModelChoiceField(queryset=AttributeGroup.objects.all(),
                                                               initial=instance.attribute.attribute_group_id.pk,
                                                               label='Group Name', required=False, disabled=False)
        if 'group_name' in self.data:
            try:
                group_id = int(self.data.get('group_name'))
                self.fields['attribute'].queryset = Attribute.objects.filter(attribute_group_id=group_id).order_by(
                    'name')
            except (ValueError, TypeError):
                pass  # invalid input from the client; ignore and fallback to empty queryset

    def save(self, commit=True):
        print(self.data)
        instance = super().save(commit=False)
        instance.group_name = self.cleaned_data['group_name']
        if commit:
            instance.save()
        return instance


class ProductFilterForm(forms.ModelForm):
    group_filter = forms.ModelChoiceField(queryset=FilterGroup.objects.all())

    class Meta:
        model = ProductFilter
        fields = ['group_filter', 'filter']

    def __init__(self, *args, **kwargs):
        super(ProductFilterForm, self).__init__(*args, **kwargs)
        instance = kwargs.get('instance')
        print('________', self.data)
        if instance and instance.filter and instance.filter.filter_group_id:
            self.fields['group_filter'] = forms.ModelChoiceField(queryset=FilterGroup.objects.all(),
                                                                 initial=instance.filter.filter_group_id.pk,
                                                                 label='Group Name', required=False, disabled=False)
        if 'group_filter' in self.data:
            try:
                group_id = int(self.data.get('group_filter'))
                self.fields['filter'].queryset = FilterGroup.objects.filter(filter_group_id=group_id).order_by('name')
            except (ValueError, TypeError):
                pass  # invalid input from the client; ignore and fallback to empty queryset

    def save(self, commit=True):
        print(self.data)
        instance = super().save(commit=False)
        instance.group_filter = self.cleaned_data['group_filter']
        if commit:
            instance.save()
        return instance


class ProductAttributeInline(admin.TabularInline):
    model = ProductAttribute
    form = ProductAttributeForm
    extra = 1


class ProductFilterInline(admin.TabularInline):
    model = ProductFilter
    form = ProductFilterForm
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Products)
class ProductAdmin(admin.ModelAdmin):
    inlines = [
        ProductAttributeInline,
        ProductFilterInline,
        ProductImageInline
    ]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    pass


# admin.site.register(Products, ProductAdmin)
# admin.site.register(ProductImage, ProductImageAdmin)
"""
admin.site.register(Category, MPTTModelAdmin)
admin.site.register(StockStatus)
# admin.site.register(Attribute)
admin.site.register(CategoryImage)
admin.site.register(Manufacturer)
admin.site.register(Stocks)
# admin.site.register(ProductAttribute)

# admin.site.register(Filter)
# admin.site.register(FilterGroup)
# admin.site.register(ProductFilter)