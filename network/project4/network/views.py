from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
  # This is missing but needed for your posts view
from .models import User, Post
from django.core.paginator import Paginator

import json

def index(request):
    return render(request, "network/index.html")
# views.py

def posts(request, field):
    # Get page number from request
    page_number = request.GET.get('page', 1)
    
    if field == "all":
        posts = Post.objects.all()
    elif field == "user":
        posts = Post.objects.filter(user=request.user)
    elif field == "following":
        following_users = request.user.following.all()
        posts = Post.objects.filter(user__in=following_users)
    else:
        return JsonResponse({"error": "Invalid user."}, status=400)

    # Order posts and paginate
    posts = posts.order_by("-timestamp").all()
    paginator = Paginator(posts, 10)  # 10 posts per page
    
    try:
        current_page = paginator.page(page_number)
    except:
        return JsonResponse({"error": "Invalid page number."}, status=400)
    
    # Return paginated data
    return JsonResponse({
        "posts": [post.serialize() for post in current_page],
        "page": int(page_number),
        "has_next": current_page.has_next(),
        "has_previous": current_page.has_previous(),
        "total_pages": paginator.num_pages
    }, safe=False)
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")
def like(request, post_id):
    if request.method == "PUT":
        post = Post.objects.get(pk=post_id)
        if request.user in post.likes.all():
            post.likes.remove(request.user)
        else:
            post.likes.add(request.user)
        return JsonResponse({"likes": [user.username for user in post.likes.all()]})
    return JsonResponse({"error": "PUT request required"}, status=400)
def create_post(request):
    if request.method == "POST":  
        try:
            # Add print statements to debug
            print("Request body:", request.body)
            data = json.loads(request.body)
            print("Parsed data:", data)
            user = request.user
            content = data.get("content")
            print("Content:", content)
            
            if not content:
                return JsonResponse({"error": "Post content is required"}, status=400)
                
            post = Post(user=user, content=content)
            post.save()
            return JsonResponse({"message": "Post created successfully"}, status=201)
        except json.JSONDecodeError as e:
            print("JSON Decode Error:", str(e))  # Add this to see JSON errors
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            print("Exception:", str(e))  # Add this to see other errors
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "POST request required"}, status=400)

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))
def profile_view(request, username):
    try:
        user = User.objects.get(username=username)
        is_following = request.user.is_authenticated and request.user.following.filter(username=username).exists()
        
        return JsonResponse({
            "username": user.username,
            "followers": [follower.username for follower in user.followers.all()],
            "following": [following.username for following in user.following.all()],
            "is_following": is_following,
            "same_user": request.user.username == username if request.user.is_authenticated else False
        })
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
def update_post(request, post_id):
    if request.method =="PUT":
        data = json.loads(request.body)
        post = Post.objects.get(id=post_id)
       
        post.content = data.get("content")
        post.save()
        return JsonResponse({"message": "Post updated successfully"})
    return JsonResponse({"error": "PUT request required"}, status=400)

def follow(request, username):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Must be logged in"}, status=401)
    
    try:
        user_to_follow = User.objects.get(username=username)
        if request.user == user_to_follow:
            return JsonResponse({"error": "Cannot follow yourself"}, status=400)
        
        if request.method == "PUT":
            if request.user.following.filter(username=username).exists():
                request.user.following.remove(user_to_follow)
                is_following = False
            else:
                request.user.following.add(user_to_follow)
                is_following = True
                
            return JsonResponse({
                "message": f"Successfully {'unfollowed' if not is_following else 'followed'} {username}",
                "is_following": is_following
            })
            
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)



def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
