# Supabase Database Setup

This folder contains the database schema and migration files for the CIO Perinatal News project.

## Initial Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: CIO Perinatal News
   - **Database Password**: Generate a secure password (save this!)
   - **Region**: Choose closest to you (e.g., US East)
   - **Pricing Plan**: Free
4. Wait for the project to be created (~2 minutes)

### 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values to your `.env.local` file:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### 3. Run the Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `migrations/20250125_create_news_items.sql`
4. Click "Run" or press `Ctrl+Enter`
5. You should see "Success. No rows returned"

### 4. Verify the Setup

Go to **Table Editor** in the Supabase dashboard. You should see:
- ✅ `news_items` table with all columns
- ✅ Indexes created
- ✅ RLS (Row Level Security) enabled

### 5. Create Your User Account

1. Go to **Authentication** → **Users** in the Supabase dashboard
2. Click "Add User" → "Create new user"
3. Enter your email and password
4. Click "Create User"
5. ✅ You can now log in to the app with these credentials

## Database Schema

### `news_items` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `url` | TEXT | Unique URL of the news item |
| `title` | TEXT | Headline/title |
| `source` | TEXT | Source platform: `twitter`, `linkedin`, `reddit`, or `news` |
| `content` | TEXT | Full text content or excerpt |
| `ai_summary` | TEXT | AI-generated 2-sentence summary |
| `relevance_score` | INTEGER | AI-generated score (0-10) |
| `category` | TEXT | Topic: `billing`, `gdm`, `preeclampsia`, or `other` |
| `bookmarked` | BOOLEAN | User bookmark flag |
| `created_at` | TIMESTAMPTZ | When the item was added to the database |
| `published_at` | TIMESTAMPTZ | When the item was originally published |

### Indexes

- `idx_news_items_created_at` - For sorting by date
- `idx_news_items_relevance_score` - For filtering by score
- `idx_news_items_category` - For filtering by topic
- `idx_news_items_source` - For filtering by source
- `idx_news_items_bookmarked` - For fetching bookmarked items
- `idx_news_items_search` - Full-text search on title and content

### Row Level Security (RLS) Policies

- **Authenticated users** can:
  - Read all news items
  - Update bookmarks
- **Service role** (scrapers) can:
  - Insert new items
  - Read all items

## Troubleshooting

### "relation public.news_items does not exist"
→ The migration hasn't been run. Follow step 3 above.

### "new row violates check constraint"
→ You're trying to insert an invalid `source` or `category`. Check `migrations/20250125_create_news_items.sql` for allowed values.

### "duplicate key value violates unique constraint"
→ You're trying to insert a URL that already exists. This is normal and the scraper handles it gracefully.

### Can't see data in the frontend
→ Make sure you've created a user account (step 5) and are logged in.

## Maintenance

### Clean Up Old Articles

Run this in the SQL Editor to delete articles older than 90 days:

```sql
DELETE FROM public.news_items 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### View Statistics

```sql
SELECT 
  category,
  COUNT(*) as count,
  AVG(relevance_score) as avg_score
FROM public.news_items
GROUP BY category
ORDER BY count DESC;
```
