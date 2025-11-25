import { ScrapedItem, ScraperResult } from './types';
import { TOPICS } from '@/config/topics';

const APIFY_API_KEY = process.env.APIFY_API_KEY;
const APIFY_API_URL = 'https://api.apify.com/v2';

// Using the popular Twitter Scraper actor
const TWITTER_SCRAPER_ACTOR_ID = 'apidojo/tweet-scraper';

interface ApifyTwitterResult {
  full_text: string;
  url: string;
  created_at: string;
  user: {
    name: string;
    screen_name: string;
  };
}

interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId: string;
  };
}

/**
 * Scrape Twitter/X using Apify
 * Uses a paid actor but costs only pennies per run
 */
export async function scrapeTwitter(): Promise<ScraperResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];

  if (!APIFY_API_KEY) {
    errors.push('APIFY_API_KEY is not configured');
    return { source: 'twitter', items, errors };
  }

  try {
    // Combine keywords for search
    const keywords = TOPICS.flatMap(topic => topic.keywords.slice(0, 2));
    const searchQueries = keywords.map(keyword => `"${keyword}"`);

    // Start the Apify actor
    const runResponse = await fetch(
      `${APIFY_API_URL}/acts/${TWITTER_SCRAPER_ACTOR_ID}/runs?token=${APIFY_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerms: searchQueries.slice(0, 5), // Limit to 5 searches to control cost
          maxTweets: 10, // Get 10 tweets per search term
          includeRetweets: false,
          languageCode: 'en',
        }),
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      errors.push(`Apify run error: ${runResponse.status} - ${errorText}`);
      return { source: 'twitter', items, errors };
    }

    const runData: ApifyRunResponse = await runResponse.json();
    const runId = runData.data.id;

    // Poll for completion (wait up to 60 seconds)
    let attempts = 0;
    const maxAttempts = 12; // 12 attempts * 5 seconds = 60 seconds
    let status = runData.data.status;

    while (status !== 'SUCCEEDED' && status !== 'FAILED' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `${APIFY_API_URL}/actor-runs/${runId}?token=${APIFY_API_KEY}`
      );

      if (statusResponse.ok) {
        const statusData: ApifyRunResponse = await statusResponse.json();
        status = statusData.data.status;
      }

      attempts++;
    }

    if (status !== 'SUCCEEDED') {
      errors.push(`Apify run did not complete successfully. Status: ${status}`);
      return { source: 'twitter', items, errors };
    }

    // Fetch the results from the dataset
    const datasetId = runData.data.defaultDatasetId;
    const resultsResponse = await fetch(
      `${APIFY_API_URL}/datasets/${datasetId}/items?token=${APIFY_API_KEY}`
    );

    if (!resultsResponse.ok) {
      const errorText = await resultsResponse.text();
      errors.push(`Apify dataset error: ${resultsResponse.status} - ${errorText}`);
      return { source: 'twitter', items, errors };
    }

    const tweets: ApifyTwitterResult[] = await resultsResponse.json();

    // Transform tweets to ScrapedItem format
    for (const tweet of tweets) {
      if (!tweet.url || !tweet.full_text) continue;

      items.push({
        url: tweet.url,
        title: `Tweet by @${tweet.user.screen_name}`,
        content: tweet.full_text,
        source: 'twitter',
        publishedAt: new Date(tweet.created_at),
      });
    }

    console.log(`Twitter: Found ${items.length} tweets via Apify`);
  } catch (error) {
    errors.push(`Twitter exception: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { source: 'twitter', items, errors };
}
