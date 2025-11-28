# TODO: Scraper Services to Fix Later

## High Priority

### 1. Enable Google Custom Search API
**Impact:** Restores LinkedIn post scraping  
**Estimated Time:** 5 minutes  
**Steps:**
1. Go to: https://console.developers.google.com/apis/api/customsearch.googleapis.com/overview?project=10288697710
2. Click "Enable API"
3. Wait 2-3 minutes for activation
4. Test with: `iwr "https://cio-perinatal-news.vercel.app/api/ingest" -Headers @{"Authorization" = "Bearer fc960d875a55eaae36f038fd74ef39b4bc34f0fe1fdf9b15845c17b075bf4e4a"}`
5. Verify LinkedIn items appear in itemsBySource

**Current Status:** API is disabled, returns 403 PERMISSION_DENIED

---

## Medium Priority

### 2. Fix Reddit Scraping (403 Blocked)
**Impact:** Restores r/MedicalCoding, r/healthIT, r/medicine discussions  
**Estimated Time:** 30-60 minutes  

**Current Issue:** Reddit returns 403 Forbidden for all subreddits

**Options:**
- **Option A: Official Reddit API (Recommended)**
  1. Create Reddit app at https://www.reddit.com/prefs/apps
  2. Get client ID and secret
  3. Install `snoowrap`: `npm install snoowrap`
  4. Update `lib/scrapers/reddit.ts` to use OAuth
  5. Add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to Vercel env vars

- **Option B: Add delays and User-Agent rotation**
  1. Increase delay between subreddit requests to 3-5 seconds
  2. Randomize User-Agent strings
  3. Add retry logic with exponential backoff

**Current Status:** Gracefully failing, other scrapers still work

---

### 3. Fix Apify Twitter/X Scraping (404 Error)
**Impact:** Restores Twitter/X post scraping  
**Estimated Time:** 15-30 minutes  

**Current Issue:** Returns 404 "page-not-found" error

**Steps to Fix:**
1. Log into Apify dashboard: https://console.apify.com/
2. Navigate to Actors → Your Twitter scraper actor
3. Verify the actor ID in `lib/scrapers/twitter-apify.ts`
4. Check if the actor URL format has changed
5. Review Apify API documentation for any breaking changes
6. Test with a simple API call to verify APIFY_API_KEY is valid

**Current Actor ID:** Check `lib/scrapers/twitter-apify.ts` for current configuration

**Alternative:** Consider switching to a different Apify actor if current one is deprecated

**Current Status:** Returns 404, needs investigation

---

## Low Priority (Optional Enhancements)

### 4. Re-enable Bluesky Scraping (403 Forbidden)
**Impact:** Adds real-time MedSky community discussions  
**Estimated Time:** 1-2 hours  

**Current Issue:** All queries return 403 Forbidden

**Options:**
- **Option A: Official AT Protocol SDK**
  1. Install: `npm install @atproto/api`
  2. Create Bluesky account if needed
  3. Get API credentials
  4. Rewrite `lib/scrapers/bluesky.ts` using official SDK
  5. Add authentication

- **Option B: Add rate limiting**
  1. Increase delay between queries to 2-3 seconds
  2. Reduce number of queries from 6 to 3
  3. Add User-Agent header
  4. Test if 403 is due to rate limiting

**Current Status:** Temporarily disabled in `lib/scrapers/index.ts`

---

### 5. Fix Broken RSS Feeds
**Impact:** Minor - adds 2 more RSS sources  
**Estimated Time:** 15 minutes  

**Broken Feeds:**
- Fierce Healthcare: `https://www.fiercehealthcare.com/rss` (404)
- Becker's Hospital Review: `https://www.beckershospitalreview.com/rss.xml` (404)

**Steps:**
1. Visit website manually to find correct RSS feed URLs
2. Look for RSS icon or "Subscribe" link
3. Update URLs in `lib/scrapers/rss.ts`
4. Test feeds with: https://validator.w3.org/feed/

**Current Status:** Working RSS feeds provide sufficient coverage (Healthcare IT News, AJOG, MedPage Today)

---

## Testing After Fixes

After fixing any scraper, test with:

```powershell
# Test ingest endpoint
iwr "https://cio-perinatal-news.vercel.app/api/ingest" -Headers @{"Authorization" = "Bearer fc960d875a55eaae36f038fd74ef39b4bc34f0fe1fdf9b15845c17b075bf4e4a"} | Select-Object -ExpandProperty Content | ConvertFrom-Json

# Check itemsBySource to see if new sources are working
# Verify no new errors in the errors array
```

---

## Current Working Sources

✅ **RSS Feeds:**
- Healthcare IT News
- AJOG (Gray Journal)
- MedPage Today - OBGYN

✅ **NewsAPI:**
- Medical news outlets (Medscape, Healio, MedPage Today, AJMC, Becker's)

✅ **AI Analysis:**
- OpenAI GPT-4o-mini analyzing and scoring all items

✅ **Database:**
- Supabase storing items with score >= 4

---

## Notes
- All broken scrapers fail gracefully - the system continues to work
- Current configuration provides 20-40 items/day, mostly from RSS
- Cost remains under $10/month (mostly OpenAI)
- No urgent need to fix unless you want more diverse sources
