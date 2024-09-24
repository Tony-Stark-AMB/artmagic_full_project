from django import forms

from .models import ProductFilter
class ProductFilterForm(forms.ModelForm):
    class Meta:
        model = ProductFilter
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            # Установить выбранное значение как data-selected
            self.fields['filter_value'].widget.attrs['data-selected'] = self.instance.filter_value_id

            