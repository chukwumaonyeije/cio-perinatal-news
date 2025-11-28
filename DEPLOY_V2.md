# Deploying CIO Perinatal News v2.0

## Prerequisites Checklist
- [x] Code changes committed to git
- [ ] Database migration applied
- [ ] Deployed to Vercel
- [ ] Tested ingest endpoint

## Step 1: Apply Database Migration

Since you don't have Supabase CLI installed, you'll need to apply the migration manually:

### Option A: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/iphfiyqbtxndjrjncwhg
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase/migrations/20251128_add_rss_bluesky_sources.sql`
5. Paste into the SQL editor
6. Click "Run" (or press Ctrl+Enter)
7. Verify: You should see "Success. No rows returned"

### Option B: Via Local File
1. Open `supabase/migrations/20251128_add_rss_bluesky_sources.sql`
2. Copy all the SQL
3. Run it in your Supabase project's SQL editor

## Step 2: Deploy to Vercel

```bash
# Make sure all changes are committed
git add .
git commit -m "v2.0: Add RSS and Bluesky sources, expand RCM coverage"
git push

# Deploy to production
vercel --prod
```

## Step 3: Test the Update

### 3.1 Test the Ingest Endpoint
```powershell
iwr "https://your-new-deployment-url.vercel.app/api/ingest" -Headers @{"Authorization" = "Bearer fc960d875a55eaae36f038fd74ef39b4bc34f0fe1fdf9b15845c17b075bf4e4a"} -Method GET
```

**Expected response:**
```json
{
  "success": true,
  "message": "Ingestion completed successfully",
  "scraped": 80,
  "analyzed": 75,
  "inserted": 35,
  "itemsBySource": {
    "news": 5,
    "reddit": 15,
    "linkedin": 8,
    "twitter": 12,
    "rss": 25,
    "bluesky": 15
  },
  "duration": 45000
}
```

### 3.2 Check Dashboard
Visit your Vercel URL and verify:
- [x] RSS articles appear (look for titles from Fierce Healthcare, AJOG, etc.)
- [x] Bluesky posts appear (look for @username handles in titles)
- [x] Billing articles are more focused on automation/RCM
- [x] Relevance scores are working correctly

### 3.3 Verify Source Distribution
Check your Supabase database:
```sql
SELECT source, COUNT(*) as count
FROM news_items
GROUP BY source
ORDER BY count DESC;
```

You should see both 'rss' and 'bluesky' in the results.

## Step 4: Monitor Performance

### Week 1 Checklist
- [ ] Monitor OpenAI API costs (should be $5-15/month)
- [ ] Check for any error logs in Vercel dashboard
- [ ] Verify RSS feeds are updating daily
- [ ] Confirm Bluesky API is working (not rate limited)
- [ ] Review AI scoring accuracy for new RCM content

### Potential Issues & Solutions

#### Issue: RSS feeds timing out
**Solution:** Increase timeout in `lib/scrapers/rss.ts` or reduce number of feeds

#### Issue: Bluesky rate limiting
**Solution:** Add longer delays between queries in `lib/scrapers/bluesky.ts`

#### Issue: Too many low-quality items
**Solution:** Adjust AI threshold in `app/api/ingest/route.ts` from 4 to 5 or 6

#### Issue: OpenAI costs too high
**Solution:** 
- Reduce content length in scrapers (currently 1000 chars)
- Increase batch delay in analyzer
- Consider switching to gpt-3.5-turbo for initial filtering

## Step 5: Fine-Tuning (Optional)

After the first week, you may want to adjust:

### RSS Feed Selection
Edit `lib/scrapers/rss.ts` to:
- Add more feeds if certain topics are underrepresented
- Remove feeds that consistently return low-quality content
- Adjust item limit per feed (currently 10)

### Bluesky Query Terms
Edit `lib/scrapers/bluesky.ts` to:
- Add more specific medical terms
- Remove terms that return too much noise
- Adjust limit per query (currently 10)

### AI Scoring Threshold
Edit `app/api/ingest/route.ts`:
- Current threshold: score >= 4
- Consider: score >= 5 for stricter filtering
- Dashboard can always filter to 7+ regardless

## Rollback Plan (If Needed)

If v2.0 causes issues:

1. **Revert database:**
   ```sql
   ALTER TABLE public.news_items 
   DROP CONSTRAINT IF EXISTS news_items_source_check;
   
   ALTER TABLE public.news_items 
   ADD CONSTRAINT news_items_source_check 
   CHECK (source IN ('twitter', 'linkedin', 'reddit', 'news'));
   ```

2. **Revert code:**
   ```bash
   git revert HEAD
   vercel --prod
   ```

3. **Clean up new data:**
   ```sql
   DELETE FROM news_items WHERE source IN ('rss', 'bluesky');
   ```

## Success Metrics

After 1 week, you should see:
- ✅ 50-100 new items per day (up from 10-20)
- ✅ 30-40% from RSS sources (high quality)
- ✅ 15-20% from Bluesky (real-time insights)
- ✅ Higher average relevance scores for billing items
- ✅ More focused RCM/automation content
- ✅ OpenAI costs under $15/month

---

## Need Help?

Check the following files:
- `CHANGELOG_V2.md` - Full list of changes
- `lib/scrapers/rss.ts` - RSS implementation
- `lib/scrapers/bluesky.ts` - Bluesky implementation
- Error logs in Vercel dashboard
