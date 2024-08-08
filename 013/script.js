const url = 'http://localhost:3000';

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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
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
                method: 'DELETE',
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

async function fetchData() {
    const getData = await apiClient.get('posts');
    localStorage.setItem('posts', JSON.stringify(getData));
}

const main = document.getElementById('main');
main.addEventListener('load', fetchData());


function getData() {
    return JSON.parse(localStorage.getItem('posts'));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}


const comment = (author, date, content, likes, marginLeft) => {

    return `
         <div class="comment d-flex marginLeft-${marginLeft}">
        <div class="d-flex flex-column align-items-center justify-content-between likes-wrapper">
            <img src="./assets/plus-icon.png" alt="" class="likes-icon"/>
            <p>${likes}</p>
            <img src="./assets/minus-icon.png" alt="" class="likes-icon"/>
        </div>
        <span class="w-100">
            <div class="d-flex align-items-center justify-content-start">
                <img src="" alt="" />
                <h4>${author}</h4>
                <p>${formatDate(date)}</p>
                <span class="d-flex align-content-center ml-auto">
                    <img src="" alt="" />
                    <p>Reply</p>
                </span>
            </div>
            <div>${content}</div>
        </span>
    </div>
    `;
};

const commentSection = document.getElementById('comment-section');

let ml = 51;
commentSection.innerHTML = getData().map(item =>
    item.comments.map(cm => (
        comment(cm.author, cm.createdAt, cm.text, cm.likes)
    ))
)


