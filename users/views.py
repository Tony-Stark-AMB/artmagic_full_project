import json
import logging

from django.shortcuts import render, redirect
from django.contrib import auth
from django.views import View
from django.contrib.auth import login, update_session_auth_hash, logout, get_user_model
from django.contrib.auth import login as auth_login, authenticate
from django.views.generic.edit import FormView
from django.urls import reverse_lazy
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.shortcuts import redirect
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse

from .forms import UserLoginForm, FeedbackForm, AddressForm, ProfileForm, RegistrationForm, ChangePasswordForm


logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)



def index(request):
    return render(request, 'users/index.html')


def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()

            # Выполняем аутентификацию
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')  # Поскольку это поле пароля, его нужно сохранить в момент создания

            user = authenticate(username=username, password=password)
            if user is not None:
                auth_login(request, user)  # Вход в систему
                return JsonResponse({'redirect': '/'})
        else:
            return JsonResponse({'errors': form.errors}, status=400)
    else:
        form = RegistrationForm()

def user_login(request):
    if request.method == 'POST':
        form = UserLoginForm(data=request.POST)
        if form.is_valid():
            username = request.POST['username']
            password = request.POST['password']
            user = auth.authenticate(username=username, password=password)
            if user is not None:
                auth_login(request, user)
                return JsonResponse({'redirect': '/user/profile/'})
        # Возвращаем JSON с ошибками, если форма не валидна
        return JsonResponse({'errors': form.errors}, status=400)
    
    # Если метод запроса не POST, рендерим страницу входа
    form = UserLoginForm()
    return render(request, 'products/index.html', {'form': form})


def user_logout(request):
    logout(request)
    return redirect('parent_categories')

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



class ProfileView(View):
    def get(self, request):
        user_profile = User.objects.get(id=request.user.id)
        addresses_query = user_profile.address_set.all().values('address_line1', 'postal_code')
        print('*************', addresses_query)

        user_data = {
            'email': user_profile.email,
            'first_name': user_profile.first_name,
            'last_name': user_profile.last_name,
            'phone_number': user_profile.phone_number,
            'address': addresses_query[0]['address_line1'],
            'postal_code': addresses_query[0]['postal_code'],
        }
        if not request.user.is_authenticated:
            return redirect('user:login')  # Перенаправляем анонимных пользователей на страницу входа

        return render(request, 'users/profile.html', {"user": user_data})


User = get_user_model()

class ProfilefieldView(View):
    

    def get(self, request):

        print('---', request.user.id)
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Пользователь не аутентифицирован.'}, status=401)
        print('wadawd-------------------------------------------------------------------dwadawda')
        try:
            user_profile = User.objects.get(id=request.user.id)
            addresses_query = user_profile.address_set.all().values('address_line1', 'postal_code')
            print('*************', addresses_query)

            user_data = {
                'email': user_profile.email,
                'first_name': user_profile.first_name,
                'last_name': user_profile.last_name,
                'phone_number': user_profile.phone_number,
                'address': addresses_query[0]['address_line1'],
                'postal_code': addresses_query[0]['postal_code'],
            }
            print('---1---2---4--', user_data)
            return JsonResponse(user_data, safe=False)
        except ObjectDoesNotExist:
            print('---1---2---4--', user_data)
            return JsonResponse({'error': 'Пользователь не найден.'}, status=404)

    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Пользователь не аутентифицирован.'}, status=401)

        user = request.user
        print('-------------------------------------------------------------', user, user.pk)
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
            logger.warning('Адрес пользователя не найден')
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

        logger.debug('Форма пользователя валидна: %s', user_form.is_valid())
        logger.debug('Форма адреса валидна: %s', address_form.is_valid())       
        if user_form.is_valid() and address_form.is_valid():
            user_form.save()                     
            address_form.save()
            return JsonResponse({'message': 'Профиль успешно обновлен.'}, status=200)
        else:
            logger.error('Ошибки формы пользователя: %s', user_form.errors)
            return JsonResponse({'error': user_form.errors}, status=400)


class FeedbackView(View):
    def post(self, request):
        try:
            body_unicode = request.body.decode('utf-8')
            data = json.loads(body_unicode)
            print('+++', data)
            form = FeedbackForm(data)
            logger.debug('Форма валидна: %s', form.is_valid())
            if form.is_valid():
                # Получаем данные из формы
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

                recipient_list = ['karmot02@gmail.com']

                try:
                    logger.debug('Trying to send mail to %s', recipient_list)
                    # Используем позиционные аргументы
                    email = EmailMessage(
                        subject=subject,
                        body=html_message,
                        from_email='Asgeron90@gmail.com',
                        to=recipient_list
                    )
                    email.content_subtype = "html"  # Устанавливаем тип контента в HTML
                    email.send()
                    logger.debug('Mail sent successfully')
                    #messages.success(request, 'Ваше повідомлення було успішно відправлено!')
                except Exception as e:
                    logger.error('Error sending mail: %s', e)
                    #messages.error(request, f'Помилка при відправці повідомлення: {e}')

            else:
                #messages.error(request, 'Форма содержит ошибки. Пожалуйста, исправьте их.')
                return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
        except Exception as e:
            logger.error('Ошибка при обработке запроса: %s', e)
            #messages.error(request, f'Помилка при обробці запиту: {e}')
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

        return JsonResponse({'message': 'Feedback received'}, status=200)