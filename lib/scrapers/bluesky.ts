import { ScrapedItem, ScraperResult } from './types';

const BLUESKY_API_URL = 'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts';

// Search queries for Bluesky
const SEARCH_QUERIES = [
  'medical billing automation',
  'revenue cycle management',
  'preeclampsia research',
  'gestational diabetes',
  'CGM pregnancy',
  'healthcare RCM',
];

interface BlueskyPost {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
  };
  record: {
    text: string;
    createdAt: string;
  };
  indexedAt: string;
}

interface BlueskySearchResponse {
  posts: BlueskyPost[];
}

/**
 * Scrape Bluesky for medical discussions
 * Uses the public API (no authentication required)
 * Targets MedSky community and healthcare tech discussions
 */
export async function scrapeBluesky(): Promise<ScraperResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];
  const seenUrls = new Set<string>();

  console.log(`Starting Bluesky scraping with ${SEARCH_QUERIES.length} queries...`);

  for (const query of SEARCH_QUERIES) {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '10', // Get 10 posts per query
      });

      const response = await fetch(`${BLUESKY_API_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': 'CIOPerinatalNews/2.0',
        },
      });

      if (!response.ok) {
        errors.push(`Bluesky query "${query}": ${response.status} ${response.statusText}`);
        continue;
      }

      const data: BlueskySearchResponse = await response.json();

      if (!data.posts || data.posts.length === 0) {
        console.log(`Bluesky query "${query}": No results`);
        continue;
      }

      for (const post of data.posts) {
        // Extract post ID from URI (at://did:plc:xxx/app.bsky.feed.post/postid)
        const postId = post.uri.split('/').pop();
        const postUrl = `https://bsky.app/profile/${post.author.handle}/post/${postId}`;

        // Deduplicate by URL
        if (seenUrls.has(postUrl)) continue;
        seenUrls.add(postUrl);

        const title = `@${post.author.handle}: ${post.record.text.substring(0, 100)}${post.record.text.length > 100 ? '...' : ''}`;

        items.push({
          url: postUrl,
          title: title,
          content: post.record.text,
          source: 'bluesky',
          publishedAt: new Date(post.record.createdAt),
        });
      }

      console.log(`Bluesky query "${query}": Found ${data.posts.length} posts`);

      // Rate limiting - be nice to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      const errorMsg = `Bluesky query "${query}" exception: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  console.log(`Bluesky scraping complete: ${items.length} unique posts from ${SEARCH_QUERIES.length} queries`);

  return { source: 'bluesky', items, errors };
}
