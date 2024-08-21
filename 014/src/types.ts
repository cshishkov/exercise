export interface Article {
  id: string;
  title: string;
  author: Author;
  createdAt: string;
  content: string;
  tags?: string[];
  comments: Comment[];
  likes: number;
  views: number;
}

export interface Author {
  name: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  likes: number;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  author: string;
  text: string;
  likes: number;
  createdAt: string;
}

export interface DataState {
  articles: Article[];
  loaded: boolean;
  setArticles(newArticles: Article[]): void;
  getArticles(): Article[];
  addArticle(article: Article): void;
  updateArticle(updatedArticle: Article): void;
  removeArticle(id: string): void;
}
