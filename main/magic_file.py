from .models import Header
from django.core.exceptions import ObjectDoesNotExist

def header(request):
    try:
        informations = Header.objects.get(pk=1)
        table_data_dict = {
            'phone': informations.phone_number,
            'email': informations.email,
        }
    except ObjectDoesNotExist:
        table_data_dict = {
            'phone': 'Номер не указан',
            'email': 'Email не указан',
        }
    return {'table_data': table_data_dict}