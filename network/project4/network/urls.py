
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts/<int:post_id>/like", views.like, name="like_post"),
    path("posts/<int:post_id>/edit", views.update_post, name="like_post"),

    path("make", views.create_post, name="new_post"),
    path("posts/<str:field>", views.posts, name="view_post"),
    path("profile/<str:username>", views.profile_view, name="profile"),
    path("follow/<str:username>", views.follow, name="follow"),
    #path("user/<str:username>", views.user, name="user"), 
]
