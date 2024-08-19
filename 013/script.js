/**
 * @typedef {Object} Author
 * @property {string} name
 */

/**
 * @typedef {Object} Comment
 * @property {string} id
 * @property {string} author
 * @property {string} text
 * @property {string} createdAt
 * @property {number} likes
 * @property {Reply[]} replies
 */

/**
 * @typedef {Object} Reply
 * @property {string} id
 * @property {string} author
 * @property {string} text
 * @property {string} createdAt
 * @property {number} likes
 */

/**
 * @typedef {Object} Article
 * @property {number} id
 * @property {string} title
 * @property {Author} author
 * @property {string} createdAt
 * @property {string} content
 * @property {string[]} tags
 * @property {Comment[]} comments
 * @property {number} likes
 * @property {number} views
 */

class DataService {
  /**
   * @param {string} apiUrl
   */
  constructor(apiUrl) {
    if (DataService.instance) {
      return DataService.instance;
    }
    /** @type {string} */
    this.apiUrl = apiUrl;
    /** @type {Article[]} */
    this.data = [];
    DataService.instance = this;
  }

  /**
   * @returns {Promise<Article[] | null>}
   */
  async getAll() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error("Error fetching all data:", error);
      return null;
    }
  }

  /**
   * @param {number} id
   * @returns {Promise<Article | null>}
   */
  async getById(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching data by ID:", error);
      return null;
    }
  }

  /**
   * @param {Article} article
   * @returns {Promise<Article | null>}
   */
  async create(article) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
      });
      if (!response.ok) {
        throw new Error(`Error creating data: ${response.statusText}`);
      }
      const newArticle = await response.json();
      this.data.push(newArticle);
      return newArticle;
    } catch (error) {
      console.error("Error creating data:", error);
      return null;
    }
  }

  /**
   * @param {Article} article
   * @returns {Promise<Article | null>}
   */
  async update(article) {
    if (!article.id) {
      throw new Error("Article must have an ID to be updated");
    }

    try {
      const response = await fetch(`${this.apiUrl}/${article.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        throw new Error(`Error updating data: ${response.statusText}`);
      }

      const updatedArticle = await response.json();
      const index = this.data.findIndex((item) => item.id === article.id);
      if (index !== -1) {
        this.data[index] = updatedArticle;
      }
      return updatedArticle;
    } catch (error) {
      console.error("Error updating data:", error);
      return null;
    }
  }

  /**
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Error deleting data: ${response.statusText}`);
      }
      this.data = this.data.filter((article) => article.id !== id);
      return true;
    } catch (error) {
      console.error("Error deleting data:", error);
      return false;
    }
  }

  /**
   * @returns {Article[]}
   */
  getData() {
    return this.data;
  }
}

/**
 *
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 *
 * @param {string} createdDate
 * @returns
 */
function calculateDaysDifference(createdDate) {
  const createdAt = new Date(createdDate);
  const currentDate = new Date();

  const differenceInTime = currentDate.getTime() - createdAt.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

  return differenceInDays === 0 ? "Today" : `${differenceInDays} days ago`;
}

/**
 *
 * @returns {string}
 */
function generateUniqueId() {
  return Math.random().toString(36).slice(2, 9);
}

const apiUrl = "http://localhost:3000/api/articles";
const dataService = new DataService(apiUrl);

/**
 * @returns {Promise<void>}
 */
async function loadData() {
  try {
    await dataService.getAll();
    renderArticles(dataService.getData());
  } catch (error) {
    console.error(error);
  }
}

/**
 * @param {Article[]} articles
 */
function renderArticles(articles) {
  const articleContainer = document.getElementById("article-content");

  articleContainer.insertAdjacentHTML(
    "beforeend",
    articles
      .map((article) => {
        const comments = renderComments(
          article.id,
          article.comments.length > 0 ? article.comments.id : 0,
          article.comments
        );
        return renderArticle(
          article.id,
          article.author.name,
          article.createdAt,
          article.comments.length > 0 ? article.comments.length : 0,
          article.title,
          article.content,
          article.tags,
          comments
        );
      })
      .join("")
  );
}



/**
 *
 * @param {number} articleId
 * @param {number} commentId
 * @param {Comment[]} comment
 * @param {boolean} offset [offset=false]
 */
