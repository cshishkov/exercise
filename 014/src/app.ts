import { DataService } from "./services";
import { Article, Comment, DataState, Reply } from "./types";
import { calculateDaysDifference, formatDate, generateUniqueId } from "./utils";

const apiUrl: string = "http://localhost:3000/api/articles";

export const dataState: DataState = {
  articles: [],
  loaded: false,

  setArticles(newArticles: Article[]): void {
    this.articles = newArticles;
    this.loaded = true;
  },

  getArticles() {
    return this.articles;
  },

  addArticle(article: Article): void {
    this.articles.push(article);
  },

  updateArticle(updatedArticle: Article): void {
    const index = this.articles.findIndex(
      (article: Article) => article.id === updatedArticle.id
    );
    if (index !== -1) {
      this.articles[index] = updatedArticle;
    }
  },

  removeArticle(id: string): void {
    this.articles = this.articles.filter(
      (article: Article) => article.id !== id
    );
  },
};

const dataService = DataService.getInstance(apiUrl, dataState);

loadData();

async function loadData() {
  try {
    const articles = await dataService.loadArticles();
    renderArticles(articles);
    localStorage.setItem("articles", JSON.stringify(dataState));
  } catch (error) {
    console.error(error);
  }
}

function renderArticles(articles: Article[]): void {
  const articleContainer = document.getElementById(
    "article-content"
  ) as HTMLElement;

  articleContainer.insertAdjacentHTML(
    "beforeend",
    articles
      .map((article: Article) => {
        const commentId =
          article.comments.length > 0 ? article.comments[0].id : 0;
        const comments = renderComments(
          article.id,
          commentId,
          article.comments
        );
        return renderArticle(
          article.id,
          article.author.name,
          article.createdAt,
          article.comments.length > 0 ? article.comments.length : 0,
          article.title,
          article.content,
          comments,
          article.tags
        );
      })
      .join("")
  );
}

function renderComments(
  articleId: string,
  commentId: string | number,
  comments: (Comment | Reply)[],
  offset: boolean = false
): string {
  const offsetClass = offset ? "ms-5" : "";

  return comments
    .map((comment: Comment | Reply) => {
      const repliesHtml = renderComments(
        articleId,
        comment.id,
        (comment as Comment).replies || [],
        true
      );

      const commentIdHtml = offset
        ? `sub-comment-${articleId}-${commentId}-${comment.id}`
        : `comment-${articleId}-${comment.id}`;

      const renderRepliesText = repliesHtml
        ? `<p class="replies color-purple-515 font-weight-600 d-flex align-items-center gap-1 cursor-pointer" onclick="toggleReplies('${commentIdHtml}')">
          <img src="./assets/reply-icon.svg" alt="Reply icon" class="comment-icon"/>
          Show Replies</p>`
        : "";

      const buttons = {
        delete: createButton(
          "trash-icon.svg",
          "color-red-d79",
          "Delete",
          commentIdHtml,
          "onDeleteClick"
        ),
        reply: !offset
          ? createButton(
              "reply-icon.svg",
              "color-purple-515",
              "Reply",
              commentIdHtml,
              "onReplyClick"
            )
          : "",
        edit: createButton(
          "edit-icon.svg",
          "color-purple-515",
          "Edit",
          commentIdHtml,
          "onEditClick"
        ),
      };

      return `
            <div id='${commentIdHtml}' class="row comment mt-2 ${offsetClass} p-3">
              <div class="col-1">
                <div class="d-flex flex-column align-items-center justify-content-center likes-wrapper gap-3">
                  <img src="./assets/plus-icon.svg" alt="Plus icon" class="likes-icon" onclick="onIncrementLikesClick('${commentIdHtml}')"/>
                  <span class="font-weight-600 color-purple-515 likes-count">${
                    comment.likes
                  }</span>
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
          </div>`;
    })
    .join("");
}

function createButton(
  icon: string,
  color: string,
  text: string,
  commentIdHtml: string,
  onClickHandler: string
) {
  return `<button class="outline-none background-none border-none d-flex align-items-center justify-content-center gap-1 ${color} font-weight-600 text-nowrap" onclick="${onClickHandler}('${commentIdHtml}')">
      <img src="./assets/${icon}" alt="${text} button icon" class="comment-icon"/>
      ${text}
    </button>`;
}

