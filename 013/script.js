const url = "http://localhost:3000";

class AxiosPP {
  constructor(url) {
    if (AxiosPP.instance) {
      return AxiosPP.instance;
    }

    this._url = url;
    AxiosPP.instance = this;
  }

  get url() {
    return this._url;
  }

  set url(url) {
    this._url = url;
  }

  async get(url) {
    try {
      const response = await fetch(url ? `${this._url}/${url}` : this._url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async post(data) {
    try {
      const response = await fetch(this._url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${this._url} /${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

const apiClient = new AxiosPP(url);

document.addEventListener("DOMContentLoaded", fetchData());
const postStates = {};

async function fetchData() {
  const getData = await apiClient.get("posts");
  localStorage.setItem("posts", JSON.stringify(getData));
}

function getData() {
  return JSON.parse(localStorage.getItem("posts"));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function calculateDaysDifference(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  intervals.map((interval) => {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      if (count === 1) {
        return `${count} ${interval.label} ago`;
      } else {
        return `${count} ${interval.label}s ago`;
      }
    }
  });

  return "just now";
}

function onIncrementLikesClick(e) {
  e.preventDefaults();
}

function onDecreaseLikesClick(e) {
  e.preventDefaults();
}

function handleSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("inputName");
  const title = document.getElementById("inputTitle");
  const content = document.getElementById("inputContent");
  const tagContent = document.querySelectorAll("#tag-el");

  tagContent.forEach((element) => {
    console.log(element.value);
  });

  const response = {
    title: title.value,
    author: {
      name: name.value,
    },
    content: content.value,
    tags: Array.from(tagContent, (el) => {
      if (el.value !== "") {
        return el.value;
      }
    }),
  };

  console.log(response);
}

function onAddPostClick(e) {
  e.preventDefault();
  const formContainer = document.getElementById("add-post-container");
  formContainer.innerHTML = addPostForm();
}

let tagsCount = 1;
function onAddTagClick(e) {
  e.preventDefault();

  const tagsWrapper = document.getElementById("tags-wrapper");

  tagsWrapper.insertAdjacentHTML("afterbegin", addTags());

  tagsCount++;
}

function addTags() {
  return `
      <input id="tag-el" type="text" class="form-control tag-element" placeholder="Tag" >
  `;
}

const addPostForm = () => {
  return `
<div class="col-12">
    <form id="add-post-form">
        <div class="form-row">
            <div class="form-group col-12">
                <label for="inputName">Name</label>
                <input type="text" class="form-control" id="inputName" placeholder="Name">
            </div>
            <div class="form-group col-12">
                <label for="inputTitle">Title</label>
                <input type="text" class="form-control" id="inputTitle" placeholder="Title">
            </div>
            <div class="form-group col-12">
                <label for="inputContent">Content</label>
                <textarea type="text" class="form-control" id="inputContent" placeholder="Content"></textarea>
            </div>
            <div class="col-12">
                <label for="inputTag">Tags 
                <img src="./assets/plus-icon.png" alt="" class="comment-icon cursor-pointer" onclick="onAddTagClick(event);"/>
                </label>
                <div class="row">
                    <div id="tags-wrapper" class="col-12 d-flex flex-wrap align-items-center gap-1">
                        <input id="tag-el" type="text" class="form-control tag-element" placeholder="Tag">
                    </div>
                </div>
            </div>
        </div>
          <button type="submit" class="" onclick="handleSubmit(event);">Submit</button>
    </form>
</div>
  `;
};

function onDeleteClick(e) {
  e.preventDefault();
  const commentElement = e.target.closest(".row");
  commentElement.remove();
}

function onEditClick(e) {
  e.preventDefault();
  const commentElement = e.target.closest(".comment");
  const contentElement = commentElement.querySelector(".comment-text");

  const currentText = contentElement.textContent.trim();

  contentElement.innerHTML = `
        <textarea class="form-control edit-textarea" rows="5">${currentText}</textarea>
        <div class="edit-actions mt-2">
            <button class="read-more-button save-edit">Save</button>
            <button class="read-more-button cancel-edit">Cancel</button>
        </div>
    `;

  const saveButton = commentElement.querySelector(".save-edit");
  const cancelButton = commentElement.querySelector(".cancel-edit");

  saveButton.addEventListener("click", onSaveEditClick);
  cancelButton.addEventListener("click", onCancelEditClick);
}

function onSaveEditClick(e) {
  e.preventDefault();
  const commentElement = e.target.closest(".comment");
  const textareaElement = commentElement.querySelector(".edit-textarea");
  const contentElement = commentElement.querySelector(".comment-text");

  const newText = textareaElement.value.trim();

  if (newText) {
    contentElement.innerHTML = newText;
  } else {
    onCancelEditClick(e);
  }
}

function onCancelEditClick(e) {
  e.preventDefault();
  const commentElement = e.target.closest(".comment");
  const textareaElement = commentElement.querySelector(".edit-textarea");
  const contentElement = commentElement.querySelector(".comment-text");

  const originalText = textareaElement.value.trim();

  contentElement.innerHTML = originalText;
}

function onReplyClick(e) {
  e.preventDefault();

  const commentElement = e.target.closest(".row");
  commentElement.insertAdjacentHTML("beforeend", replySection());
}

function onSubmitReplyClick(e) {
  e.preventDefault();

  const reply = document.getElementById("inputReply").value;

  const commentElement = e.target.closest(".row");
  const commentId = commentElement.dataset.commentId;

  const comment = findCommentById(commentId);

  comment.replies.push({
    id: generateUniqueId(),
    author: "John Doe",
    text: reply,
    createdAt: new Date().toISOString(),
    likes: 0,
  });

  const commentsHTML = renderComments(getComments());
  const commentSection = document.getElementById(
    `comment-section-${comment.postId}`
  );
  commentSection.innerHTML = commentsHTML;

  onCancelReplyClick(e);
}

function findCommentById(id) {
  let foundComment = null;
  getData().some((post) => {
    return post.comments.some((comment) => {
      if (comment.id === id) {
        foundComment = comment;
        return true;
      }
      return false;
    });
  });
  return foundComment;
}

function generateUniqueId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function onCancelReplyClick(e) {
  e.preventDefault();

  const replySection = e.target.closest("#reply-comment-section");
  const reply = document.getElementById("inputReply");
  reply.textContent = "";
  replySection.remove();
}

function createButton({ text, icon, onClick, extraClasses = "" }) {
  return `
    <button class="btn btn-link p-0 ${extraClasses}" onclick="${onClick}">
      <img src="${icon}" alt="${text} icon" class="reply-icon" />
      <span class="font-weight-600">${text}</span>
    </button>
  `;
}

function createCommentHeader(author, date) {
  return `
    <div class="d-flex gap-3">
      <img src="./assets/avatar-icon.jpg" alt="" class="avatar-img" />
      <h4 class="m-0">${author}</h4>
      <p class="m-0 align-self-center">${calculateDaysDifference(date)}</p>
    </div>
  `;
}

function createCommentActions(offset) {
  return `
    <div class="d-flex align-items-center ml-auto gap-3">
      ${createButton({
        text: "Delete",
        icon: "./assets/trash-icon.png",
        onClick: "onDeleteClick(event);",
      })}
      ${createButton({
        text: "Edit",
        icon: "./assets/edit-icon.png",
        onClick: "onEditClick(event);",
      })}
      ${!offset ? createReplyButton() : ""}
    </div>
  `;
}

function createReplyButton() {
  return createButton({
    text: "Reply",
    icon: "./assets/reply-icon.png",
    onClick: "onReplyClick(event)",
  });
}

function createLikeButtons(likes) {
  return `
    <div class="d-flex flex-column align-items-center likes-wrapper">
      ${createButton({
        text: "",
        icon: "./assets/plus-icon.png",
        onClick: "onIncrementLikesClick(event);",
      })}
      <p class="user-select-none m-0">${likes}</p>
      ${createButton({
        text: "",
        icon: "./assets/minus-icon.png",
        onClick: "onDecreaseLikesClick(event);",
      })}
    </div>
  `;
}

function createCommentContent(content) {
  return `
    <p class="comment-text mt-2">${content}</p>
  `;
}

function renderComment(author, date, content, likes, offset = false) {
  return `
    <div class="row ${offset ? "mt-3" : "mt-4"}">
      <div class="comment d-flex col-12 ${offset ? "max-w-90" : ""}">
        ${createLikeButtons(likes)}
        <div class="w-100">
          <div class="d-flex align-items-center justify-content-start gap-3">
            ${createCommentHeader(author, date)}
            ${createCommentActions(offset)}
          </div>
          ${createCommentContent(content)}
        </div>
      </div>
    </div>
  `;
}

function renderComments(comments) {
  return comments
    .map((cm) => {
      const commentHTML = renderComment(
        cm.author,
        cm.createdAt,
        cm.text,
        cm.likes
      );
      const nestedCommentsHTML =
        cm.replies?.length > 0
          ? cm.replies
              .map((rep) =>
                renderComment(
                  rep.author,
                  rep.createdAt,
                  rep.text,
                  rep.likes,
                  true
                )
              )
              .join("")
          : "";
      return commentHTML + nestedCommentsHTML;
    })
    .join("");
}

function createBlogHeader(id, date, author, commentsSize) {
  return `
    <div class="d-flex justify-content-between">
      <p>On ${formatDate(date)} by <a href="#">${author}</a></p>
      <div class="d-flex gap-2 align-items-center">
        <img src="./assets/comment-icon.png" alt="Comments" class="comment-icon"/>
        <p>${commentsSize} Comments</p>
      </div>
    </div>
  `;
}

function createBlogTitle(title) {
  return `<h1 class="my-2">${title}</h1>`;
}

function createBlogContent(id, content) {
  return `<p class="hidden-text" id="text-content-${id}">${content}</p>`;
}

function createBlogTags(tags) {
  return `
    <div class="d-flex gap-2 flex-wrap mt-2">
      ${tags
        .map((tag) => `<span class="badge badge-secondary">#${tag}</span>`)
        .join("")}
    </div>
  `;
}

function createCommentSection(id, commentsHTML) {
  return `
    <div id="comment-section-${id}" class="comments-section d-none">
      ${commentsHTML}
    </div>
  `;
}

function createReadMoreButton(id) {
  return `
    <button id="read-more-${id}" onclick="onShowMoreClick('${id}');" class="btn btn-link mt-4">
      READ MORE...
    </button>
  `;
}

function renderBlogPost(post, index) {
  const commentsHTML = renderComments(post.comments);
  return `
    <div class="col-12 blog-post" data-post-id="${index}">
      ${createBlogHeader(
        index,
        post.createdAt,
        post.author.name,
        post.comments.length
      )}
      ${createBlogTitle(post.title)}
      ${createBlogContent(index, post.content)}
      ${createBlogTags(post.tags)}
      ${createCommentSection(index, commentsHTML)}
      ${createReadMoreButton(index)}
    </div>
  `;
}

function renderBlogPosts(posts) {
  return posts.map((post, index) => renderBlogPost(post, index)).join("");
}

function onShowMoreClick(postId) {
  const content = document.getElementById(`text-content-${postId}`);
  const commentSection = document.getElementById(`comment-section-${postId}`);
  const button = document.getElementById(`read-more-${postId}`);

  content.classList.toggle("hidden-text");
  commentSection.classList.toggle("d-none");

  if (postStates[postId]) {
    button.textContent = "READ MORE...";
  } else {
    button.textContent = "HIDE";
  }

  postStates[postId] = !postStates[postId];
}

function renderBlogPosts(posts) {
  return posts
    .map((post, index) => {
      const commentsHTML = renderComments(post.comments);
      return blogPosts(
        index,
        post.createdAt,
        post.author.name,
        post.comments.length,
        post.title,
        post.content,
        post.tags,
        commentsHTML
      );
    })
    .join("");
}

const articleSection = document.getElementById("article-section");
articleSection.innerHTML = renderBlogPosts(getData());
