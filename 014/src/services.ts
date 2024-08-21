import { Article, DataState } from "./types";

export class DataService {
  private static instance: DataService | null = null;
  private apiUrl: string;
  private state: DataState;

  private constructor(apiUrl: string, state: DataState) {
    this.apiUrl = apiUrl;
    this.state = state;
  }

  public static getInstance(apiUrl: string, state: DataState): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService(apiUrl, state);
    }
    return DataService.instance;
  }

  async loadArticles() {
    if (!this.state.loaded) {
      try {
        const response = await fetch(this.apiUrl);
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        this.state.setArticles(data);
      } catch (error) {
        console.error("Error loading articles:", error);
      }
    }
    return this.state.getArticles();
  }

  async create(article: Article) {
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
      return newArticle;
    } catch (error) {
      console.error("Error creating data:", error);
      return null;
    }
  }

  async update(article: Article) {
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
      return updatedArticle;
    } catch (error) {
      console.error("Error updating data:", error);
      return null;
    }
  }

  async delete(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Error deleting data: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("Error deleting data:", error);
      return false;
    }
  }
}
