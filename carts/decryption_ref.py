import requests
from django.conf import settings


def get_city_name(city_ref):
    url = "https://api.novaposhta.ua/v2.0/json/"
    API_KEY = settings.NOVA_POSHTA_API_KEY
    data = {
        "apiKey": API_KEY,
        "modelName": "Address",
        "calledMethod": "getCities",
        "methodProperties": {
            "Ref": city_ref
        }
    }
    response = requests.post(url, json=data)
    city_data = response.json()
    if city_data['success'] and city_data['data']:
        return city_data['data'][0]['Description']
    return None

def get_area_name(area_ref):
    url = "https://api.novaposhta.ua/v2.0/json/"
    API_KEY = settings.NOVA_POSHTA_API_KEY
    data = {
        "apiKey": API_KEY,
        "modelName": "Address",
        "calledMethod": "getAreas",
        "methodProperties": {}
    }
    response = requests.post(url, json=data)
    area_data = response.json()
    if area_data['success'] and area_data['data']:
        for area in area_data['data']:
            if area['Ref'] == area_ref:
                return area['Description']
    return None

def get_department_name(department_ref, city_ref):
    url = "https://api.novaposhta.ua/v2.0/json/"
    API_KEY = settings.NOVA_POSHTA_API_KEY
    data = {
        "apiKey": API_KEY,
        "modelName": "AddressGeneral",
        "calledMethod": "getWarehouses",
        "methodProperties": {
            "CityRef": city_ref
        }
    }
    response = requests.post(url, json=data)
    department_data = response.json()
    if department_data['success'] and department_data['data']:
        for department in department_data['data']:
            if department['Ref'] == department_ref:
                return department['Description']
    return None
