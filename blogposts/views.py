from django.shortcuts import render
from .models import Post
from django.http import JsonResponse
from .forms import PostForm
from profiles.models import Profile


def is_ajax(request):
  return request.headers.get('x-requested-with') == 'XMLHttpRequest'

# Create your views here.
def post_list_and_create(request):
  form = PostForm(request.POST or None)
  if is_ajax(request):
    if form.is_valid():
      author = Profile.objects.get(user=request.user)
      instance = form.save(commit=False)  # not save form yet
      instance.author = author
      instance.save()   # save new post
      return JsonResponse({
        "id": instance.id,
        "title": instance.title,
        "body": instance.body,
        "author": instance.author.user.username
      })
  context = {
    "form": form
  }
  return render(request, "blogposts/main.html", context)

def load_posts(request, **kwargs):
  if is_ajax(request):
    visible_posts = 3
    end = kwargs.get("num_posts") or visible_posts
    start = end - visible_posts

    query_set = Post.objects.all().order_by("-created")
    size = query_set.count()
    data = []
    for post in query_set:
      item = {
        "id": post.pk,
        "title": post.title,
        "body": post.body,
        "liked": True if request.user in post.liked.all() else False,
        "like_count": post.like_count,
        "author": post.author.user.username
      }
      data.append(item)
    return JsonResponse({"data": data[start:end], "size": size})
  else:
    return JsonResponse({"error": "This endpoint is for AJAX requests only."}, status=400)

def like_unlike_post(request):
  if is_ajax(request):
    pk = request.POST.get("pk")
    post_obj = Post.objects.get(pk=pk)
    if request.user in post_obj.liked.all():
      # user already liked post
      liked = False
      post_obj.liked.remove(request.user)
    else:
      # user has not liked post
      liked = True
      post_obj.liked.add(request.user)
    post_obj.save()
    return JsonResponse({"liked": liked, "like_count": post_obj.like_count})
  return JsonResponse({"error": "Not AJAX requests"})

def post_detail(request, **kwargs):
  pk = kwargs.get("pk")
  post_obj = Post.objects.get(pk=pk)
  form = PostForm()
  context = {
    "post_obj": post_obj,
    "form": form
  }
  return render(request, "blogposts/detail.html", context)

def post_detail_data_view(request, **kwargs):
  pk = kwargs.get("pk")
  post_obj = Post.objects.get(pk=pk)
  data = {
    "id": post_obj.pk,
    "title": post_obj.title,
    "body": post_obj.body,
    "author": post_obj.author.user.username,
    "logged_in_as": request.user.username
  }
  return JsonResponse({"data": data})

def update_post(request, **kwargs):
  pk = kwargs.get("pk")
  post_obj = Post.objects.get(pk=pk)
  if is_ajax(request):
    post_obj.title = request.POST.get("title")
    post_obj.body = request.POST.get("body")
    post_obj.save()
  return JsonResponse({"title": post_obj.title, "body": post_obj.body})

def delete_post(request, **kwargs):
  pk = kwargs.get("pk")
  post_obj = Post.objects.get(pk=pk)
  if is_ajax(request):
    post_obj.delete()
    return JsonResponse({})
  return JsonResponse({"error": "Not AJAX request"}, status=400)