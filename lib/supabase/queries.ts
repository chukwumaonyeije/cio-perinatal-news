import { supabaseAdmin } from './client';
import { Database } from './database.types';

type NewsItem = Database['public']['Tables']['news_items']['Row'];
type NewsItemInsert = Database['public']['Tables']['news_items']['Insert'];
type NewsItemUpdate = Database['public']['Tables']['news_items']['Update'];

export interface NewsItemFilters {
  category?: string;
  minScore?: number;
  bookmarked?: boolean;
  source?: string;
  limit?: number;
  offset?: number;
}

/**
 * Insert a new news item into the database
 * Uses admin client to bypass RLS
 */
export async function insertNewsItem(item: NewsItemInsert) {
  const { data, error } = await supabaseAdmin
    .from('news_items')
    .insert(item)
    .select()
    .single();

  if (error) {
    // If it's a duplicate URL error, skip silently
    if (error.code === '23505') {
      console.log(`Skipping duplicate URL: ${item.url}`);
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Insert multiple news items (bulk insert)
 * Ignores duplicates automatically
 */
export async function insertNewsItems(items: NewsItemInsert[]) {
  if (items.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('news_items')
    .upsert(items, { onConflict: 'url', ignoreDuplicates: true })
    .select();

  if (error) throw error;
  return data || [];
}

/**
 * Fetch news items with optional filters
 */
export async function getNewsItems(filters: NewsItemFilters = {}) {
  let query = supabaseAdmin
    .from('news_items')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.minScore !== undefined) {
    query = query.gte('relevance_score', filters.minScore);
  }

  if (filters.bookmarked !== undefined) {
    query = query.eq('bookmarked', filters.bookmarked);
  }

  if (filters.source) {
    query = query.eq('source', filters.source);
  }

  // Apply pagination
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Search news items by text query
 */
export async function searchNewsItems(searchQuery: string, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('news_items')
    .select('*')
    .textSearch('title', searchQuery, {
      type: 'websearch',
      config: 'english',
    })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Update a news item (mainly for bookmarking)
 */
export async function updateNewsItem(id: string, updates: NewsItemUpdate) {
  const { data, error } = await supabaseAdmin
    .from('news_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get news item by ID
 */
export async function getNewsItemById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('news_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete old news items (for cleanup/maintenance)
 */
export async function deleteOldNewsItems(daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabaseAdmin
    .from('news_items')
    .delete()
    .lt('created_at', cutoffDate.toISOString())
    .select();

  if (error) throw error;
  return data || [];
}

/**
 * Get statistics about the news items
 */
export async function getNewsItemStats() {
  const { count: total } = await supabaseAdmin
    .from('news_items')
    .select('*', { count: 'exact', head: true });

  const { count: bookmarked } = await supabaseAdmin
    .from('news_items')
    .select('*', { count: 'exact', head: true })
    .eq('bookmarked', true);

  const { data: byCategory } = await supabaseAdmin
    .from('news_items')
    .select('category')
    .order('category');

  const categoryCounts = (byCategory || []).reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: total || 0,
    bookmarked: bookmarked || 0,
    byCategory: categoryCounts,
  };
}
