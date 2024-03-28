const postsData = document.querySelector("#posts-data");
const spinnerBox = document.querySelector("#spinner-box");
const loadBtn = document.querySelector("#load-btn");
const loadBox = document.querySelector("#load-box");

const postForm = document.querySelector("#post-form");
const titleField = document.querySelector("#id_title");
const bodyField = document.querySelector("#id_body");
const csrf = document.getElementsByName("csrfmiddlewaretoken");

const alertBox = document.querySelector(".alert-box");

const url = window.location.href;

// === CSRF for Ajax === //
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};
const csrftoken = getCookie("csrftoken");
// === === //

// Notify on redirect after delete post
const deletedPost = localStorage.getItem("title");
if (deletedPost) {
  handleAlert("success", `Deleted "${deletedPost}"`);
  localStorage.clear();
}

const likeAndUnlikePostHandler = (e) => {
  e.preventDefault();
  const formId = e.target.getAttribute("data-form-id");
  const clickedBtn = document.querySelector(`#like-unlike-${formId}`);

  $.ajax({
    type: "POST",
    url: "/like-unlike/",
    data: {
      csrfmiddlewaretoken: csrftoken,
      pk: formId,
    },
    success: function (response) {
      console.log(response);
      clickedBtn.textContent =
        (response.liked ? "Unlike" : "Like") + `(${response.like_count || 0})`;
    },
    error: function (err) {
      console.log(err);
    },
  });
};

const likeAndUnlikePost = () => {
  const likeUnlikeForms = [...document.querySelectorAll(".like-unlike-form")];
  // console.log(likeUnlikeForms);
  likeUnlikeForms.forEach((form) => {
    form.addEventListener("submit", likeAndUnlikePostHandler);
  });
};

const renderPost = (post) => {
  return `
  <div class="card mb-2">
    <div class="card-body">
      <h5 class="card-title">${post.title}</h5>
      <p class="card-text post-content">${post.body}</p>
    </div>
    <div class="card-footer">
      <div class="row">
        <div class="col-md-2 col-sm-2">
          <a href="${url}post/${post.id}" class="btn btn-primary">Details</a>
        </div>
        <div class="col-md-2 col-sm-4">
          <form class="like-unlike-form" data-form-id="${post.id}">
            <button href="#" class="btn btn-danger"
              id="like-unlike-${post.id}">
              ${post.liked ? "Unlike" : "Like"} (${post.like_count || 0})
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
  `;
};
// Get all posts
const postsPerLoad = 3;
let visiblePosts = postsPerLoad;
const getData = () => {
  $.ajax({
    type: "GET",
    url: `/posts-data/${visiblePosts}`,
    success: function (response) {
      console.log(response);

      setTimeout(() => {
        spinnerBox.classList.add("hidden");
        const data = response.data;
        data.forEach((post) => {
          postsData.insertAdjacentHTML("beforeend", renderPost(post));
        });
        likeAndUnlikePost();
      }, 100);
      if (response.size === 0) {
        loadBox.textContent = "No posts added...";
      } else if (response.size <= visiblePosts) {
        loadBtn.classList.add("hidden");
        loadBox.textContent = "No more posts to load";
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
};

getData();

postForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: "/",
    data: {
      csrfmiddlewaretoken: csrf[0].value,
      title: titleField.value,
      body: bodyField.value,
    },
    success: function (response) {
      console.log(response);
      // Update posts list
      postsData.insertAdjacentHTML("afterbegin", renderPost(response));
      // Add event listener for like/unlike
      const newLikeUnlikeForm = document.querySelector(
        `.like-unlike-form[data-form-id="${response.id}"]`
      );
      newLikeUnlikeForm.addEventListener("submit", likeAndUnlikePostHandler);
      // Hide modal
      $("#addPostModal").modal("hide");
      // Handle alert
      handleAlert("success", "New post added!✔");
      // Reset input
      postForm.reset();
    },
    error: function (err) {
      console.log(err);
      // Hide modal
      $("#addPostModal").modal("hide");
      handleAlert("danger", "Something went wrong!💥");
      postForm.reset();
    },
  });
});

loadBtn.addEventListener("click", () => {
  spinnerBox.classList.remove("hidden");
  visiblePosts += postsPerLoad;
  getData();
});
