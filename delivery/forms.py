from django import forms

class DeliveryOptionForm(forms.Form):
    DELIVERY_METHOD_CHOICES = [
        ('courier', 'Кур`єр'),
        ('branch', 'Відділення'),
        ('postomat', 'Поштомат'),
    ]
    method = forms.ChoiceField(choices=DELIVERY_METHOD_CHOICES, label="Спосіб доставки")
    city = forms.CharField(max_length=100, required=False, label="Місто")
    branch_id = forms.CharField(required=False, label="Відділення")
    postomat_id = forms.CharField(required=False, label="Поштомат")