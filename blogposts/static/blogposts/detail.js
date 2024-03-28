console.log("Hello World detail");

const btnBox = document.querySelector("#btn-box");
const postBox = document.querySelector("#post-box");
const backBtn = document.querySelector("#back-btn");
let updateBtn;
let deleteBtn;
let titleUpdateInput;
let bodyUpdateInput;

const updateForm = document.querySelector("#update-form");
const deleteForm = document.querySelector("#delete-form");

const spinnerBox = document.querySelector("#spinner-box");

const url = window.location.href + "data/";
const updateUrl = window.location.href + "update/";
const deleteUrl = window.location.href + "delete/";

const csrf = document.getElementsByName("csrfmiddlewaretoken");

const alertBox = document.querySelector(".alert-box");

backBtn.addEventListener("click", () => {
  history.back();
});

const renderControlBtn = () => {
  btnBox.insertAdjacentHTML(
    "beforeend",
    `
    <button id="update-btn" class="btn btn-primary" 
      data-bs-toggle="modal" data-bs-target="#updatePostModal">Update</button>
    <button id="delete-btn" class="btn btn-danger"
      data-bs-toggle="modal" data-bs-target="#deletePostModal">Delete</button>
    `
  );
  updateBtn = document.querySelector("#update-btn");
  deleteBtn = document.querySelector("#delete-btn");
};

const addFormsListener = () => {
  updateForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.querySelector("#title");
    const body = document.querySelector("#body");
    $.ajax({
      type: "POST",
      url: updateUrl,
      data: {
        csrfmiddlewaretoken: csrf[0].value,
        title: titleUpdateInput.value,
        body: bodyUpdateInput.value,
      },
      success: function (response) {
        console.log(response);
        $("#updatePostModal").modal("hide");
        handleAlert("success", "Post has been updated!✔");
        title.textContent = response.title;
        body.textContent = response.body;
      },
      error: function (err) {
        console.log(err);
        $("#updatePostModal").modal("hide");
        handleAlert("danger", "Something went wrong!💥");
      },
    });
  });
  deleteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    $.ajax({
      type: "POST",
      url: deleteUrl,
      data: {
        csrfmiddlewaretoken: csrf[0].value,
      },
      success: function (response) {
        console.log(response);
        // Redirect to home
        window.location.href = window.location.origin;
        localStorage.setItem("title", titleUpdateInput.value);
      },
      error: function (err) {
        console.log(err);
        handleAlert("danger", "Something went wrong!💥");
      },
    });
  });
};

$.ajax({
  type: "GET",
  url: url,
  success: function (response) {
    console.log(response);
    const data = response.data;
    if (data.logged_in_as === data.author) {
      renderControlBtn();
      titleUpdateInput = document.querySelector("#id_title");
      bodyUpdateInput = document.querySelector("#id_body");
      titleUpdateInput.value = data.title;
      bodyUpdateInput.value = data.body;
      addFormsListener();
    }
    // Display data
    const titleEl = document.createElement("h3");
    titleEl.classList.add("mt-3");
    titleEl.setAttribute("id", "title");
    const bodyEl = document.createElement("p");
    bodyEl.classList.add("mt-1");
    bodyEl.setAttribute("id", "body");

    titleEl.textContent = data.title;
    bodyEl.textContent = data.body;
    postBox.appendChild(titleEl);
    postBox.insertAdjacentHTML("beforeend", "<hr >");
    postBox.appendChild(bodyEl);

    spinnerBox.classList.add("hidden");
  },
  error: function (err) {
    console.log(err);
  },
});
