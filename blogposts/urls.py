from django.urls import path
from .views import (
  post_list_and_create,
  load_posts,
  like_unlike_post,
  post_detail,
  post_detail_data_view,
  update_post, delete_post
)

app_name = "blogposts"

urlpatterns = [
  path("", post_list_and_create, name="home-page"),
  path("post/<int:pk>/", post_detail, name="post-detail"),

  path("posts-data/<int:num_posts>", load_posts, name="posts-data"),
  path("like-unlike/", like_unlike_post, name="like-unlike"),
  path("post/<int:pk>/data/", post_detail_data_view, name="post-detail-data"),
  path("post/<int:pk>/update/", update_post, name="post-update"),
  path("post/<int:pk>/delete/", delete_post, name="post-delete"),
]