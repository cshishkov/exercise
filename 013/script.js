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

  const reply = document.getElementById("inputReply");
  const commentElement = e.target.closest(".row");
  // const comment = comment("asd", new Date(), "asdasdasdasdasdasd", 10, 1);

  // commentElement.insertAdjacentHTML(
  //   "beforeend",
  //   comment("asd", new Date(), "asdasdasdasdasdasd", 10, 1)
  // );

  onCancelReplyClick(e);
}

function onCancelReplyClick(e) {
  e.preventDefault();

  const replySection = e.target.closest("#reply-comment-section");
  const reply = document.getElementById("inputReply");
  reply.textContent = "";
  replySection.remove();
}

const replySection = () => {
  return `
<div id="reply-comment-section" class="w-100 px-0 mb--20">
    <div class="comment col-12">
        <form>
            <div class="form-group mb--20">
                <label for="inputReply">Reply</label>
                <textarea class="form-control" id="inputReply" rows="3"></textarea>
            </div>
            <button type="submit" class="read-more-button" onclick="onSubmitReplyClick(event)">Submit</button>
            <button class="read-more-button" onclick="onCancelReplyClick(event)">Cancel</button>
        </form>
    </div>
</div>
  `;
};

const comment = (author, date, content, likes, offset) => {
  return `
            <div class="row" ${offset ? "" : 'style = "margin-top:20px;"'}>
              <div class="comment d-flex col-12 m--y-20 ${
                offset ? " max--width-90" : ""
              }">
                  <div class="d-flex flex-column align-items-center justify-content-between likes-wrapper">
                      <img src="./assets/plus-icon.png" alt="" class="likes-icon" onclick="onIncrementLikesClick(event);" />
                      <p class="user-select-none">${likes}</p>
                      <img src="./assets/minus-icon.png" alt="" class="likes-icon" onclick="onDecreaseLikesClick(event);" />
                  </div>
                  <span class="w-100">
                      <div class="d-flex align-items-center justify-content-start gap-3">
                          <span class="d-flex flex-column flex-md-row gap-3">
                              <span class="d-flex flex-column flex-md-row gap-3">
                                  <img src="./assets/avatar-icon.jpg" alt="" class="avatar-img" />
                                  <h4 class="p-0 m-0">${author}</h4>
                              </span>
                              <p class="align-self-center">${calculateDaysDifference(
                                date
                              )}</p>
                          </span>
                          <span class="d-flex align-items-center ml-auto gap-3 flex-column flex-md-row">
                              <span class="d-flex align-items-center cursor-pointer" onclick="onDeleteClick(event)">
                                  <img src="./assets/trash-icon.png" alt="" class="reply-icon" />
                                  <p class="font-weight-600">Delete</p>
                              </span>
                              <span class="d-flex align-items-center cursor-pointer" onclick="onEditClick(event)">
                                  <img src="./assets/edit-icon.png" alt="" class="reply-icon" />
                                  <p class="font-weight-600">Edit</p>
                              </span>
                              ${!offset && replyIcon()}
                          </span>
                      </div>
                      <div class="comment-text">${content}</div>
                  </span>
              </div>
          </div>
    `;
};

const replyIcon = () => {
  return `
 <span
   class="d-flex align-items-center cursor-pointer"
   onclick="onReplyClick(event)"
 >
   <img
     src="./assets/reply-icon.png"
     alt=""
     class="reply-icon"
   />
   <p class="font-weight-600">Reply</p>
 </span>
`;
};

const blogPosts = (
  id,
  date,
  author,
  commentsSize,
  title,
  content,
  tags,
  commentsHTML
) => {
  return `
        <div class="d-flex flex-column col-12 align-items-start blog-post" data-post-id="${id}">
            <span class="w-100 d-flex flex-column flex-sm-row">
                <p class="d-flex gap-1">
                On ${formatDate(date)} by <a href="">${author}</a>
                 </p>
                 <span class="d-flex gap-2 align-items-center ml-auto">
                 <img src="./assets/comment-icon.png" alt="" class="comment-icon"/>
                 <p> ${commentsSize} Comments </p>
                 </span>
            </span>
            <h1 class="my-2">${title}</h1>
            <p class="hidden-text" id="text-content-${id}">
                ${content}
            </p>
            <div class="d-flex gap-2 flex-row flex-wrap">
            ${
              tags &&
              tags
                .map((tag) => {
                  return `<h6 class="tag">#${tag}</h6>`;
                })
                .join("")
            }
            </div>
             <div id="comment-section-${id}" class="comments-section row d-none">
                ${commentsHTML}
            </div>
            <button id="read-more-${id}" onclick="onShowMoreClick('${id}');" class="read-more-button d-flex align-items-center justify-content-center mt-4">
                READ MORE...
            </button>
        </div>
    `;
};

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

const renderComments = (comments) => {
  return comments
    .map((cm) => {
      const commentHTML = comment(cm.author, cm.createdAt, cm.text, cm.likes);

      let nestedCommentsHTML = "";
      if (cm.replies && cm.replies.length > 0) {
        nestedCommentsHTML = cm.replies
          .map((rep) => {
            return comment(rep.author, rep.createdAt, rep.text, rep.likes, 1);
          })
          .join("");
      }

      return commentHTML + nestedCommentsHTML;
    })
    .join("");
};

const articleSection = document.getElementById("article-section");

articleSection.innerHTML = getData()
  .map((item, index) => {
    const commentsHTML = renderComments(item.comments);
    return blogPosts(
      index,
      item.createdAt,
      item.author.name,
      item.comments.length,
      item.title,
      item.content,
      item.tags,
      commentsHTML
    );
  })
  .join("");
