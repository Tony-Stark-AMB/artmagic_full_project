from .models import Header
from django.core.exceptions import ObjectDoesNotExist

def header(request):
    try:
        informations = Header.objects.get(pk=1)
        informations1 = Header.objects.get(pk=2)
        phones = f"{informations.phone_number}, {informations1.phone_number}"
        table_data_dict = {
            'phone': phones,
            'email': informations.email,
        }
    except ObjectDoesNotExist:
        table_data_dict = {
            'phone': 'Номер не указан',
            'email': 'Email не указан',
        }
    return {'table_data': table_data_dict}