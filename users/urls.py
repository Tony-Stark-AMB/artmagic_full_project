from django.urls import path
from .views import (
    register, user_login, user_logout, ProfileView, 
    ProfilefieldView, FeedbackView, PasswordChangeView,
    PasswordResetView, PasswordResetConfirmView,
    PasswordResetDoneView, PasswordResetCompleteView
)

app_name = 'user'

urlpatterns = [
    path('register/', register, name='register'),
    path('logout/', user_logout, name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', PasswordChangeView.as_view(), name='change_password'),
    path('profile-field/', ProfilefieldView.as_view(), name='profile_field'),
    path('feedback/', FeedbackView.as_view(), name='feedback'),
    path('', user_login, name='login'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset/done/', PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]