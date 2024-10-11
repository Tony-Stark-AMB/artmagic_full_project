from rest_framework import serializers
from .models import Products

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Products
        # fields = ['name', 'description', 'model', 'quantity', 'price', 'manufacturer', 'date_added', 'date_modified'] # старый сериализатор
        fields = ['name','quantity','price','model','description','manufacturer']