import json
import logging

from django.contrib.auth import authenticate, login as auth_login, logout, update_session_auth_hash, get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import auth
from django.core.mail import EmailMessage
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.views import View
from django.views.generic.edit import FormView

from .forms import (
    UserLoginForm, FeedbackForm, AddressForm,
    ProfileForm, RegistrationForm, ChangePasswordForm
)
from .models import Address

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

User = get_user_model()

def index(request):
    return render(request, 'users/index.html')

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()  # Сохраняем пользователя
            
            # Выполняем аутентификацию
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')  # Получаем пароль

            # Аутентификация пользователя
            user = authenticate(request, username=username, password=password)
            if user is not None:
                auth_login(request, user)  # Выполняем вход пользователя
                return JsonResponse({'redirect': '/'})
            else:
                return JsonResponse({'errors': {'auth': 'Не удалось выполнить аутентификацию'}}, status=400)
        else:
            errors = {field: error_list[0] for field, error_list in form.errors.items()}
            print(errors)
            return JsonResponse({'errors': errors}, status=400)
    else:
        form = RegistrationForm()
        return JsonResponse({'errors': 'Метод GET не поддерживается'}, status=405)

def user_login(request):
    if request.method == 'POST':
        form = UserLoginForm(data=request.POST)
        if form.is_valid():
            username = request.POST['username']
            password = request.POST['password']
            user = auth.authenticate(username=username, password=password)
            if user is not None:
                auth_login(request, user)
                return JsonResponse({'redirect': '/'})
        # Возвращаем JSON с ошибками, если форма не валидна
        errors = {field: error_list[0] for field, error_list in form.errors.items()}
        print(errors)
        return JsonResponse({'errors': errors}, status=400)

    # Если метод запроса не POST, возвращаем ошибку
    return JsonResponse({'error': 'Invalid request'}, status=400)

def user_logout(request):
    logout(request)
    return redirect('parent_categories')

class PasswordChangeView(LoginRequiredMixin, FormView):
    template_name = 'users/change_password.html'
    success_url = reverse_lazy('parent_categories')
    form_class = ChangePasswordForm

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

    def form_valid(self, form):
        user = form.save()
        update_session_auth_hash(self.request, user)
        return super().form_valid(form)

    def form_invalid(self, form):
        logger.error(f"Form errors: {form.errors}")
        return super().form_invalid(form)

class ProfileView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect('parent_categories')

        try:
            user = request.user
            address = Address.objects.get(user=user)
        except Address.DoesNotExist:
            address = None

        return render(request, 'users/profile.html', {'user': user, 'address': address})

class ProfilefieldView(View):
    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Пользователь не аутентифицирован.'}, status=401)

        user = request.user
        try:
            data = json.loads(request.body.decode('utf-8'))
            logger.debug('Полученные данные: %s', data)
        except json.JSONDecodeError:
            logger.error('Некорректный JSON')
            return JsonResponse({'error': 'Некорректный JSON'}, status=400)

        try:
            data['email'] = data.pop('user_email')
            data['phone_number'] = data.pop('user_pnone')
            user_form = ProfileForm(data, instance=user)
        except Exception as e:
            logger.error('Ошибка при создании формы профиля: %s', e)
            return JsonResponse({'error': 'Ошибка при обработке данных профиля'}, status=400)

        try:
            address = user.address_set.first()
        except ObjectDoesNotExist:
            address = None

        try:
            address_data = {
                'address_line1': data.get('address'),
                'postal_code': data.get('postal_code'),
            }
            address_form = AddressForm(address_data, instance=address, user=user)
        except Exception as e:
            logger.error('Ошибка при создании формы адреса: %s', e)
            return JsonResponse({'error': 'Ошибка при обработке данных адреса'}, status=400)

        if user_form.is_valid() and address_form.is_valid():
            user_form.save()
            address_form.save()
            return JsonResponse({'message': 'Профиль успешно обновлен.'}, status=200)
        logger.error('Ошибки формы пользователя: %s', user_form.errors)
        return JsonResponse({'error': user_form.errors}, status=400)

class FeedbackView(View):
    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            print('----------------------------------', data)
            form = FeedbackForm(data)
            if form.is_valid():
                first_name = form.cleaned_data['first_name']
                last_name = form.cleaned_data['last_name']
                phone_number = form.cleaned_data['phone_number']
                message = form.cleaned_data['message']
                subject = 'Нове повідомлення від користувача'
                html_message = render_to_string('users/email_template.html', {
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone_number': phone_number,
                    'message': message,
                })

                recipient_list = ['artmagicinternet@gmail.com']
                email = EmailMessage(
                    subject=subject,
                    body=html_message,
                    from_email='artmagicinternet@gmail.com',
                    to=recipient_list
                )
                email.content_subtype = "html"
                email.send()
                return JsonResponse({'message': 'Feedback received'}, status=200)
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
        except Exception as e:
            logger.error('Ошибка при обработке запроса: %s', e)
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)