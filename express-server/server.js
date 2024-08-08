const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(bodyParser.json());

app.use(cors({
    origin: 'http://127.0.0.1:5500'  // Allow requests from this origin
}));
app.use(bodyParser.json());

// Helper function to read and write data
const readData = () => {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// GET all blog posts
app.get('/posts', (req, res) => {
    const data = readData();
    res.json(data);
});

// POST a new blog post
app.post('/posts', (req, res) => {
    const newPost = req.body;
    const data = readData();

    // Validate incoming data
    if (!newPost.title || !newPost.author || !newPost.content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Assign a new ID to the post
    const nextId = data.length > 0 ? data[data.length - 1].id + 1 : 1;
    newPost.id = nextId;
    newPost.createdAt = new Date().toISOString();

    // Add the new post to the data array
    data.push(newPost);
    writeData(data);

    res.status(201).json(newPost);
});

// GET a single blog post by ID
app.get('/posts/:id', (req, res) => {
    const data = readData();
    const post = data.find(p => p.id === parseInt(req.params.id));
    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
});

// UPDATE a blog post by ID
app.put('/posts/:id', (req, res) => {
    const data = readData();
    const index = data.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        const updatedPost = { ...data[index], ...req.body };
        data[index] = updatedPost;
        writeData(data);
        res.json(updatedPost);
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
});

// DELETE a blog post by ID
app.delete('/posts/:id', (req, res) => {
    let data = readData();
    const index = data.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        data = data.filter(p => p.id !== parseInt(req.params.id));
        writeData(data);
        res.json({ message: 'Post deleted successfully' });
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