function renderComments(articleId, commentId, comments, offset = false) {
  const offsetClass = offset ? "ms-5" : "";

  return comments
    .map((comment) => {
      const repliesHtml = Array.isArray(comment.replies)
        ? renderComments(articleId, comment.id, comment.replies, true)
        : "";

      const commentIdHtml = offset
        ? `sub-comment-${articleId}-${commentId}-${comment.id}`
        : `comment-${articleId}-${comment.id}`;

      const renderRepliesText = repliesHtml
        ? `<p class="replies color-purple-515 font-weight-600 d-flex align-items-center gap-1 cursor-pointer" onclick="toggleReplies('${commentIdHtml}')">
        <img src="./assets/reply-icon.svg" alt="Reply icon" class="comment-icon"/>
        Show Replies</p>`
        : "";

      const buttons = {
        delete: createButton('trash-icon.svg', 'color-red-d79', 'Delete', commentIdHtml, 'onDeleteClick'),
        reply: !offset ? createButton('reply-icon.svg', 'color-purple-515', 'Reply', commentIdHtml, 'onReplyClick') : '',
        edit: createButton('edit-icon.svg', 'color-purple-515', 'Edit', commentIdHtml, 'onEditClick'),
      };

      return `
  <div id='${commentIdHtml}' class="row comment mt-2 ${offsetClass} p-3">
    <div class="col-1">
      <div class="d-flex flex-column align-items-center justify-content-center likes-wrapper gap-3">
        <img src="./assets/plus-icon.svg" alt="Plus icon" class="likes-icon" onclick="onIncrementLikesClick('${commentIdHtml}')"/>
        <span class="font-weight-600 color-purple-515 likes-count">${comment.likes}</span>
        <img src="./assets/minus-icon.svg" alt="Minus icon" class="likes-icon" onclick="onDecreaseLikesClick('${commentIdHtml}')"/>
      </div>
    </div>
    <div class="col-11">
      <div class="row">
        <div class="col-12 d-flex flex-column flex-md-row justify-content-between">
        <span class="d-flex align-items-center gap-2 p-2 p-md-0">
          <img src="./assets/avatar-icon.jpeg" alt="" class="avatar-img" />
          <h5 class="m-0 text-nowrap">${comment.author}</h5>
          <p class="color-gray-8c8">
            ${calculateDaysDifference(comment.createdAt)}
          </p>
          </span>
          <span class="d-flex align-items-center gap-1">
          ${buttons.edit}
          ${buttons.delete}
          ${buttons.reply}
          </span>
        </div>
        <div class="col-12">
        <p class="comment-text">${comment.text}</p>
        </div>
        
      </div>
      ${renderRepliesText}
    </div>
  </div>
 <div id="replies-${commentIdHtml}" class="replies-container d-none">
            ${repliesHtml}
          </div>
`;
    })
    .join("");
}

/**
 *
 * @param {string} commentIdHtml
 * @param {string} updatedContent
 */
async function updateCommentData(commentIdHtml, updatedContent) {
  const [articleId, commentId, subCommentId] = extractIds(commentIdHtml);

  const article = dataService.getData().find((a) => a.id === articleId);
  const comment = article.comments.find((c) => c.id === commentId);
  let commentToUpdate = comment;

  if (subCommentId) {
    const subComment = comment.replies.find((r) => r.id === subCommentId);
    if (!subComment) return;

    commentToUpdate = subComment;
  }

  commentToUpdate.text = updatedContent;

  try {
    await dataService.update(article);
    getData();
  } catch (err) {
    console.error("Error updating comment:", err);
  }
}


/**
 *
 * @param {string} commentId
 * @param {Event} event
 */
async function onSaveEditClick(commentId, event) {
  event.stopPropagation();

  const commentElement = document.getElementById(commentId);
  const textarea = commentElement.querySelector(".edit-textarea");
  const updatedText = textarea.value.trim();

  try {
    await updateCommentData(commentId, updatedText);

    const contentElement = commentElement.querySelector(".comment-text");
    if (contentElement) {
      contentElement.textContent = updatedText;
    }
  } catch (err) {
    console.error("Failed to update comment:", err);
  }
}


/**
 *
 * @param {string} commentId
 * @param {Event} event
 */
function onCancelEditClick(commentId, event) {
  event.stopPropagation();

  const commentElement = document.getElementById(commentId);
  const contentElement = commentElement.querySelector(".comment-text");

  const originalText = contentElement.dataset.originalText;

  contentElement.innerHTML = originalText;
}

/**
 *
 * @param {string} commentId
 */
