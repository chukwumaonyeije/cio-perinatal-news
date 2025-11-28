# Deployment Checklist

## ✅ Completed Steps
- [x] Frontend dashboard built with interactive filters
- [x] TypeScript build issues resolved
- [x] Deployed to Vercel production
- [x] Production URL: https://cio-perinatal-news-m35nuy073-chukwuma-onyeijes-projects.vercel.app

## 🔧 Required: Configure Environment Variables in Vercel

Visit: https://vercel.com/chukwuma-onyeijes-projects/cio-perinatal-news/settings/environment-variables

Add the following environment variables (copy from your `.env.local`):

### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
OPENAI_API_KEY=<your_openai_api_key>
NEWS_API_KEY=<your_newsapi_key>
GOOGLE_CSE_API_KEY=<your_google_cse_api_key>
GOOGLE_CSE_ID=<your_google_cse_id>
APIFY_API_KEY=<your_apify_api_key>
CRON_SECRET=fc960d875a55eaae36f038fd74ef39b4bc34f0fe1fdf9b15845c17b075bf4e4a
```

**Important:** Make sure to set these for the **Production** environment!

## 📝 After Setting Environment Variables

1. **Redeploy:** After adding all environment variables, trigger a new deployment:
   ```bash
   vercel --prod
   ```

2. **Test the API endpoint:**
   ```bash
   curl -X GET https://cio-perinatal-news-m35nuy073-chukwuma-onyeijes-projects.vercel.app/api/ingest \
     -H "Authorization: Bearer fc960d875a55eaae36f038fd74ef39b4bc34f0fe1fdf9b15845c17b075bf4e4a"
   ```

3. **Verify the dashboard** opens at:
   https://cio-perinatal-news-m35nuy073-chukwuma-onyeijes-projects.vercel.app

## 🤖 Cron Job Configuration

The cron job is already configured in `vercel.json`:
- Runs daily at 4:00 AM EST (9:00 AM UTC)
- Endpoint: `/api/ingest`
- Authorization: Uses `CRON_SECRET` environment variable

Vercel will automatically enable cron jobs once the environment variables are set.

## 🎯 What's New in the Dashboard

The deployed dashboard now features:
- **Interactive category filters** (All, Billing, GDM, Preeclampsia, Other)
- **Color-coded relevance scores** (green for 8+, yellow for 6-7, orange for 4-5)
- **Smart date formatting** (Today, Yesterday, X days ago)
- **Category badges** with distinct colors
- **Clean, responsive UI** using Tailwind CSS
- **"Last updated" timestamp** in the header

## 📊 Expected Data Flow

1. Vercel cron triggers `/api/ingest` daily at 4 AM
2. API scrapes NewsAPI, Reddit, LinkedIn, Twitter
3. OpenAI analyzes and scores each item (0-10)
4. Items with score ≥ 4 are stored in Supabase
5. Dashboard displays filtered news items with categories
