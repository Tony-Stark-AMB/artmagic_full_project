from django.contrib import auth
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from .forms import UserLoginForm
from .forms import ProfileForm
from .forms import RegistrationForm
from .forms import ChangePasswordForm
from django.contrib.auth import update_session_auth_hash
from .models import PurchaseHistory, Address
from products.models import Category
from django.core.exceptions import ObjectDoesNotExist
from django.views import View
from django.http import JsonResponse
import json

def index(request):
    return render(request, 'users/index.html')

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('parent_categories')
    else:
        form = RegistrationForm()
    return render(request, 'products/index.html', {'form': form})


def user_login(request):
    form = UserLoginForm(data=request.POST)
    print(form.is_valid())
    print(request.POST['username'])
    print(request.POST['password'])
    if form.is_valid():
        print('===============')
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(username=username, password=password)
        print(user)
        if user is not None:
            login(request, user)
            print(user)
            return redirect('parent_categories')
    else:
        form = UserLoginForm()
    return render(request, 'products/base.html', {'form': form})


def user_logout(request):
    logout(request)
    return redirect('parent_categories')


# def profile(request):
#     user = request.user
#     addresses = Address.objects.all()
#     # addresses = user.addresses.all()  # Получаем все адреса пользователя
#     purchase_history = PurchaseHistory.objects.filter(user=user)  # Получаем историю покупок пользователя
#     if request.method == 'PUT':
#         form = ProfileForm(request.PUT, instance=user)
#         if form.is_valid():
#             form.save()
#             return redirect('profile')  # После сохранения данных перенаправляем пользователя на страницу профиля
#     else:
#         form = ProfileForm(instance=user)
#     context = {'user': user, 'addresses': addresses, 'form': form, 'purchase_history': purchase_history}
#     return render(request, 'users/profile.html', context)



def change_password(request):
    if request.method == 'POST':
        form = ChangePasswordForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Важно, чтобы пользователь оставался аутентифицированным после смены пароля
            return redirect('profile')  # Перенаправляем пользователя на страницу профиля после успешного изменения пароля
    else:
        form = ChangePasswordForm(request.user)
    return render(request, 'account/change_password.html', {'form': form})

@login_required()
def profile_field(request):
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Пользователь не аутентифицирован.'}, status=401)
    User = get_user_model()

    if request.method == 'PUT':
        print('------------------------------------------------------------------------------------')
        try:
            print(request.body.decode('utf-8'))
            body_data = request.read()
            return JsonResponse({'message': 'Data received successfully'}, status=200)
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)

    try:
        user_profile = User.objects.get(id=request.user.id)

        addresses_query = user_profile.address_set.all().values('address_line1', 'city', 'country')
        for address_data in addresses_query:
            address = ", ".join([str(value) for value in address_data.values()])

        user_data = {
            'email': user_profile.email,
            'first_name': user_profile.first_name,
            'last_name': user_profile.last_name,
            'phone_number': user_profile.phone_number,
            'addresses': address,
            'postal_code': postal_code,
        }
        return JsonResponse(user_data, safe=False)
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Продукт с указанным идентификатором не найден.'}, status=404)

class ProfileView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect('user:login')  # Перенаправляем анонимных пользователей на страницу входа

        return render(request, 'users/profile.html')

    # def put(self, request):
    #     print('--------------------------------------------------------------------------')
    #     if not request.user.is_authenticated:
    #         return JsonResponse({'error': 'Пользователь не аутентифицирован.'}, status=401)

    #     user = request.body
    #     form = ProfileForm(request.PUT, instance=user)  # Здесь изменено на request.body
    #     if form.is_valid():
    #         form.save()
    #         return redirect('user:profile')
    #     else:
    #         # Handle invalid form
    #         pass

class FeedbackView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            phone_number = data.get('phone_number')
            message = data.get('message')

            print('first_name:', first_name)
            print('last_name:', last_name)
            print('phone_number:', phone_number)
            print('message:', message)
            return JsonResponse({'status': 'success', 'message': 'Feedback received'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=403)