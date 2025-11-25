import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scrapers';
import { analyzeItems } from '@/lib/ai/analyzer';
import { insertNewsItems } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution time

/**
 * Ingest endpoint - called by Vercel cron job
 * Scrapes news, analyzes with AI, and stores in database
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized ingest attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('=== Starting news ingestion process ===');

    // Step 1: Run all scrapers
    const { items: scrapedItems, summary: scrapeSummary } = await runAllScrapers();

    if (scrapedItems.length === 0) {
      console.log('No items scraped, ending process');
      return NextResponse.json({
        success: true,
        message: 'No new items found',
        scraped: 0,
        analyzed: 0,
        inserted: 0,
        duration: Date.now() - startTime,
      });
    }

    // Step 2: Analyze items with AI
    console.log(`Analyzing ${scrapedItems.length} items with AI...`);
    const enrichedItems = await analyzeItems(scrapedItems, {
      batchSize: 5,
      delayMs: 1000,
    });

    // Step 3: Filter items with score >= 4
    const relevantItems = enrichedItems.filter(item => item.relevanceScore >= 4);
    console.log(`${relevantItems.length}/${enrichedItems.length} items passed relevance threshold (score >= 4)`);

    if (relevantItems.length === 0) {
      console.log('No relevant items found, ending process');
      return NextResponse.json({
        success: true,
        message: 'No relevant items found',
        scraped: scrapedItems.length,
        analyzed: enrichedItems.length,
        inserted: 0,
        duration: Date.now() - startTime,
      });
    }

    // Step 4: Insert into database
    console.log(`Inserting ${relevantItems.length} items into database...`);
    const insertedItems = await insertNewsItems(
      relevantItems.map(item => ({
        url: item.url,
        title: item.title,
        content: item.content,
        source: item.source,
        ai_summary: item.aiSummary,
        relevance_score: item.relevanceScore,
        category: item.category,
        published_at: item.publishedAt?.toISOString() || null,
      }))
    );

    const duration = Date.now() - startTime;

    console.log('=== Ingestion process complete ===');
    console.log(`Duration: ${duration}ms`);
    console.log(`Scraped: ${scrapedItems.length}`);
    console.log(`Analyzed: ${enrichedItems.length}`);
    console.log(`Inserted: ${insertedItems.length}`);

    return NextResponse.json({
      success: true,
      message: 'Ingestion completed successfully',
      scraped: scrapedItems.length,
      analyzed: enrichedItems.length,
      inserted: insertedItems.length,
      itemsBySource: scrapeSummary.itemsBySource,
      errors: scrapeSummary.errors.length > 0 ? scrapeSummary.errors : undefined,
      duration,
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
