import Parser from 'rss-parser';
import { ScrapedItem, ScraperResult } from './types';

const parser = new Parser();

// High-value RSS feeds for MFM research and RCM news
const RSS_FEEDS = [
  // Healthcare Finance & RCM - Working feeds
  {
    url: 'https://www.healthcareitnews.com/rss/news',
    source: 'Healthcare IT News',
  },
  {
    url: 'https://www.beckershospitalreview.com/rss.xml',
    source: 'Becker\'s Hospital Review',
  },
  {
    url: 'https://www.fiercehealthcare.com/rss',
    source: 'Fierce Healthcare',
  },
  // Medical Journals - OBGYN/MFM
  {
    url: 'https://rss.sciencedirect.com/publication/science/00029378',
    source: 'AJOG (Gray Journal)',
  },
  // Alternative medical news sources
  {
    url: 'https://www.medpagetoday.com/rss/obgyn.xml',
    source: 'MedPage Today - OBGYN',
  },
];

/**
 * Scrape RSS feeds from medical journals and healthcare news sites
 * These are high-reliability sources with structured data
 */
export async function scrapeRSS(): Promise<ScraperResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];

  console.log(`Starting RSS scraping from ${RSS_FEEDS.length} feeds...`);

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      
      // Get the 10 most recent items from each feed
      const recentItems = feed.items.slice(0, 10);

      for (const item of recentItems) {
        if (!item.link || !item.title) continue;

        // Extract content - prefer contentSnippet over content for cleaner text
        const content = item.contentSnippet || item.content || item.title;
        
        // Parse published date
        let publishedAt: Date | undefined;
        if (item.isoDate) {
          publishedAt = new Date(item.isoDate);
        } else if (item.pubDate) {
          publishedAt = new Date(item.pubDate);
        }

        items.push({
          url: item.link,
          title: item.title,
          content: content.substring(0, 1000), // Limit content length
          source: 'rss',
          publishedAt,
        });
      }

      console.log(`RSS ${feedConfig.source}: Found ${recentItems.length} items`);
    } catch (error) {
      const errorMsg = `RSS ${feedConfig.source} failed: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  console.log(`RSS scraping complete: ${items.length} total items from ${RSS_FEEDS.length} feeds`);

  return { source: 'rss', items, errors };
}
