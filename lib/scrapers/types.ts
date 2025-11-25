import { TopicCategory } from '@/config/topics';

export type NewsSource = 'twitter' | 'linkedin' | 'reddit' | 'news';

export interface ScrapedItem {
  url: string;
  title: string;
  content: string;
  source: NewsSource;
  publishedAt?: Date;
}

export interface EnrichedItem extends ScrapedItem {
  aiSummary: string;
  relevanceScore: number;
  category: TopicCategory;
}

export interface ScraperResult {
  source: NewsSource;
  items: ScrapedItem[];
  errors?: string[];
}
