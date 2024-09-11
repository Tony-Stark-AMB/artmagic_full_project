import re
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm

from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import CommonPasswordValidator
from django.core.validators import validate_email
from .models import CustomUser, Address
from django.contrib.auth import authenticate



class RegistrationForm(UserCreationForm):
    email = forms.EmailField(
        max_length=254,
        error_messages={
            'invalid': "Будь ласка, введіть дійсну адресу електронної пошти.",
            'required': "Email є обов'язковим полем."
        }
    )
    phone_number = forms.CharField(
        max_length=15,
        error_messages={
            'required': "Номер телефону є обов'язковим полем."
        }
    )
    
    username = forms.CharField(
        max_length=150,
        error_messages={
            'required': "Логін є обов'язковим полем."
        }
    )
    
    password1 = forms.CharField(
        widget=forms.PasswordInput,
        error_messages={
            'required': "Пароль є обов'язковим полем."
        }
    )
    
    password2 = forms.CharField(
        widget=forms.PasswordInput,
        error_messages={
            'required': "Це поле є обов'язковим."
        }
    )
    
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'phone_number', 'password1', 'password2')

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if CustomUser.objects.filter(username=username).exists():
            raise ValidationError("Користувач із таким ім'ям вже існує.")
        print('-----------------------------------------------------------------------------------------------------------------------', len(username))
        if len(username) <= 1:
            raise ValidationError("Ім'я користувача має містити щонайменше 3 літери.")
        # if not re.match(r'^[a-zA-Z]+$', username):
        #     raise ValidationError("Ім'я користувача має складатися лише з англійських букв.")
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if CustomUser.objects.filter(email=email).exists():
            raise ValidationError("Користувач з такою електронною поштою вже існує.")
        # Дополнительная логика для проверки email, если необходимо
        return email

    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        if not re.match(r'^\+?3?\d{9,14}$', phone_number):
            raise ValidationError("Неправильний номер телефону.")
        if CustomUser.objects.filter(phone_number=phone_number).exists():
            raise ValidationError("Користувач з таким номером телефону вже існує.")
        
        return phone_number

    def clean_password1(self):
        password1 = self.cleaned_data.get('password1')
        if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"\'<>,.?/]+$', password1):
            raise ValidationError("Пароль може містити лише латинські літери та символи.")
        if len(password1) < 8:
            raise ValidationError("Вибачте, але ваш пароль занадто короткий. Він має містити щонайменше 8 символів.")

        common_password_validator = CommonPasswordValidator()
        try:
            common_password_validator.validate(password1)
        except ValidationError:
            raise ValidationError(("Вибачте, але обраний вами пароль занадто простий."))


        return password1

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')

        # Проверка совпадения паролей
        if password1 and password2 and password1 != password2:
            raise ValidationError(("Паролі не співпадають."))
        
        if len(password2) < 8:
            raise ValidationError("Вибачте, але ваш пароль занадто короткий. Він має містити щонайменше 8 символів.")

        common_password_validator = CommonPasswordValidator()
        try:
            common_password_validator.validate(password2)
        except ValidationError:
            raise ValidationError(("Вибачте, але обраний вами пароль занадто простий."))

        return password2

        

class UserLoginForm(forms.Form):

    username = forms.CharField(
        max_length=30,
        error_messages={
            'required': "Логін є обов'язковим полем."
        }
    )
    
    password = forms.CharField(
        widget=forms.PasswordInput,
        error_messages={
            'required': "Пароль є обов'язковим полем."
        }
    )


    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        password = cleaned_data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user is None:
                # Валидация неверного логина/пароля
                raise forms.ValidationError("Будь ласка, введіть правильне ім'я користувача та пароль. Зверніть увагу, що обидва поля можуть бути чутливими до регістру.")


class ChangePasswordForm(PasswordChangeForm):
    class Meta:
        model = CustomUser
        fields = ('old_password', 'new_password1', 'new_password2')


class ProfileForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'phone_number')


    first_name = forms.CharField(
        min_length=2,
        max_length=20,
        required=True
    )
    last_name = forms.CharField(
        min_length=2,
        max_length=20
    )
    phone_number = forms.CharField(
        max_length=15,
        required=True
    )
    email = forms.CharField()

    def clean_phone_number(self):
        phone_number = self.cleaned_data['phone_number']
        if not re.match(r'^\+?3?\d{9,14}$', phone_number):
            raise forms.ValidationError('Введите правильный номер телефона.')
        return phone_number

class AddressForm(forms.ModelForm):

    class Meta:
        model = Address
        fields = ('address_line1', 'postal_code')

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.instance.user = user

    address_line1 = forms.CharField()
    postal_code = forms.CharField(max_length=5)

    def clean_postal_code(self):
        postal_code = self.cleaned_data['postal_code']
        if not postal_code.isdigit():
            raise ValidationError('Почтовый индекс должен содержать только цифры.')
        return postal_code

class FeedbackForm(forms.Form):
    first_name = forms.CharField(
        max_length=15,
        required=True
    )
    last_name = forms.CharField(max_length=25)
    phone_number = forms.CharField(
        max_length=15,
        required=True
    )
    message = forms.CharField(
        widget=forms.Textarea,
        min_length=2,
        max_length=500,
        required=True
    )

    def clean_phone_number(self):
        phone_number = self.cleaned_data['phone_number']
        if not re.match(r'^\+?3?\d{9,14}$', phone_number):
            raise forms.ValidationError('Введите правильный номер телефона.')
        return phone_number