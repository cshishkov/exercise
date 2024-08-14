const url = "http://localhost:3000";

let posts = [];

async function fetchData() {
    try {
        const response = await fetch(`${url}/posts`);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        posts = await response.json();
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

document.addEventListener("DOMContentLoaded", fetchData);


const renderComments = (articleId, commentId, comment = [], offset = false) => {
    return comment
        .map((cm) => {
            return `
  <div id="${offset ? `sub-comment-${articleId}-${commentId}-${cm.id}` : `comment-${articleId}-${cm.id}`}" class="row comment-wrapper g-0 ${offset ? "offset" : ""
                }">
      <div class="col-1">
          <div class="d-flex flex-column align-items-center justify-content-between likes-wrapper">
              <img src="./assets/plus-icon.png" alt="" class="likes-icon" 
              onclick="onIncrementLikesClick('${offset ? `sub-comment-${articleId}-${commentId}-${cm.id}` : `comment-${articleId}-${cm.id}`}',event);" />
              <p class="user-select-none">${cm.likes}</p>
              <img src="./assets/minus-icon.png" alt="" class="likes-icon" 
              onclick="onDecreaseLikesClick('${offset ? `sub-comment-${articleId}-${commentId}-${cm.id}` : `comment-${articleId}-${cm.id}`}',event);" />
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
                      <span class="d-flex align-items-center cursor-pointer" 
                      onclick="onDeleteClick('${offset ? `sub-comment-${articleId}-${commentId}-${cm.id}` : `comment-${articleId}-${cm.id}`}', event)">
                          <img src="./assets/trash-icon.png" alt="" class="reply-icon" />
                          <p class="font-weight-600">Delete</p>
                      </span>
                     <span class="d-flex align-items-center cursor-pointer" 
                     onclick="onEditClick('${offset ? `sub-comment-${articleId}-${commentId}-${cm.id}` : `comment-${articleId}-${cm.id}`}', event)">
                        <img src="./assets/edit-icon.png" alt="" class="reply-icon" />
                        <p class="font-weight-600">Edit</p>
                      </span>
                      ${!offset
                    ? ` <span class="d-flex align-items-center cursor-pointer" 
            onclick="onReplyClick('comment-${articleId}-${cm.id}', event)">
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
  ${renderComments(articleId, cm.id, cm.replies, true)}
      `;
        })
        .join("");
};

const renderPosts = (
    index,
    author,
    date,
    commentsSize,
    title,
    content,
    tags,
    comments
) => {
    return `
    <div id="article-${index}" class="row gap-2 mt--20">
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
      <div id="${`text-content-${index}`}" class="col-12 hidden-text">
          ${content}
      </div>
      <div id="${tags ? `tags-${index}` : '0'}" class="d-flex flex-wrap align-items-center gap-2">
          ${tags.map(tag => { return `<div class="tag">#${tag}</div>`; }).join("")}
      </div>
      <div id="${`comment-section-${index}`}" class="col-12 d-none">
      ${comments}
      </div>
      <div class="col-12">
  
      ${comments.length > 0 ?
            `<button id="read-more-${index}" onclick="onShowMoreClick('${index}', event);" class="read-more-button d-flex align-items-center justify-content-center mt-4">
          READ MORE...
        </button>`:
            `<button id="leave-comment-${index}" onclick="onLeaveCommentClick('article-${index}', event);" class="read-more-button d-flex align-items-center justify-content-center mt-4">
          LEAVE COMMENT
        </button>`}
        </div>
    </div>
    `;
};

document.getElementById("article-content").insertAdjacentHTML(
    "beforeend",
    posts.map((item) => {
        const comments = renderComments(item.id, item.comments.length > 0 ? item.comments.id : 0, item.comments);
        return renderPosts(
            item.id,
            item.author.name,
            item.createdAt,
            item.comments.length > 0 ? item.comments.length : 0,
            item.title,
            item.content,
            item.tags,
            comments
        );
    })
        .join("")
);;
