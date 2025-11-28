import { ScrapedItem, ScraperResult } from './types';
import { TOPICS } from '@/config/topics';

const REDDIT_API_URL = 'https://www.reddit.com';

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    created_utc: number;
    subreddit: string;
    author: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

const SUBREDDITS = [
  'medicine',
  'obgyn',
  'AskDocs',
  'medicalbilling',
  'healthIT',
  // v2.0: Added for deeper RCM/billing insights
  'MedicalCoding',
];

/**
 * Scrape Reddit for medical discussions
 * Uses the public JSON API (no authentication required)
 */
export async function scrapeReddit(): Promise<ScraperResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];

  try {
    // Combine keywords for search
    const keywords = TOPICS.flatMap(topic => topic.keywords.slice(0, 2));

    for (const subreddit of SUBREDDITS) {
      try {
        // Fetch hot posts from the subreddit
        const response = await fetch(
          `${REDDIT_API_URL}/r/${subreddit}/hot.json?limit=25`,
          {
            headers: {
              'User-Agent': 'CIOPerinatalNews/1.0',
            },
          }
        );

        if (!response.ok) {
          errors.push(`Reddit r/${subreddit}: ${response.status} ${response.statusText}`);
          continue;
        }

        const data: RedditResponse = await response.json();

        for (const post of data.data.children) {
          const { title, selftext, permalink, created_utc, url } = post.data;

          // Filter posts by keywords
          const text = `${title} ${selftext}`.toLowerCase();
          const hasRelevantKeyword = keywords.some(keyword =>
            text.includes(keyword.toLowerCase())
          );

          if (!hasRelevantKeyword) continue;

          // Use Reddit permalink for consistency
          const postUrl = `${REDDIT_API_URL}${permalink}`;

          items.push({
            url: postUrl,
            title: title,
            content: selftext || title,
            source: 'reddit',
            publishedAt: new Date(created_utc * 1000),
          });
        }

        // Rate limiting - be nice to Reddit
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errors.push(
          `Reddit r/${subreddit} exception: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log(`Reddit: Found ${items.length} posts across ${SUBREDDITS.length} subreddits`);
  } catch (error) {
    errors.push(`Reddit exception: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { source: 'reddit', items, errors };
}
