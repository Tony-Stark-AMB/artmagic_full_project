from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from carts.models import Cart
from carts.utils import get_user_carts
from products.models import Products
import json


def cart_add(request):

    product_id = request.POST.get("product_id")

    product = Products.objects.get(id=product_id)
    
    if request.user.is_authenticated:
        carts = Cart.objects.filter(user=request.user, product=product)

        if carts.exists():
            cart = carts.first()
            if cart:
                cart.quantity += 1
                cart.save()
        else:
            Cart.objects.create(user=request.user, product=product, quantity=1)

    else:
        carts = Cart.objects.filter(
            session_key=request.session.session_key, product=product)

        if carts.exists():
            cart = carts.first()
            if cart:
                cart.quantity += 1
                cart.save()
        else:
            Cart.objects.create(
                session_key=request.session.session_key, product=product, quantity=1)
    
    user_cart = get_user_carts(request)
    cart_items_html = render_to_string(
        "carts/includes/included_cart.html", {"carts": user_cart}, request=request)

    response_data = {
        "message": "Товар добавлен в корзину",
        "cart_items_html": cart_items_html,
    }

    return JsonResponse(response_data)
            

def cart_change(request):
    cart_id = request.POST.get("cart_id")
    quantity = request.POST.get("quantity")

    cart = Cart.objects.get(id=cart_id)

    cart.quantity = quantity
    cart.save()
    updated_quantity = cart.quantity

    cart = get_user_carts(request)
    cart_items_html = render_to_string(
        "carts/includes/included_cart.html", {"carts": cart}, request=request)

    response_data = {
        "message": "Количество изменено",
        "cart_items_html": cart_items_html,
        "quaantity": updated_quantity,
    }

    return JsonResponse(response_data)



def cart_remove(request):
    
    cart_id = request.POST.get("cart_id")

    cart = Cart.objects.get(id=cart_id)
    quantity = cart.quantity
    cart.delete()

    user_cart = get_user_carts(request)
    cart_items_html = render_to_string(
        "carts/includes/included_cart.html", {"carts": user_cart}, request=request)

    response_data = {
        "message": "Товар удален",
        "cart_items_html": cart_items_html,
        "quantity_deleted": quantity,
    }

    return JsonResponse(response_data)

def process_order(request):
    # print(request.method == "POST")
    # if request.method == "POST":
    body_unicode = request.body.decode('utf-8')
    data = json.loads(body_unicode)
    # form = OrderForm(data)
    # print(request.POST)
    # if form.is_valid():
    #     order_data = {
    #         'products': form.cleaned_data['products'],
    #         'name': form.cleaned_data['name'],
    #         'phone': form.cleaned_data['phone'],
    #         'address': form.cleaned_data['address'],
    #         'email': form.cleaned_data['email'],
    #         'total_price': sum(item['price'] * item['quantity'] for item in form.cleaned_data['products'])
    #     }
    try:
        order_data = {
            'name': data.get('name'),
            'phone': data.get('phone'),
            'address': data.get('address'),
            'email': data.get('email'),
            'products': data.get('products')['arr'],
        }
        print(order_data)
        return JsonResponse({"statuc": "success", "message": "Заказ сохранен"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": "Invalid request method"})
   
    
        # # Сохранение данных в JSON файл
        # with open('order_data.json', 'w') as f:
        #     json.dump(order_data, f, ensure_ascii=False, indent=4)

        # return JsonResponse({"status": "success", "message": "Order processed successfully"})
        
        # return JsonResponse({"status": "error", "errors": form.errors})

   