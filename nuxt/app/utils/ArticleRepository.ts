// --- Internal imports ---
import { articles } from '../data/articles';
import type { Article } from '../interfaces/Article';

// --- Exported members ---
export class ArticleRepository {
  static findAll(): Article[] {
    return articles;
  }

  static findBySlug(slug: string): Article | undefined {
    return articles.find((article) => article.slug === slug);
  }
}
