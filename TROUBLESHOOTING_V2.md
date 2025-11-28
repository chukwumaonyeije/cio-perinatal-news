# Troubleshooting v2.0 Issues

## Current Issues and Fixes

### ✅ FIXED: Dashboard Not Loading
**Issue:** Dashboard showed "No news items yet" even after successful ingestion.
**Cause:** Dashboard was using authenticated Supabase client instead of admin client.
**Fix:** Updated `app/page.tsx` to use `createAdminClient()` for public access.

### ✅ FIXED: RSS Feed 404 Errors
**Issue:** Some RSS feeds returned 404:
- Fierce Healthcare Finance section
- Becker's Hospital Review finance.xml
- Obstetrics & Gynecology journal

**Fix:** Updated RSS feed URLs in `lib/scrapers/rss.ts`:
- Changed Fierce Healthcare to general RSS feed
- Changed Becker's to main RSS feed
- Added MedPage Today OBGYN as alternative source
- Kept working feeds (Healthcare IT News, AJOG)

### ⚠️ KNOWN ISSUE: Reddit 403 Blocked
**Issue:** All Reddit subreddits return 403 Forbidden:
```
Reddit r/medicine: 403 Blocked
Reddit r/obgyn: 403 Blocked
Reddit r/MedicalCoding: 403 Blocked
etc.
```

**Cause:** Reddit has rate limiting and bot detection. The public JSON API may be blocking requests from Vercel IPs.

**Temporary Workarounds:**
1. Reddit scraper will gracefully fail and log errors
2. Other scrapers (RSS, NewsAPI) will continue to work
3. Consider these alternatives:
   - Use Reddit's official API with authentication (requires Reddit API key)
   - Reduce request frequency
   - Add User-Agent rotation
   - Use a proxy service

**To disable Reddit scraper temporarily:**
```typescript
// In lib/scrapers/index.ts, comment out:
// scrapeReddit(),
```

### ⚠️ KNOWN ISSUE: Google Custom Search API Disabled
**Issue:** Google CSE returns 403 PERMISSION_DENIED:
```json
{
  "status": "PERMISSION_DENIED",
  "reason": "SERVICE_DISABLED",
  "activationUrl": "https://console.developers.google.com/apis/api/customsearch.googleapis.com/overview?project=10288697710"
}
```

**Cause:** The Custom Search API is not enabled in your Google Cloud project.

**Fix:**
1. Go to: https://console.developers.google.com/apis/api/customsearch.googleapis.com/overview?project=10288697710
2. Click "Enable API"
3. Wait a few minutes for activation
4. Test the ingest endpoint again

**Alternative:** Temporarily disable LinkedIn scraper:
```typescript
// In lib/scrapers/index.ts:
// scrapeLinkedIn(),
```

### ⚠️ KNOWN ISSUE: Bluesky 403 Forbidden
**Issue:** All Bluesky queries return 403:
```
Bluesky query "medical billing automation": 403 Forbidden
```

**Cause:** Bluesky's public API may have rate limits or require authentication.

**Status:** Temporarily disabled in `lib/scrapers/index.ts`

**Possible Fixes:**
1. Check Bluesky API documentation for authentication requirements
2. Add rate limiting delays between requests
3. Use official Bluesky SDK: `npm install @atproto/api`
4. Consider requesting an API key from Bluesky

### ⚠️ KNOWN ISSUE: Apify Twitter 404 Error
**Issue:** 
```json
{
  "error": {
    "type": "page-not-found",
    "message": "We have bad news: there is no API endpoint at this URL. Did you specify it correctly?"
  }
}
```

**Cause:** The Apify actor URL or configuration may be incorrect.

**To Fix:**
1. Check your Apify actor ID is correct
2. Verify your APIFY_API_KEY is valid
3. Check the actor is still available in your Apify account
4. Review `lib/scrapers/twitter-apify.ts` configuration

## What's Currently Working

✅ **RSS Feeds** - Working and providing most content:
- Healthcare IT News
- Becker's Hospital Review  
- Fierce Healthcare
- AJOG (American Journal of Obstetrics & Gynecology)
- MedPage Today - OBGYN

✅ **NewsAPI** - Working for medical news outlets

✅ **AI Analysis** - OpenAI GPT-4o-mini successfully analyzing and scoring items

✅ **Database** - Supabase successfully storing items

✅ **Dashboard** - Now displays items correctly

## Deployment Status

**Production URL:** https://cio-perinatal-news.vercel.app

**Environment Variables Needed:**
- ✅ CRON_SECRET
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ OPENAI_API_KEY
- ✅ NEWS_API_KEY
- ⚠️ GOOGLE_CSE_API_KEY (API needs to be enabled)
- ⚠️ GOOGLE_CSE_ID (API needs to be enabled)
- ⚠️ APIFY_API_KEY (Actor needs to be configured)

## Performance with Current Configuration

**Expected Daily Results:**
- 20-40 items scraped (mostly from RSS)
- 15-25 items analyzed successfully
- 5-15 items saved (score >= 4)

**Cost:**
- RSS: $0/month (free)
- NewsAPI: $0/month (free tier)
- OpenAI: ~$3-8/month (reduced volume due to scraper issues)

## Next Steps to Restore Full Functionality

1. **Enable Google Custom Search API** (high priority)
   - Restores LinkedIn scraping
   - 100 free queries/day

2. **Fix Apify Twitter configuration** (medium priority)
   - Review actor settings
   - Verify API key

3. **Add Reddit API authentication** (optional)
   - Requires Reddit app registration
   - More reliable than public JSON endpoint

4. **Investigate Bluesky authentication** (optional)
   - Check if official SDK helps
   - Consider rate limiting strategies

## Monitoring

Check Vercel logs for errors:
```bash
vercel logs https://cio-perinatal-news.vercel.app --since=1h
```

Test ingest endpoint:
```powershell
iwr "https://cio-perinatal-news.vercel.app/api/ingest" -Headers @{"Authorization" = "Bearer YOUR_CRON_SECRET"} -Method GET
```
