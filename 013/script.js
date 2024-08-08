const url = 'http://localhost:3000/posts';

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

    async get() {
        try {
            const response = await fetch(this._url);
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
            const response = await fetch(`${this._url}/${id}`, {
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
    const getData = await apiClient.get();
    localStorage.setItem('posts', JSON.stringify(getData));
}

const main = document.getElementById('main');
main.addEventListener('load', fetchData())


function getData() {
    return JSON.parse(localStorage.getItem('posts'));
}


