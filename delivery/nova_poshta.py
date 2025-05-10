import logging
import requests
from django.conf import settings

logger = logging.getLogger('nova_poshta')

class NovaPoshtaAPI:
    BASE_URL = "https://api.novaposhta.ua/v2.0/json/"
    API_KEY = settings.NOVA_POSHTA_API_KEY

    @classmethod
    def get_regions(cls):
        payload = {
            "apiKey": cls.API_KEY,
            "modelName": "Address",
            "calledMethod": "getAreas",
            "methodProperties": {}
        }

        try:
            response = requests.post(cls.BASE_URL, json=payload, timeout=10)
            response.encoding = 'utf-8'
            response_data = response.json()
            return response_data
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise
        except ValueError as e:
            logger.error(f"Invalid JSON response: {e}")
            raise

    @classmethod
    def get_cities(cls, region_ref):
        payload = {
            "apiKey": cls.API_KEY,
            "modelName": "Address",
            "calledMethod": "getCities",
            "methodProperties": {
                "AreaRef": region_ref
            }
        }
        response = requests.post(cls.BASE_URL, json=payload)
        response.encoding = 'utf-8'
        response_data = response.json()
        logger.debug("get_cities response: %s", response_data)
        return response_data

    @classmethod
    def get_branches(cls, city_ref):
        payload = {
            "apiKey": cls.API_KEY,
            "modelName": "Address",
            "calledMethod": "getWarehouses",
            "methodProperties": {
                "CityRef": city_ref
            }
        }
        response = requests.post(cls.BASE_URL, json=payload)
        response.encoding = 'utf-8'
        response_data = response.json()
        logger.debug("get_branches response: %s", response_data)
        return response_data

    @classmethod
    def get_postomats(cls, city_ref):
        payload = {
            "apiKey": cls.API_KEY,
            "modelName": "AddressGeneral",
            "calledMethod": "getPostomats",
            "methodProperties": {
                "CityRef": city_ref
            }
        }
        response = requests.post(cls.BASE_URL, json=payload)
        response.encoding = 'utf-8'
        response_data = response.json()
        logger.debug("get_postomats response: %s", response_data)
        return response_data