function onEditClick(commentId) {
  const commentElement = document.getElementById(commentId);
  if (!commentElement) return;

  const contentElement = commentElement.querySelector(".comment-text");
  if (!contentElement) return;

  if (commentElement.querySelector(".edit-textarea")) return;

  const currentText = contentElement.textContent.trim();

  contentElement.dataset.originalText = currentText;

  contentElement.innerHTML = `
    <textarea class="form-control edit-textarea" rows="5">${currentText}</textarea>
    <div class="edit-actions mt-2">
      <button class="button-primary outline-none border-none save-edit" onclick="onSaveEditClick('${commentId}', event);">Save</button>
      <button class="button-primary outline-none border-none cancel-edit" onclick="onCancelEditClick('${commentId}', event);">Cancel</button>
    </div>
  `;
}


/**
 *
 * @param {string} id
 */
function toggleReplies(id) {
  const repliesContainer = document.getElementById(`replies-${id}`);
  const toggleButton = document.querySelector(`p[onclick="toggleReplies('${id}')"]`);

  if (repliesContainer && toggleButton) {
    repliesContainer.classList.toggle("d-none");

    const imgElement = toggleButton.querySelector('img');
    if (repliesContainer.classList.contains("d-none")) {
      toggleButton.textContent = "Show Replies";
    } else {
      toggleButton.textContent = "Hide Replies";
    }

    toggleButton.prepend(imgElement);
  }
}

/**
 * Handles likes increment or decrement for a comment.
 * @param {string} commentIdHtml
 * @param {number} change
 */
function updateLikes(commentIdHtml, change) {
  const commentElement = document.getElementById(commentIdHtml);
  if (!commentElement) return;

  const likesElement = commentElement.querySelector(".likes-count");
  if (!likesElement) return;

  let currentLikes = parseInt(likesElement.textContent, 10);
  if (isNaN(currentLikes)) return;

  const updatedLikes = Math.max(0, currentLikes + change);
  likesElement.textContent = updatedLikes;

  updateLikesData(commentIdHtml, updatedLikes);
}

/**
 * 
 * @param {string} commentIdHtml
 */
function onIncrementLikesClick(commentIdHtml) {
  updateLikes(commentIdHtml, 1);
}

/**
 * 
 * @param {string} commentIdHtml
 */
function onDecreaseLikesClick(commentIdHtml) {
  updateLikes(commentIdHtml, -1);
}

/**
 * 
 * @param {string} commentIdHtml
 * @param {number} updatedLikes
 */
async function updateLikesData(commentIdHtml, updatedLikes) {
  const [articleId, commentId, subCommentId] = extractIds(commentIdHtml);

  const article = dataService.getData().find((a) => a.id === articleId);

  const comment = article.comments.find((c) => c.id === commentId);

  if (subCommentId) {
    const subComment = comment.replies.find((r) => r.id === subCommentId);
    if (subComment) {
      subComment.likes = updatedLikes;
    }
  } else {
    comment.likes = updatedLikes;
  }

  try {
    await dataService.update(article);
    getData();
  } catch (err) {
    console.error("Failed to update likes:", err);
  }
}

/**
 *
 * @param {number} commentId
 */
function onReplyClick(commentId) {
  const replyComment = document.getElementById(commentId);

  if (replyComment.querySelector(".reply-form")) {
    return;
  }

  const replyFormHtml = `
    <div class="reply-form mt-2 comment row">
      <div class="col-12">
        <h3>Reply to comment</h3>
      </div>
      <div class="col-12">
        <textarea required class="form-control" rows="3" placeholder="Write your reply..."></textarea>
        <div class="mt-2 d-flex gap-2">
          <button class="btn btn-primary" onclick="onSubmitReply('${commentId}')">Submit</button>
          <button class="btn btn-secondary" onclick="onCancelReply('${commentId}')">Cancel</button>
        </div>
      </div>
    </div>
  `;

  replyComment.insertAdjacentHTML("afterend", replyFormHtml);
}

/**
 *
 * @param {string} commentId
 */
