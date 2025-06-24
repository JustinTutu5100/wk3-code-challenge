document.addEventListener("DOMContentLoaded", main);
let selectedPost = null;
function main() {
  displayPosts();
  addNewPostListener();
  addEditFormListeners();
}

function displayPosts() {
  fetch("http://localhost:3000/posts")
    .then(res => res.json())
    .then(posts => {
      const postList = document.getElementById("post-list");
      postList.innerHTML = "";
      posts.forEach(post => {
        const div = document.createElement("div");
        div.textContent = post.title;
        div.classList.add("cursor-pointer");
        div.addEventListener("click", () => handlePostClick(post.id));
        postList.appendChild(div);
      });

      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      }
    });
}

function handlePostClick(id) {
  fetch(`http://localhost:3000/posts/${id}`)
    .then(res => res.json())
    .then(post => {
      selectedPost = post;

      const detail = document.getElementById("post-detail");
      detail.innerHTML = `
        <h2>${post.title}</h2>
        <img src="${post.image}" width="200" />
        <p><strong>Author:</strong> ${post.author}</p>
        <p>${post.content}</p>
        <button id="edit-button">Edit</button>
        <button id="delete-button" style="margin-left: 10px; background-color: red; color: white;">Delete</button>
      `;

      document.getElementById("edit-button").addEventListener("click", showEditForm);
      document.getElementById("delete-button").addEventListener("click", deletePost);
    });
}

function addNewPostListener() {
  const form = document.getElementById("new-post-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newPost = {
      title: form.title.value,
      author: form.author.value,
      image: form.image.value || "https://via.placeholder.com/150",
      content: form.content.value
    };

    fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newPost)
    })
      .then(res => res.json())
      .then(() => {
        displayPosts();
        form.reset();
      });
  });
}

function showEditForm() {
  const form = document.getElementById("edit-post-form");
  document.getElementById("edit-title").value = selectedPost.title;
  document.getElementById("edit-content").value = selectedPost.content;
  form.classList.remove("hidden");
}

function addEditFormListeners() {
  const editForm = document.getElementById("edit-post-form");

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const updatedPost = {
      title: document.getElementById("edit-title").value,
      content: document.getElementById("edit-content").value
    };

    fetch(`http://localhost:3000/posts/${selectedPost.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedPost)
    })
      .then(res => res.json())
      .then(data => {
        selectedPost.title = data.title;
        selectedPost.content = data.content;
        displayPosts();
        handlePostClick(selectedPost.id);
        editForm.classList.add("hidden");
      });
  });

  document.getElementById("cancel-edit").addEventListener("click", () => {
    editForm.classList.add("hidden");
  });
}

function deletePost() {
  const confirmDelete = confirm(`Are you sure you want to delete "${selectedPost.title}"?`);
  if (!confirmDelete) return;

  fetch(`http://localhost:3000/posts/${selectedPost.id}`, {
    method: "DELETE"
  })
    .then(() => {
      selectedPost = null;
      document.getElementById("post-detail").innerHTML = "<p>Post deleted.</p>";
      displayPosts();
    });
}
