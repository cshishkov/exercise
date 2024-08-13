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

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function onIncrementLikesClick(e) {
  e.preventDefault();
  console.log("increase");
}

function onDecreaseLikesClick(e) {
  e.preventDefault();
  console.log("decrease");
}

function handleSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("inputName");
  const title = document.getElementById("inputTitle");
  const content = document.getElementById("inputContent");
  const tagContent = document.querySelectorAll("#tag-el");

  const response = {
    title: title.value,
    author: {
      name: name.value,
    },
    content: content.value,
    tags: Array.from(tagContent, (el) => {
      if (el.value !== "" || el.value !== undefined) {
        return el.value;
      }
    }).filter(String),
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

function onDeleteClick(id, e) {
  e.preventDefault();
  const commentElement = document.getElementById(id);
  commentElement.remove();
}


function onEditClick(id, e) {
  e.preventDefault();
  const commentElement = document.getElementById(id);
  const contentElement = commentElement.querySelector(".comment-text");

  const currentText = contentElement.textContent.trim();

  contentElement.innerHTML = `
        <textarea class="form-control edit-textarea" rows="5">${currentText}</textarea>
        <div class="edit-actions mt-2">
            <button class="read-more-button save-edit" onclick="onSaveEditClick('${id}', event);">Save</button>
            <button class="read-more-button cancel-edit" onclick="onCancelEditClick('${id}', event);">Cancel</button>
        </div>
    `;
}

function onCancelEditClick(id, e) {
  e.preventDefault();

  const commentElement = document.getElementById(id);

  const textareaElement = commentElement.querySelector(".edit-textarea");
  const contentElement = commentElement.querySelector(".comment-text");

  const originalText = textareaElement.value.trim();

  contentElement.innerHTML = originalText;
}

function onSaveEditClick(id, e) {
  e.preventDefault();
  const commentElement = document.getElementById(id);

  const textareaElement = commentElement.querySelector(".edit-textarea");
  const contentElement = commentElement.querySelector(".comment-text");

  const newText = textareaElement.value.trim();

  if (newText) {
    contentElement.innerHTML = newText;
  }
}

function onCancelReplyClick(id, e) {
  e.preventDefault();

  const replySection = document.getElementById(`reply-comment-section-${id}`);
  const reply = document.getElementById("inputReply");
  reply.textContent = "";
  replySection.remove();
}

function onReplyClick(id, e) {
  e.preventDefault();

  const commentElement = document.getElementById(id);

  if (commentElement) {
    commentElement.insertAdjacentHTML('beforeend', replySection(id));
  }
}

function onSubmitReplyClick(id, e) {
  e.preventDefault();

  const reply = document.getElementById("inputReply");

  const comment = findCommentById(id);

  if (comment) {
    comment.replies.push({
      id: generateId(),
      author: "John Doe",
      text: reply.value,
      createdAt: new Date().toISOString(),
      likes: 0,
    });
  }

  onCancelReplyClick(id, e);
}

function findCommentById(id) {
  let foundComment = null;
  id = Number(id);

  getData().some((post) => {
    return post.comments.some((com) => {
      if (Number(com.id) === id) {
        foundComment = com;
        return true;
      }
      return false;
    });
  });

  return foundComment;
}

const replySection = (id) => {
  return `
<div id="reply-comment-section-${id}" class="col-12 w-100 px-0 mb--20">
    <div class="comment col-12">
        <form>
            <div class="form-group mb--20">
                <label for="inputReply">Reply</label>
                <textarea class="form-control" id="inputReply" rows="3"></textarea>
            </div>
            <button type="submit" class="read-more-button" onclick="onSubmitReplyClick(${id},event)">Submit</button>
            <button class="read-more-button" onclick="onCancelReplyClick(${id}, event)">Cancel</button>
        </form>
    </div>
</div>
  `;
};

function onShowMoreClick(postId, e) {
  e.preventDefault();

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

const renderPosts = (
  index,
  author,
  date,
  commentsSize,
  title,
  content,
  comments
) => {
  return `
  <div id="article-${index}" class="row gap-2">
    <div class="col-12">
        <span class="w-100 d-flex flex-column flex-sm-row">
            <p class="d-flex gap-1">
                On ${formatDate(date)} by <a href="">${author}</a>
            </p>
            <span class="d-flex gap-2 align-items-center ml-auto">
                <img src="./assets/comment-icon.png" alt="" class="comment-icon" />
                <p> ${commentsSize} Comments </p>
            </span>
        </span>
    </div>
    <div class="col-12">
        <h1>${title}</h1>
    </div>
    <div id="${`text-content-${index}`}" class="col-12">
        ${content}
    </div>
    <div id="${`comment-section-${index}`}" class="col-12">
    ${comments}
    </div>
    <div class="col-12">
      <button id="read-more-${index}" onclick="onShowMoreClick('${index}',event);" class="read-more-button d-flex align-items-center justify-content-center mt-4">
        READ MORE...
      </button>
      </div>
  </div>
  `;
};

const renderComments = (comment = [], offset = false) => {
  return comment
    .map((cm) => {
      return `
<div id="${`${offset ? "sub-comment" : "comment"}-${cm.id}`}" class="row comment-wrapper g-0 ${offset ? " offset" : ""
        }">
    <div class="col-1">
        <div class="d-flex flex-column align-items-center justify-content-between likes-wrapper">
            <img src="./assets/plus-icon.png" alt="" class="likes-icon" onclick="onIncrementLikesClick(event);" />
            <p class="user-select-none">${cm.likes}</p>
            <img src="./assets/minus-icon.png" alt="" class="likes-icon" onclick="onDecreaseLikesClick(event);" />
        </div>
    </div>
    <div class="col-11">
        <div class="row">
            <div class="col-12 d-flex flex-column flex-md-row align-items-center gap-2">
                <img src="./assets/avatar-icon.jpg" alt="" class="avatar-img" />
                <h4 class="m-0">${cm.author}</h4>
                <p>
                    ${calculateDaysDifference(cm.date)}
                </p>

                <span class="d-flex align-items-center ml-auto gap-3 flex-column flex-md-row">
                    <span class="d-flex align-items-center cursor-pointer" onclick="onDeleteClick('${offset ? `sub-comment-${cm.id}` : `comment-${cm.id}`}', event)">
                        <img src="./assets/trash-icon.png" alt="" class="reply-icon" />
                        <p class="font-weight-600">Delete</p>
                    </span>
                   <span class="d-flex align-items-center cursor-pointer" onclick="onEditClick('${offset ? `sub-comment-${cm.id}` : `comment-${cm.id}`}', event)">
                      <img src="./assets/edit-icon.png" alt="" class="reply-icon" />
                      <p class="font-weight-600">Edit</p>
                    </span>
                    ${!offset
          ? ` <span class="d-flex align-items-center cursor-pointer" onclick="onReplyClick(comment-${cm.id}, event)">
                        <img src="./assets/reply-icon.png" alt="" class="reply-icon" />
                        <p class="font-weight-600">Reply</p>
                    </span>`
          : ""
        }
                </span>
            </div>
            <div class="col-12 comment-text">
                <p>${cm.text}</p>
            </div>
        </div>
    </div>
</div>
${renderComments(cm.replies, true)}
    `;
    })
    .join("");
};

const articleSection = document.getElementById("article-content");

articleSection.insertAdjacentHTML(
  "beforeend",
  getData()
    .map((item) => {
      const comments = renderComments(item.comments);
      return renderPosts(
        item.id,
        item.author.name,
        item.createdAt,
        item.comments.length,
        item.title,
        item.content,
        comments
      );
    })
    .join("")
);
