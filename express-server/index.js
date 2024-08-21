const express = require("express");
const fs = require("fs-extra");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// Middleware
// Allow requests only from a specific domain
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  })
);
app.use(bodyParser.json());

// Utility function to read data from the JSON file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading data:", err);
    return [];
  }
}

// Utility function to write data to the JSON file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, 2));
  } catch (err) {
    console.error("Error writing data:", err);
  }
}

// Initialize data file if it doesn't exist
fs.ensureFile(DATA_FILE).then(async () => {
  const exists = await fs.pathExists(DATA_FILE);
  if (!exists) {
    await writeData([]);
  }
});

// CRUD operations

// Create (POST)
app.post("/api/articles", async (req, res) => {
  const articles = await readData();
  const newArticle = { id: Date.now(), ...req.body };
  articles.push(newArticle);
  await writeData(articles);
  res.status(201).json(newArticle);
});

// Read all (GET)
app.get("/api/articles", async (req, res) => {
  const articles = await readData();
  res.json(articles);
});

// Read by ID (GET)
app.get("/api/articles/:id", async (req, res) => {
  const articles = await readData();
  const article = articles.find((a) => a.id === parseInt(req.params.id, 10));
  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }
  res.json(article);
});

// Update (PUT)
app.put("/api/articles/:id", async (req, res) => {
  try {
    const articles = await readData();
    const articleId = req.params.id;
    const index = articles.findIndex((a) => a.id === articleId);
    if (index === -1) {
      console.error(`Article with ID ${articleId} not found`);
      return res.status(404).json({ message: "Article not found" });
    }
    articles[index] = { ...articles[index], ...req.body };
    await writeData(articles);
    res.json(articles[index]);
  } catch (error) {
    console.error("Error handling PUT request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE article
app.delete("/api/articles/:id", async (req, res) => {
  try {
    let articles = await readData();
    const articleId = req.params.id;

    const index = articles.findIndex(article => article.id.toString() === articleId.toString());

    if (index === -1) {
      return res.status(404).json({ message: "Article not found" });
    }

    articles.splice(index, 1);

    await writeData(articles);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting article:", error);

    res.status(500).json({ message: "An error occurred while deleting the article" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
