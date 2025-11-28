# CIO Perinatal News v2.0 - Changelog

## Overview
Version 2.0 expands the news aggregation system with new data sources and broader Revenue Cycle Management (RCM) focus, moving beyond basic billing to include AI coding, denial management, and payer policy automation.

## What's New

### 🆕 New Data Sources

#### 1. RSS Feeds (lib/scrapers/rss.ts)
Direct integration with high-reliability medical journals and healthcare news sites:
- **Fierce Healthcare** (Finance section) - Healthcare RCM news
- **Healthcare IT News** - Revenue cycle technology
- **Becker's Hospital Review** - Healthcare finance
- **AJOG (Gray Journal)** - American Journal of Obstetrics & Gynecology
- **Obstetrics & Gynecology** (Green Journal) - Official ACOG journal

**Benefits:**
- No more waiting for Google indexing
- Structured, reliable data from authoritative sources
- Immediate access to new research and news

#### 2. Bluesky Social (lib/scrapers/bluesky.ts)
Integration with Bluesky's public API for real-time medical discussions:
- MedSky community discussions
- Healthcare tech conversations
- Real-time clinical insights
- Free, open API (no rate limits on public search)

**Search Queries:**
- Medical billing automation
- Revenue cycle management
- Preeclampsia research
- Gestational diabetes
- CGM pregnancy
- Healthcare RCM

#### 3. Enhanced Reddit Coverage
Added subreddits for deeper RCM/billing insights:
- **r/MedicalCoding** - Technical coding discussions
- **r/healthIT** - Healthcare IT implementation (already included, now with broader terms)

### 📈 Expanded Topic Coverage

#### Billing → Revenue Cycle Management (RCM)
**New keywords added to config/topics.ts:**
- RCM automation
- Autonomous coding
- AI coding
- Denial management
- Payer policy changes
- Predictive revenue analytics
- Prior authorization automation
- Claims denial
- Revenue integrity
- Charge capture automation

**Focus shift:**
- ❌ Generic billing job postings (score 0-3)
- ✅ Automation and AI technology (score 7+)
- ✅ Breakthrough RCM innovations (score 9-10)

### 🤖 Enhanced AI Analysis

**Updated system prompt (lib/ai/analyzer.ts):**
- Emphasizes AUTOMATION and TECHNOLOGY in billing content
- Explicitly penalizes generic/manual billing content
- Recognizes user as both MFM specialist AND healthcare tech developer
- Stricter scoring for billing: automation focus required for high scores

**New scoring guidelines:**
- Generic billing content: 0-3
- Moderate tech relevance: 4-6
- Significant automation/AI: 7-8
- Breakthrough innovation: 9-10

## Technical Changes

### Dependencies
- ✅ Added `rss-parser` for RSS feed parsing

### Type System Updates
- Updated `NewsSource` type to include `'rss'` and `'bluesky'`
- Updated database types in `lib/supabase/database.types.ts`
- Updated scraper types in `lib/scrapers/types.ts`

### Database Migration
**File:** `supabase/migrations/20251128_add_rss_bluesky_sources.sql`
- Adds 'rss' and 'bluesky' to valid source enum
- Updates column comment

**To apply:**
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase dashboard SQL editor
```

### Scraper Orchestration
**Updated lib/scrapers/index.ts:**
- Added RSS and Bluesky to parallel execution
- Updated source tracking
- Exports new scrapers for testing

## Expected Impact

### Data Volume
- **Before:** 10-20 items/day
- **After:** 50-100 items/day
- More items will be filtered out by stricter AI scoring

### API Costs
- **Before:** ~$2-5/month (OpenAI)
- **After:** ~$5-15/month (increased volume, still very cost-effective)
- All new data sources remain FREE (RSS, Bluesky public API)

### Quality Improvements
- Higher signal-to-noise ratio for billing content
- Direct access to peer-reviewed research (AJOG, Green Journal)
- Real-time discussions from practitioners (Bluesky, Reddit)
- Faster discovery of breaking news (RSS vs Google indexing delay)

## Testing Checklist

- [x] RSS scraper compiles and runs
- [x] Bluesky scraper compiles and runs
- [x] TypeScript types updated
- [x] Database migration created
- [ ] Test RSS feeds are valid and returning content
- [ ] Test Bluesky API returns results
- [ ] Verify AI scoring with new RCM-focused articles
- [ ] Deploy to Vercel and run full ingest cycle
- [ ] Monitor OpenAI API costs for first week

## Deployment Steps

1. **Update database schema:**
   ```bash
   # Run the migration in Supabase dashboard or via CLI
   supabase db push
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Test the ingest endpoint:**
   ```bash
   curl -X GET https://your-app.vercel.app/api/ingest \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

4. **Monitor the dashboard:**
   - Check that RSS and Bluesky items appear
   - Verify scoring accuracy
   - Review any error logs

## Breaking Changes
None - all changes are additive and backward compatible.

## Migration Notes
- Existing data remains unchanged
- New sources will start appearing after first post-deployment ingest
- Old items with sources 'twitter', 'linkedin', 'reddit', 'news' continue to work
- No frontend changes required - dashboard automatically handles new sources

---

**Version:** 2.0  
**Date:** November 28, 2024  
**Migration Required:** Yes (database schema)  
**Backward Compatible:** Yes
