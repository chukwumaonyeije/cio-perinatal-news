-- Create news_items table
CREATE TABLE IF NOT EXISTS public.news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('twitter', 'linkedin', 'reddit', 'news')),
  content TEXT NOT NULL,
  ai_summary TEXT,
  relevance_score INTEGER NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 10),
  category TEXT NOT NULL CHECK (category IN ('billing', 'gdm', 'preeclampsia', 'other')),
  bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_items_created_at ON public.news_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_relevance_score ON public.news_items(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_category ON public.news_items(category);
CREATE INDEX IF NOT EXISTS idx_news_items_source ON public.news_items(source);
CREATE INDEX IF NOT EXISTS idx_news_items_bookmarked ON public.news_items(bookmarked) WHERE bookmarked = true;

-- Create full-text search index for title and content
CREATE INDEX IF NOT EXISTS idx_news_items_search ON public.news_items 
USING gin(to_tsvector('english', title || ' ' || content));

-- Enable Row Level Security (RLS)
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow authenticated users to read all news items
CREATE POLICY "Allow authenticated users to read news items"
ON public.news_items
FOR SELECT
TO authenticated
USING (true);

-- Create policy: Allow authenticated users to update bookmarks
CREATE POLICY "Allow authenticated users to update bookmarks"
ON public.news_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy: Allow service role to insert news items (for the scraper)
CREATE POLICY "Allow service role to insert news items"
ON public.news_items
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create policy: Allow service role to read all items
CREATE POLICY "Allow service role to read all items"
ON public.news_items
FOR SELECT
TO service_role
USING (true);

-- Comments for documentation
COMMENT ON TABLE public.news_items IS 'Stores scraped and AI-analyzed news items from various sources';
COMMENT ON COLUMN public.news_items.url IS 'Unique URL of the news item';
COMMENT ON COLUMN public.news_items.source IS 'Source platform: twitter, linkedin, reddit, or news';
COMMENT ON COLUMN public.news_items.relevance_score IS 'AI-generated relevance score from 0-10';
COMMENT ON COLUMN public.news_items.category IS 'Topic category: billing, gdm, preeclampsia, or other';
COMMENT ON COLUMN public.news_items.ai_summary IS 'AI-generated 2-sentence summary for MFM context';