const articleState: Record<
  string,
  { commentsVisible: boolean; commentFormVisible: boolean }
> = {};

function renderArticle(
  index: string,
  author: string,
  date: string,
  commentsSize: number,
  title: string,
  content: string,
  comments: string,
  tags?: string[]
) {
  const articleIndexHtml = `article-${index}`;

  if (!articleState[articleIndexHtml]) {
    articleState[articleIndexHtml] = {
      commentsVisible: false,
      commentFormVisible: false,
    };
  }

  const buttons = {
    edit: createButton(
      "edit-icon.svg",
      "color-purple-515",
      "Edit",
      articleIndexHtml,
      "onEditArticleClick"
    ),
    delete: createButton(
      "trash-icon.svg",
      "color-red-d79",
      "Delete",
      articleIndexHtml,
      "onDeleteArticleClick"
    ),
    toggleComments:
      comments && comments.length > 0
        ? `<button id="toggle-comments-${articleIndexHtml}" class="button-primary outline-none border-none" onclick="toggleComments('${articleIndexHtml}')">
      Show Comments</button>`
        : "",
    toggleCommentForm: `<button id="toggle-comment-form-${articleIndexHtml}" class="button-primary outline-none border-none" onclick="toggleCommentForm('${articleIndexHtml}')">Leave Comment</button>`,
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
          ${
            tags
              ? tags
                  .map(
                    (tag) =>
                      `<div class="tag border-radius-10 font-weight-600">#${tag}</div>`
                  )
                  .join("")
              : ""
          }
        </div>
        <div class="col-12 d-flex flex-column flex-sm-row gap-2">
          ${buttons.toggleComments}
          ${buttons.toggleCommentForm}
        </div>
       
        <div id="comment-form-${articleIndexHtml}" class="col-12 mt-2 comment p-3 d-none">
          <h3>Add a Comment</h3>
          <textarea type="text" id="new-comment-${index}" class="form-control" rows="3" placeholder="Write your comment..."></textarea>
          <div class="mt-2 d-flex gap-2">
            <button class="button-primary outline-none border-none" onclick="onSubmitArticleComment('${index}')">Submit</button>
            <button class="button-primary outline-none border-none" onclick="onCancelLeaveArticleComment('${articleIndexHtml}','${index}')">Cancel</button>
  
          </div>
        </div>
      </div>
       <div id="comments-${articleIndexHtml}" class="col-12 d-none">
          ${comments}
        </div>
    `;
}

function onCancelLeaveArticleComment(
  articleIndexHtml: string,
  articleId: string
): void {
  const commentForm = document.getElementById(
    `comment-form-${articleIndexHtml}`
  ) as HTMLElement;

  const leaveCommentButton = document.getElementById(
    `toggle-comment-form-${articleIndexHtml}`
  ) as HTMLElement;

  const textArea = document.getElementById(
    `new-comment-${articleId}`
  ) as HTMLInputElement;

  textArea.value = "";

  commentForm.classList.add("d-none");

  leaveCommentButton.innerText = "Leave Comment";
}

function toggleComments(articleIndexHtml: string): void {
  const commentsSection = document.getElementById(
    `comments-${articleIndexHtml}`
  ) as HTMLElement;
  const showHideButton = document.getElementById(
    `toggle-comments-${articleIndexHtml}`
  ) as HTMLElement;

  const isHidden = commentsSection.classList.toggle("d-none");
  showHideButton.innerText = isHidden ? "Show Comments" : "Hide Comments";
}

function toggleCommentForm(articleIndexHtml: string): void {
  const commentForm = document.getElementById(
    `comment-form-${articleIndexHtml}`
  ) as HTMLElement;
  const leaveCommentButton = document.getElementById(
    `toggle-comment-form-${articleIndexHtml}`
  ) as HTMLElement;

  const isHidden = commentForm.classList.toggle("d-none");
  leaveCommentButton.innerText = isHidden
    ? "Leave Comment"
    : "Hide Comment Form";
}

function onEditArticleClick(articleIdHtml: string): void {
  const articleElement = document.getElementById(articleIdHtml) as HTMLElement;
  const titleElement = articleElement.querySelector("#title") as HTMLElement;
  const contentElement = articleElement.querySelector(
    "#content"
  ) as HTMLElement;
  const tagsElements = articleElement.querySelectorAll(
    ".tag"
  ) as NodeListOf<HTMLElement>;

  const titleText = titleElement.textContent.trim();
  const contentText = contentElement.textContent.trim();
  const tagsText = Array.from(tagsElements).map((tag) =>
    tag.textContent.slice(1)
  );

  articleElement.innerHTML = editArticleForm(
    articleIdHtml,
    titleText,
    contentText,
    tagsText
  );
}

function editArticleForm(
  articleId: string,
  title: string,
  content: string,
  tags?: string[]
): string {
  return `
      <div class="row mt--20 gap-3">
        <div class="col-12">
          <input type="text" id="edit-article-title" class="form-control mb-3" value="${title}" />
        </div>
        <div class="col-12">
          <textarea id="edit-article-content" class="form-control mb-3" rows="4">${content}</textarea>
        </div>
        <div class="col-12">
          <label for="edit-tags-wrapper" class="form-label">Tags
            <img src="./assets/plus-icon.svg" alt="Add Tag" class="comment-icon cursor-pointer" onclick="onAddEditTagClick();" />
          </label>
          <div id="edit-tags-wrapper" class="d-flex flex-wrap gap-2 mb-3">
            ${
              tags
                ? tags
                    .map(
                      (tag) =>
                        `<div class="mb-2"><input type="text" class="form-control tag-element" value="${tag}" /></div>`
                    )
                    .join("")
                : ""
            }
          </div>
        </div>
        <div class="col-12">
          <button class="btn btn-primary" onclick="onSaveArticleClick('${articleId}')">Save</button>
          <button class="btn btn-secondary" onclick="onCancelEditArticleClick('${articleId}')">Cancel</button>
        </div>
      </div>
    `;
}

async function onSaveArticleClick(articleIdHtml: string) {
  const titleInput = document.getElementById(
    "edit-article-title"
  ) as HTMLInputElement;

  const contentInput = document.getElementById(
    "edit-article-content"
  ) as HTMLInputElement;

  const tagsInput = document.querySelectorAll(
    "#edit-tags-wrapper .tag-element"
  ) as NodeListOf<HTMLInputElement>;

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const tags: string[] = Array.from(tagsInput)
    .map((tag) => tag.value.trim())
    .filter((value) => value !== "");

  const articleId = articleIdHtml.split("-")[1];
  const article = dataState
    .getArticles()
    .find((article) => article.id === articleId);

  if (article) {
    article.title = title;
    article.content = content;
    article.tags = tags || [];
  }

  try {
    if (article) {
      await dataService.update(article);
      dataState.updateArticle(article);
    }

    const formContainer = document.getElementById(
      "article-form-container"
    ) as HTMLInputElement;
    formContainer.innerHTML = "";
    const articleForm = document.getElementById(
      "article-creation"
    ) as HTMLElement;

    articleForm.style.display = "block";
  } catch (error) {
    console.error(error);
  }
}

function onCancelEditArticleClick(): void {
  window.location.reload();
}

function onAddEditTagClick(): void {
  const tagsWrapper = document.getElementById(
    "edit-tags-wrapper"
  ) as HTMLElement;

  const tagElement = `
      <div class="mb-2">
        <input type="text" class="form-control tag-element" placeholder="Tag">
      </div>
    `;

  tagsWrapper.insertAdjacentHTML("beforeend", tagElement);
}

async function onDeleteArticleClick(articleIdHtml: string) {
  const articleId = articleIdHtml.split("-")[1];

  if (confirm("Are you sure you want to delete this article?")) {
    try {
      await dataService.delete(articleId);
      dataState.removeArticle(articleId);
      const articleElement = document.getElementById(
        articleIdHtml
      ) as HTMLElement;
      articleElement.remove();
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  }
}

async function handleFormSubmit(event: Event) {
  event.preventDefault();
  const titleInput = document.getElementById(
    "article-title"
  ) as HTMLInputElement;

  const contentInput = document.getElementById(
    "article-content-area"
  ) as HTMLInputElement;

  const tagInputs = document.querySelectorAll(
    ".tag-element"
  ) as NodeListOf<HTMLInputElement>;

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const tags: string[] = Array.from(tagInputs)
    .map((tag) => tag.value.trim())
    .filter((value) => value !== "");

  const newArticle: Article = {
    id: generateUniqueId(),
    title: title,
    author: {
      name: "John Doe",
    },
    createdAt: new Date().toISOString(),
    content: content,
    tags: tags || [],
    comments: [],
    likes: 0,
    views: 0,
  };

  try {
    await dataService.create(newArticle);
    dataState.addArticle(newArticle);

    const formContainer = document.getElementById(
      "article-form-container"
    ) as HTMLElement;
    const articleElement = document.getElementById(
      "article-creation"
    ) as HTMLElement;
    formContainer.innerHTML = "";

    articleElement.style.display = "block";
  } catch (error) {
    console.error(error);
  }
}

function onCancelArticleClick(): void {
  const formContainer = document.getElementById(
    "article-form-container"
  ) as HTMLElement;
  const articleElement = document.getElementById(
    "article-creation"
  ) as HTMLElement;

  formContainer.innerHTML = "";
  articleElement.style.display = "block";
}

function addTagElement(): string {
  return `
      <div class="mb-2">
        <input type="text" class="form-control tag-element" placeholder="Tag">
      </div>
    `;
}

function onAddTagClick() {
  const tagsWrapper = document.getElementById("tags-wrapper") as HTMLElement;
  tagsWrapper.insertAdjacentHTML("beforeend", addTagElement());
}

function createArticleForm(): string {
  return `
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
                  <label for="article-content-area" class="form-label">Content</label>
                  <textarea class="form-control" id="article-content-area" rows="4" required></textarea>
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
}

function onCreateArticleClick(event: Event): void {
  event.preventDefault();
  const formContainer = document.getElementById(
    "article-form-container"
  ) as HTMLElement;
  const formElement = document.getElementById(
    "article-creation"
  ) as HTMLElement;
  const articleFormElement = document.getElementById(
    "article-form"
  ) as HTMLElement;

  formContainer.innerHTML = createArticleForm();
  formElement.style.display = "none";
  articleFormElement.addEventListener("submit", handleFormSubmit);
}

async function onSubmitArticleComment(articleId: string) {
  const commentInput = document.getElementById(
    `new-comment-${articleId}`
  ) as HTMLInputElement;

  const commentText = commentInput.value.trim();

  if (!commentText) {
    alert("Comment text cannot be empty.");
    return;
  }

  const article = dataState
    .getArticles()
    .find((article) => article.id.toString() === articleId.toString());
  if (!article) {
    console.error("Article not found");
    return;
  }

  const newComment: Comment = {
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
    dataState.updateArticle(article);

    const commentForm = document.getElementById(
      `comment-form-article-${articleId}`
    ) as HTMLElement;
    const commentElement = document.getElementById(
      `new-comment-${articleId}`
    ) as HTMLInputElement;

    commentForm.classList.add("d-none");
    commentElement.value = "";
  } catch (err) {
    console.error("Error updating article with new comment:", err);
  }
}

function removeComment(
  data: Article[],
  articleId: string,
  commentId: string,
  subCommentId: string
): Article[] {
  return data.map((article) => {
    if (article.id === articleId) {
      const updatedComments = article.comments
        .map((comment) => {
          if (comment.id === commentId) {
            if (subCommentId) {
              const updatedReplies = comment.replies.filter(
                (reply) => reply.id !== subCommentId
              );
              return {
                ...comment,
                replies: updatedReplies,
              };
            }
            return null;
          }
          return comment;
        })
        .filter((comment) => comment !== null);

      return {
        ...article,
        comments: updatedComments,
      };
    }
    return article;
  });
}

function extractIds(inputString: string): (string | null)[] {
  const parts = inputString.split("-");

  if (parts[0] === "comment") {
    return [parts[1], parts[2], null];
  } else if (parts[0] === "sub" && parts[1] === "comment") {
    return [parts[2], parts[3], parts[4]];
  } else {
    return [null, null, null];
  }
}

async function onDeleteClick(commentIdHtml: string) {
  const element = document.getElementById(commentIdHtml) as HTMLElement;
  const [articleId, commentId, subCommentId] = extractIds(commentIdHtml);

  const updatedData = removeComment(
    dataState.getArticles(),
    articleId!,
    commentId!,
    subCommentId!
  );

  const updatedArticle = updatedData.find(
    (article) => article.id === articleId
  );

  if (!updatedArticle) {
    return;
  }

  try {
    await dataService.update(updatedArticle);
    dataState.updateArticle(updatedArticle);
    element.remove();
  } catch (error) {
    console.error("Error updating article:", error);
  }
}

function onCancelReply(commentId: string): void {
  const commentFormElement = document.getElementById(commentId) as HTMLElement;
  const replyForm = commentFormElement.nextElementSibling;

  if (replyForm && replyForm.classList.contains("reply-form")) {
    replyForm.remove();
  }
}

function findCommentById(
  comments: Comment[],
  commentId: string,
  subCommentId: string
): Comment | Reply {
  const comment: Comment = comments.filter(
    (comment) => comment.id === commentId
  )[0];

  if (comment.replies) {
    const reply: Reply = comment.replies.filter(
      (reply) => reply.id === subCommentId
    )[0];
    if (reply) {
      return reply;
    }
  }

  return comment;
}

async function onSubmitReply(commentId: string) {
  const replyFormElement = document.getElementById(commentId) as HTMLElement;
  const replyForm = replyFormElement.nextElementSibling as HTMLElement;
  const textAreaElement = replyForm.querySelector(
    "textarea"
  ) as HTMLTextAreaElement;

  const replyText = textAreaElement.value.trim();

  if (!replyText) {
    alert("Reply text cannot be empty.");
    return;
  }

  const [articleId, commentsId, subCommentId] = extractIds(commentId);

  const updatedData = dataState.getArticles();
  const article = updatedData.find((article) => article.id === articleId);

  if (!article) {
    console.error("Article not found");
    return;
  }

  const comment: Comment = findCommentById(
    article.comments,
    commentsId!,
    subCommentId!
  );

  const newReply: Reply = {
    id: generateUniqueId(),
    author: "John Doe",
    text: replyText,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  if (comment.replies) comment.replies.push(newReply);

  try {
    await dataService.update(article);
    dataState.updateArticle(article);

    textAreaElement.value = "";
    replyForm?.remove();
  } catch (err) {
    console.error("Failed to update article with new reply:", err);
  }
}

function replyCommentForm(commentId: string): string {
  return `
      <div class="reply-form mt-2 comment row p-3">
        <div class="col-12">
          <h3>Reply to comment</h3>
        </div>
        <div class="col-12">
          <textarea required class="form-control" rows="3" placeholder="Write your reply..."></textarea>
          <div class="mt-2 d-flex gap-2">
            <button class="button-primary outline-none border-none" onclick="onSubmitReply('${commentId}')">Submit</button>
            <button class="button-primary outline-none border-none" onclick="onCancelReply('${commentId}')">Cancel</button>
          </div>
        </div>
      </div>
    `;
}

function onReplyClick(commentId: string): void {
  const replyComment = document.getElementById(commentId) as HTMLElement;

  if (replyComment.querySelector(".reply-form")) {
    return;
  }

  replyComment.insertAdjacentHTML("afterend", replyCommentForm(commentId));
}

async function updateLikesData(commentIdHtml: string, updatedLikes: number) {
  const [articleId, commentId, subCommentId] = extractIds(commentIdHtml);

  const article = dataState
    .getArticles()
    .find((a: Article) => a.id === articleId);

  const comment = article?.comments.find((c: Comment) => c.id === commentId);

  if (subCommentId && comment) {
    const subComment = comment.replies?.find(
      (r: Comment) => r.id === subCommentId
    );
    if (subComment) {
      subComment.likes = updatedLikes;
    }
  } else if (comment) {
    comment.likes = updatedLikes;
  }

  try {
    if (article) {
      await dataService.update(article);
      dataState.updateArticle(article);
    }
  } catch (err) {
    console.error("Failed to update likes:", err);
  }
}

function onDecreaseLikesClick(commentIdHtml: string): void {
  updateLikes(commentIdHtml, -1);
}

function onIncrementLikesClick(commentIdHtml: string): void {
  updateLikes(commentIdHtml, 1);
}

function updateLikes(commentIdHtml: string, change: number): void {
  const commentElement = document.getElementById(commentIdHtml) as HTMLElement;

  const likesElement = commentElement.querySelector(
    ".likes-count"
  ) as HTMLElement;

  let currentLikes = parseInt(likesElement.textContent as string, 10);
  if (isNaN(currentLikes)) return;

  const updatedLikes = Math.max(0, currentLikes + change);
  likesElement.textContent = updatedLikes.toString();

  updateLikesData(commentIdHtml, updatedLikes);
}

function toggleReplies(id: string) {
  const repliesContainer = document.getElementById(
    `replies-${id}`
  ) as HTMLElement;
  const toggleButton = document.querySelector(
    `p[onclick="toggleReplies('${id}')"]`
  ) as HTMLElement;

  if (repliesContainer && toggleButton) {
    repliesContainer.classList.toggle("d-none");

    const imgElement = toggleButton.querySelector("img");
    if (repliesContainer.classList.contains("d-none")) {
      toggleButton.textContent = "Show Replies";
    } else {
      toggleButton.textContent = "Hide Replies";
    }

    toggleButton.prepend(imgElement!);
  }
}

function editCommentForm(commentId: string, text: string) {
  return `
      <textarea class="form-control edit-textarea" rows="5">${text}</textarea>
      <div class="edit-actions mt-2">
        <button class="button-primary outline-none border-none save-edit" onclick="onSaveEditClick('${commentId}', event);">Save</button>
        <button class="button-primary outline-none border-none cancel-edit" onclick="onCancelEditClick('${commentId}', event);">Cancel</button>
      </div>
    `;
}

function onEditClick(commentId: string) {
  const commentElement = document.getElementById(commentId) as HTMLElement;
  const contentElement = commentElement.querySelector(
    ".comment-text"
  ) as HTMLInputElement;

  if (contentElement.textContent === null) {
    alert("Cannot be null");
    return;
  }

  const currentText = contentElement.textContent.trim();
  contentElement.dataset.originalText = currentText;

  contentElement.innerHTML = editCommentForm(commentId, currentText);
}

function onCancelEditClick(commentId: string, event: Event) {
  event.stopPropagation();

  const commentElement = document.getElementById(commentId) as HTMLElement;
  const contentElement = commentElement.querySelector(
    ".comment-text"
  ) as HTMLElement;

  if (!commentElement || !contentElement) {
    return;
  }

  const originalText = contentElement.dataset.originalText || "";

  contentElement.innerHTML = originalText;
}

function onSaveEditClick(commentId: string, event: Event) {
  event.stopPropagation();

  const commentElement = document.getElementById(commentId) as HTMLElement;
  const textarea = commentElement.querySelector(
    ".edit-textarea"
  ) as HTMLInputElement;
  const updatedText = textarea.value.trim();

  try {
    updateCommentData(commentId, updatedText);

    const contentElement = commentElement.querySelector(
      ".comment-text"
    ) as HTMLInputElement;
    if (contentElement) {
      contentElement.textContent = updatedText;
      delete contentElement.dataset.originalText;
    }
  } catch (err) {
    console.error("Failed to update comment:", err);
  }
}

async function updateCommentData(
  commentIdHtml: string,
  updatedContent: string
) {
  const [articleId, commentId, subCommentId] = extractIds(commentIdHtml);

  const article = dataState.getArticles().find((a) => a.id === articleId);

  let comment = article.comments.find((c) => c.id === commentId);
  let commentToUpdate = comment;

  if (subCommentId) {
    const subComment: Comment | undefined = comment?.replies?.find(
      (r: Comment) => r.id === subCommentId
    );
    commentToUpdate = subComment;
  }

  commentToUpdate.text = updatedContent;

  try {
    await dataService.update(article);
    dataState.updateArticle(article);
  } catch (err) {
    console.error("Error updating comment:", err);
  }
}
