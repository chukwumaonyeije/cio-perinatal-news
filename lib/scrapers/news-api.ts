import { ScrapedItem, ScraperResult } from './types';
import { TOPICS } from '@/config/topics';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

interface NewsAPIArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  content: string;
  source: {
    name: string;
  };
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

/**
 * Scrape medical news from NewsAPI
 * Searches for articles related to billing, GDM, and preeclampsia
 */
export async function scrapeNewsAPI(): Promise<ScraperResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];

  if (!NEWS_API_KEY) {
    errors.push('NEWS_API_KEY is not configured');
    return { source: 'news', items, errors };
  }

  try {
    // Combine all keywords for a broad search
    const keywords = TOPICS.flatMap(topic => topic.keywords.slice(0, 2)); // Take top 2 from each category
    const query = keywords.join(' OR ');

    // Search in medical and health domains
    const domains = [
      'medscape.com',
      'healio.com',
      'medpagetoday.com',
      'ajmc.com',
      'beckershospitalreview.com',
    ].join(',');

    // Fetch articles from the last 24 hours
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 1);

    const params = new URLSearchParams({
      q: query,
      domains: domains,
      from: fromDate.toISOString(),
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '20',
      apiKey: NEWS_API_KEY,
    });

    const response = await fetch(`${NEWS_API_URL}?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      errors.push(`NewsAPI error: ${response.status} - ${errorText}`);
      return { source: 'news', items, errors };
    }

    const data: NewsAPIResponse = await response.json();

    if (data.status !== 'ok') {
      errors.push(`NewsAPI returned status: ${data.status}`);
      return { source: 'news', items, errors };
    }

    // Transform articles to ScrapedItem format
    for (const article of data.articles) {
      if (!article.url || !article.title) continue;

      items.push({
        url: article.url,
        title: article.title,
        content: article.description || article.content || article.title,
        source: 'news',
        publishedAt: new Date(article.publishedAt),
      });
    }

    console.log(`NewsAPI: Found ${items.length} articles`);
  } catch (error) {
    errors.push(`NewsAPI exception: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { source: 'news', items, errors };
}
