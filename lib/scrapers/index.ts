import { scrapeNewsAPI } from './news-api';
import { scrapeReddit } from './reddit';
import { scrapeLinkedIn } from './linkedin-google';
import { scrapeTwitter } from './twitter-apify';
import { scrapeRSS } from './rss';
import { scrapeBluesky } from './bluesky';
import { ScrapedItem, ScraperResult } from './types';

export interface ScraperSummary {
  totalItems: number;
  itemsBySource: Record<string, number>;
  errors: string[];
  duration: number;
}

/**
 * Run all scrapers in parallel and aggregate results
 */
export async function runAllScrapers(): Promise<{
  items: ScrapedItem[];
  summary: ScraperSummary;
}> {
  const startTime = Date.now();
  const allErrors: string[] = [];
  const allItems: ScrapedItem[] = [];

  console.log('Starting scraper orchestration...');

  // Run all scrapers in parallel (v2.0: added RSS and Bluesky)
  const results = await Promise.allSettled([
    scrapeNewsAPI(),
    scrapeReddit(),
    scrapeLinkedIn(),
    scrapeTwitter(),
    scrapeRSS(),
    scrapeBluesky(),
  ]);

  // Process results
  const itemsBySource: Record<string, number> = {
    news: 0,
    reddit: 0,
    linkedin: 0,
    twitter: 0,
    rss: 0,
    bluesky: 0,
  };

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const scraperResult: ScraperResult = result.value;
      
      // Collect items
      allItems.push(...scraperResult.items);
      
      // Count by source
      itemsBySource[scraperResult.source] = scraperResult.items.length;
      
      // Collect errors
      if (scraperResult.errors && scraperResult.errors.length > 0) {
        allErrors.push(...scraperResult.errors);
      }
    } else {
      // Handle scraper that threw an exception
      allErrors.push(`Scraper failed: ${result.reason}`);
    }
  }

  const duration = Date.now() - startTime;

  const summary: ScraperSummary = {
    totalItems: allItems.length,
    itemsBySource,
    errors: allErrors,
    duration,
  };

  console.log(`Scraping complete: ${allItems.length} items in ${duration}ms`);
  console.log('Items by source:', itemsBySource);

  if (allErrors.length > 0) {
    console.warn(`Encountered ${allErrors.length} errors:`, allErrors);
  }

  return { items: allItems, summary };
}

// Export individual scrapers for testing
export { scrapeNewsAPI, scrapeReddit, scrapeLinkedIn, scrapeTwitter, scrapeRSS, scrapeBluesky };
