-- v2.0 Migration: Add RSS and Bluesky as valid news sources
-- This migration updates the source column constraint to include the new sources

-- Drop the existing check constraint
ALTER TABLE public.news_items 
DROP CONSTRAINT IF EXISTS news_items_source_check;

-- Add the new check constraint with RSS and Bluesky
ALTER TABLE public.news_items 
ADD CONSTRAINT news_items_source_check 
CHECK (source IN ('twitter', 'linkedin', 'reddit', 'news', 'rss', 'bluesky'));

-- Update the comment to reflect new sources
COMMENT ON COLUMN public.news_items.source IS 'Source platform: twitter, linkedin, reddit, news, rss, or bluesky';
