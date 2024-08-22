from django.urls import path
from .views import register, user_login, user_logout, change_password, ProfileView, profile_field, FeedbackView

app_name = 'user'

urlpatterns = [
    path('', user_login, name='login'),
    path('register/', register, name='register'),
    path('logout/', user_logout, name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change_password/', change_password, name='change_password'),
    path('profile-field/', profile_field, name='profile_field'),
    path('feedback/', FeedbackView.as_view(), name='feedback')
]