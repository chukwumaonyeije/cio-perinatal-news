import { NextRequest, NextResponse } from 'next/server';
import { updateNewsItem, getNewsItemById } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

/**
 * Bookmark endpoint - toggles bookmark status for a news item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, bookmarked } = body;

    if (!id || typeof bookmarked !== 'boolean') {
      return NextResponse.json(
        { error: 'Item ID and bookmarked status are required' },
        { status: 400 }
      );
    }

    // Update the bookmark status
    const updatedItem = await updateNewsItem(id, { bookmarked });

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.error('Bookmark error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