async function onSubmitReply(commentId) {
  const replyForm = document.getElementById(commentId).nextElementSibling;

  const replyText = replyForm.querySelector("textarea").value.trim();
  if (!replyText) {
    return;
  }

  const [articleId, commentsId, subCommentId] = extractIds(commentId);

  const updatedData = dataService.getData();
  const article = updatedData.find((article) => article.id == articleId);
  const comment = findCommentById(article.comments, commentsId, subCommentId);

  const newReply = {
    id: generateUniqueId(),
    author: "John Doe",
    text: replyText,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  comment.replies.push(newReply);

  try {
    await dataService.update(article);
    loadData();
  } catch (err) {
    console.error("Failed to update article with new reply:", err);
  }
}

/**
 * @param {Comment[]} comments
 * @param {number} commentId
 * @param {number} subCommentId
 */
function findCommentById(comments, commentId, subCommentId = null) {
  const comment = comments.find((comment) => comment.id == commentId);
  if (!comment) {
    return null;
  }

  if (!subCommentId) {
    return comment;
  }

  const reply = comment.replies.find((reply) => reply.id == subCommentId);
  return reply || null;
}

/**
 * @param {string} commentId
 */
function onCancelReply(commentId) {
  const replyForm = document.getElementById(commentId).nextElementSibling;
  if (replyForm && replyForm.classList.contains("reply-form")) {
    replyForm.remove();
  }
}

/**
 * @param {string} commentIdHtml
 */
async function onDeleteClick(commentIdHtml) {
  const element = document.getElementById(commentIdHtml);
  const [articleId, commentId, subCommentId] = extractIds(commentIdHtml);

  const updatedData = removeComment(dataService.getData(), articleId, commentId, subCommentId);

  const updatedArticle = updatedData.find((article) => article.id == articleId);

  if (updatedArticle) {
    try {
      await dataService.update(updatedArticle);
      element.remove();
      loadData();
    } catch (error) {
      console.error("Error updating article:", error);
    }
  }
}

/**
 *
 * @param {string} inputString
 * @returns {string[]}
 */
function extractIds(inputString) {
  const parts = inputString.split("-");

  if (parts[0] === "comment") {
    return [parts[1], parts[2], null];
  }

  if (parts[0] === "sub" && parts[1] === "comment") {
    return [parts[2], parts[3], parts[4]];
  }

  return [null, null, null];
}

/**
 * @param {Article[]} data
 * @param {number} articleId
 * @param {string} commentId
 * @param {string | null} subCommentId
 * @returns {Article[]}
 */
function removeComment(data, articleId, commentId, subCommentId) {
  return data.map((article) => {
    if (article.id === articleId) {
      const updatedComments = article.comments
        .map((comment) => {
          if (comment.id == commentId) {
            if (subCommentId) {
              const updatedReplies = comment.replies.filter((reply) => reply.id != subCommentId);
              return {
                ...comment,
                replies: updatedReplies,
              };
            }
            return null;
          }
          return comment;
        })
        .filter((comment) => comment != null);

      return {
        ...article,
        comments: updatedComments,
      };
    }
    return article;
  });
}

const createButton = (icon, color, text, commentIdHtml, onClickHandler) =>
  `<button class="outline-none background-none border-none d-flex align-items-center justify-content-center gap-1 ${color} font-weight-600 text-nowrap" onclick="${onClickHandler}('${commentIdHtml}')">
    <img src="./assets/${icon}" alt="${text} button icon" class="comment-icon"/>
    ${text}
  </button>`;

/**
 *
 * @param {number} index
 * @param {Author} author
 * @param {string} date
 * @param {number} commentsSize
 * @param {string} title
 * @param {string} content
 * @param {string[]} tags
 * @param {string} comments
 */
function renderArticle(index, author, date, commentsSize, title, content, tags, comments) {
  const articleIndexHtml = `article-${index}`;

  if (!articleState[articleIndexHtml]) {
    articleState[articleIndexHtml] = {
      commentsVisible: false,
      commentFormVisible: false,
    };
  }

  const buttons = {
    edit: createButton('edit-icon.svg', 'color-purple-515', 'Edit', articleIndexHtml, 'onEditArticleClick'),
    delete: createButton('trash-icon.svg', 'color-red-d79', 'Delete', articleIndexHtml, 'onDeleteArticleClick'),
    toggleComments: `<button id="toggle-comments-${articleIndexHtml}" class="button-primary outline-none border-none" onclick="toggleComments('${articleIndexHtml}')">
    Show Comments</button>`,
    toggleCommentForm: `<button id="toggle-comment-form-${articleIndexHtml}" class="button-primary outline-none border-none" onclick="toggleCommentForm('${articleIndexHtml}')">Leave Comment</button>`
  };

  return `
    <div id="${articleIndexHtml}" class="row mt--100 gap-3 article p-3">
      <div class="col-12 d-flex align-items-center justify-content-between flex-column flex-md-row">
        <span class="">
          On ${formatDate(date)} by <a href="">${author}</a>
        </span>
        <span class="d-flex gap-3 align-items-center p-2 p-md-0">
          ${buttons.edit}
          ${buttons.delete}
          <p class="text-nowrap">
            <img src="./assets/comment-icon.svg" alt="Comment icon" class="comment-icon" />
            <a href=""> ${commentsSize} Comments</a>
          </p>
        </span>
      </div>
      <div class="col-12">
        <h1 id="title">${title}</h1>
      </div>
      <div class="col-12">
        <p id="content">${content}</p>
      </div>
      <div id="tags-${articleIndexHtml}" class="col-12 d-flex flex-wrap gap-2">
        ${tags.map(tag => `<div class="tag border-radius-10 font-weight-600">#${tag}</div>`).join("")}
      </div>
      <div class="col-12 d-flex flex-column flex-sm-row gap-2">
        ${buttons.toggleComments}
        ${buttons.toggleCommentForm}
      </div>
     
      <div id="comment-form-${articleIndexHtml}" class="col-12 mt-2 comment p-3 d-none">
        <h3>Add a Comment</h3>
        <textarea id="new-comment-${index}" class="form-control" rows="3" placeholder="Write your comment..."></textarea>
        <div class="mt-2 d-flex gap-2">
          <button class="button-primary outline-none border-none" onclick="onSubmitArticleComment('${index}')">Submit</button>
        </div>
      </div>
    </div>
     <div id="comments-${articleIndexHtml}" class="col-12 d-none">
        ${comments}
      </div>
  `;
}

const articleState = {};

/**
 * 
 * @param {string} articleIndexHtml 
 */
function toggleComments(articleIndexHtml) {
  const commentsSection = document.getElementById(`comments-${articleIndexHtml}`);
  const showHideButton = document.getElementById(`toggle-comments-${articleIndexHtml}`);

  const isHidden = commentsSection.classList.toggle('d-none');
  showHideButton.innerText = isHidden ? 'Show Comments' : 'Hide Comments';
}

function toggleCommentForm(articleIndexHtml) {
  const commentForm = document.getElementById(`comment-form-${articleIndexHtml}`);
  const leaveCommentButton = document.getElementById(`toggle-comment-form-${articleIndexHtml}`);

  const isHidden = commentForm.classList.toggle('d-none');
  leaveCommentButton.innerText = isHidden ? 'Leave Comment' : 'Hide Comment Form';
}

/**
 *
 * @param {string} articleIdHtml
 */
function onEditArticleClick(articleIdHtml) {
  const articleElement = document.getElementById(articleIdHtml);
  const titleElement = articleElement.querySelector("#title");
  const contentElement = articleElement.querySelector("#content");
  const tagsElements = articleElement.querySelectorAll(".tag");

  const titleText = titleElement.textContent.trim();
  const contentText = contentElement.textContent.trim();
  const tagsText = Array.from(tagsElements).map((tag) => tag.textContent.slice(1));

  articleElement.innerHTML = `
    <div class="row mt--20 gap-3">
      <div class="col-12">
        <input type="text" id="edit-article-title" class="form-control mb-3" value="${titleText}" />
      </div>
      <div class="col-12">
        <textarea id="edit-article-content" class="form-control mb-3" rows="4">${contentText}</textarea>
      </div>
      <div class="col-12">
        <label for="edit-tags-wrapper" class="form-label">Tags
          <img src="./assets/plus-icon.svg" alt="Add Tag" class="comment-icon cursor-pointer" onclick="onAddEditTagClick();" />
        </label>
        <div id="edit-tags-wrapper" class="d-flex flex-wrap gap-2 mb-3">
          ${tagsText
      .map(
        (tag) =>
          `<div class="mb-2"><input type="text" class="form-control tag-element" value="${tag}" /></div>`
      )
      .join("")}
        </div>
      </div>
      <div class="col-12">
        <button class="btn btn-primary" onclick="onSaveArticleClick('${articleIdHtml}')">Save</button>
        <button class="btn btn-secondary" onclick="onCancelEditArticleClick('${articleIdHtml}')">Cancel</button>
      </div>
    </div>
  `;
}

/**
 *
 * @param {string} articleIdHtml
 */
async function onSaveArticleClick(articleIdHtml) {
  const articleElement = document.getElementById(articleIdHtml);

  const title = document.getElementById("edit-article-title").value.trim();
  const content = document.getElementById("edit-article-content").value.trim();
  const tags = Array.from(document.querySelectorAll("#edit-tags-wrapper .tag-element"))
    .map((tag) => tag.value.trim())
    .filter((tag) => tag !== "");

  const articleId = articleIdHtml.split("-")[1];
  const article = dataService.getData().find((article) => article.id == articleId);

  article.title = title;
  article.content = content;
  article.tags = tags;

  try {
    await dataService.update(article);
    loadData();
  } catch (error) {
    console.error(error);
  }
}

function onCancelEditArticleClick() {
  window.location.reload();
}

function onAddEditTagClick() {
  const tagsWrapper = document.getElementById("edit-tags-wrapper");

  const tagElement = `
    <div class="mb-2">
      <input type="text" class="form-control tag-element" placeholder="Tag">
    </div>
  `;

  tagsWrapper.insertAdjacentHTML("beforeend", tagElement);
}

/**
 * @param {string} articleIdHtml
 */
async function onDeleteArticleClick(articleIdHtml) {
  const articleId = articleIdHtml.split("-")[1];


  if (confirm("Are you sure you want to delete this article?")) {
    try {
      await dataService.delete(articleId);
      document.getElementById(articleIdHtml).remove();
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  }
}

/**
 * @param {number} articleId
 */
async function onSubmitArticleComment(articleId) {
  const commentText = document.getElementById(`new-comment-${articleId}`).value.trim();
  if (!commentText) {
    alert("Comment text cannot be empty.");
    return;
  }

  const article = dataService.getData().find((article) => article.id === articleId);
  if (!article) {
    console.error("Article not found");
    return;
  }

  const newComment = {
    id: generateUniqueId(),
    author: "John Doe",
    text: commentText,
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: [],
  };

  article.comments.push(newComment);

  try {
    await dataService.update(article);
    loadData();
  } catch (err) {
    console.error("Error updating article with new comment:", err);
  }
}

/**
 *
 * @param {Event} event
 */
function onCreateArticleClick(event) {
  event.preventDefault();

  const formHtml = `
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Create New Article</h5>
          </div>
          <div class="card-body">
            <form id="article-form">
              <div class="mb-3">
                <label for="article-title" class="form-label">Title</label>
                <input type="text" class="form-control" id="article-title" required>
              </div>
              <div class="mb-3">
                <label for="article-content" class="form-label">Content</label>
                <textarea class="form-control" id="article-content" rows="4" required></textarea>
              </div>
              <div class="mb-3">
                <label for="tags-wrapper" class="form-label">Tags
                  <img src="./assets/plus-icon.svg" alt="Add Tag" class="comment-icon cursor-pointer" onclick="onAddTagClick();" />
                </label>
                <div id="tags-wrapper" class="d-flex flex-wrap gap-2">
                  <div class="mb-2">
                    <input type="text" class="form-control tag-element" placeholder="Tag">
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between">
                <button type="submit" class="button-primary outline-none border-none">Submit</button>
                <button type="button" class="button-primary outline-none border-none" onclick="onCancelArticleClick()">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  const formContainer = document.getElementById("article-form-container");
  formContainer.innerHTML = formHtml;

  document.getElementById("article-creation").style.display = "none";

  document.getElementById("article-form").addEventListener("submit", handleFormSubmit);
}

function onAddTagClick() {
  const tagsWrapper = document.getElementById("tags-wrapper");

  const tagElement = `
    <div class="mb-2">
      <input type="text" class="form-control tag-element" placeholder="Tag">
    </div>
  `;

  tagsWrapper.insertAdjacentHTML("beforeend", tagElement);
}

function onCancelArticleClick() {
  const formContainer = document.getElementById("article-form-container");
  formContainer.innerHTML = "";

  document.getElementById("article-creation").style.display = "block";
}

/**
 *
 * @param {Event} event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const title = document.getElementById("article-title").value.trim();
  const content = document.getElementById("article-content").value.trim();
  const tags = Array.from(document.querySelectorAll(".tag-element"))
    .map((tag) => tag.value.trim())
    .filter((tag) => tag !== "");

  const newArticle = {
    id: generateUniqueId(),
    title: title,
    author: {
      name: "John Doe",
    },
    createdAt: new Date().toISOString(),
    content: content,
    tags: tags,
    comments: [],
    likes: 0,
    views: 0,
  };

  await dataService.create(newArticle);

  onCancelArticleClick();
}

loadData();
