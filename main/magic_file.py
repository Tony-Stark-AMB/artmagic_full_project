from .models import Header


def header(request):
    informations = Header.objects.get(pk=1)
    print(informations, 'abrakadabra')
    table_data_dict = {
                'phone': informations.phone_number,
                'email': informations.email,
            }
    print(table_data_dict, 'abracadabra___________________')
    return {'table_data': table_data_dict}