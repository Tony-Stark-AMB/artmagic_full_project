from django import forms
from .models import ContactInfo

class ContactInfoForm(forms.ModelForm):
    class Meta:
        model = ContactInfo
        fields = ['phone_number']

