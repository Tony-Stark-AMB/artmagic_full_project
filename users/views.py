from django.contrib import auth
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .forms import UserLoginForm
from .forms import ProfileForm
from .forms import RegistrationForm
from .forms import ChangePasswordForm
from django.contrib.auth import update_session_auth_hash
from .models import PurchaseHistory, Address
from products.models import Category


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


def profile(request):
    user = request.user
    addresses = Address.objects.all()
    # addresses = user.addresses.all()  # Получаем все адреса пользователя
    purchase_history = PurchaseHistory.objects.filter(user=user)  # Получаем историю покупок пользователя
    if request.method == 'PUT':
        form = ProfileForm(request.PUT, instance=user)
        if form.is_valid():
            form.save()
            return redirect('profile')  # После сохранения данных перенаправляем пользователя на страницу профиля
    else:
        form = ProfileForm(instance=user)
    context = {'user': user, 'addresses': addresses, 'form': form, 'purchase_history': purchase_history}
    return render(request, 'users/profile.html', context)



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

def profile_field(request):
    user_profile = request.user
    print(request.user);
    try:
        addresses_query = user_profile.address_set.all().values('address_line1', 'city', 'country')
        for address_data in addresses_query:
            address = ", ".join([str(value) for value in address_data.values()])

        user = {
            'username': user_profile.username,
            'email': user_profile.email,
            'first_name': user_profile.first_name,
            'last_name': user_profile.last_name,
            'phone_number': user_profile.phone_number,
            'addresses': address,
        }

        return JsonResponse(user, safe=False)
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Продукт с указанным идентификатором не найден.'}, status=404)