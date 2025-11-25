import { ScrapedItem, ScraperResult } from './types';
import { TOPICS } from '@/config/topics';

const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
const GOOGLE_CSE_URL = 'https://www.googleapis.com/customsearch/v1';

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  pagemap?: {
    metatags?: Array<{
      'article:published_time'?: string;
    }>;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
  error?: {
    message: string;
  };
}

/**
 * Scrape LinkedIn posts using Google Custom Search API
 * This is the legal workaround to avoid LinkedIn's scraping restrictions
 */
export async function scrapeLinkedIn(): Promise<ScraperResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];

  if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
    errors.push('GOOGLE_CSE_API_KEY or GOOGLE_CSE_ID is not configured');
    return { source: 'linkedin', items, errors };
  }

  try {
    // Search for each topic category
    for (const topic of TOPICS) {
      try {
        // Use top 2 keywords from each category
        const keywords = topic.keywords.slice(0, 2).join(' OR ');
        
        // Construct search query: site:linkedin.com/posts + keywords + recent date
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 7); // Last 7 days
        const dateStr = dateFilter.toISOString().split('T')[0];
        
        const query = `site:linkedin.com/posts (${keywords}) after:${dateStr}`;

        const params = new URLSearchParams({
          key: GOOGLE_CSE_API_KEY,
          cx: GOOGLE_CSE_ID,
          q: query,
          num: '10', // Max 10 results per query
        });

        const response = await fetch(`${GOOGLE_CSE_URL}?${params.toString()}`);

        if (!response.ok) {
          const errorText = await response.text();
          errors.push(`Google CSE error for ${topic.category}: ${response.status} - ${errorText}`);
          continue;
        }

        const data: GoogleSearchResponse = await response.json();

        if (data.error) {
          errors.push(`Google CSE error for ${topic.category}: ${data.error.message}`);
          continue;
        }

        if (!data.items || data.items.length === 0) {
          console.log(`LinkedIn (${topic.category}): No results found`);
          continue;
        }

        // Transform results to ScrapedItem format
        for (const result of data.items) {
          // Extract published date if available
          let publishedAt: Date | undefined;
          const publishedTime = result.pagemap?.metatags?.[0]?.['article:published_time'];
          if (publishedTime) {
            publishedAt = new Date(publishedTime);
          }

          items.push({
            url: result.link,
            title: result.title,
            content: result.snippet,
            source: 'linkedin',
            publishedAt,
          });
        }

        // Rate limiting - Google CSE has strict quotas
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errors.push(
          `LinkedIn (${topic.category}) exception: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log(`LinkedIn: Found ${items.length} posts via Google CSE`);
  } catch (error) {
    errors.push(`LinkedIn exception: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { source: 'linkedin', items, errors };
}
