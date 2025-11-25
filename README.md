# CIO Perinatal News

A private, cost-effective news aggregation dashboard (<$10/month) for Maternal-Fetal Medicine specialists. Automatically scrapes, filters, and scores medical news from Twitter/X, LinkedIn, Reddit, and medical news outlets.

## Features

- 🤖 **AI-Powered Filtering**: GPT-4o-mini analyzes and scores content relevance (0-10)
- 📊 **Smart Dashboard**: Clean UI with category filters and bookmarking
- 🔍 **Historical Search**: Full-text search across all collected articles
- 🔐 **Secure & Private**: Single-user authentication with Supabase Auth
- 💰 **Cost-Effective**: Designed to stay under $10/month using free tiers

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel (Free Hobby Tier)
- **Scheduling**: Vercel Cron Jobs

## Topics Tracked

1. **Medical Billing Automation** - Healthcare RCM, claims processing AI
2. **Gestational Diabetes** - GDM monitoring via CGM
3. **Preeclampsia Research** - Gestational hypertension, hyperemesis gravidarum

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your API keys:

```bash
cp .env.local.example .env.local
```

Required API keys:
- **Supabase**: Create a free project at [supabase.com](https://supabase.com)
- **OpenAI**: Get API key from [platform.openai.com](https://platform.openai.com)
- **NewsAPI**: Free developer key at [newsapi.org](https://newsapi.org)
- **Google CSE**: Create custom search engine at [programmablesearchengine.google.com](https://programmablesearchengine.google.com)
- **Apify**: Sign up at [apify.com](https://apify.com) for Twitter scraping

### 3. Set Up Supabase Database

Run the SQL migration in your Supabase project (see `supabase/migrations/` folder once created).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Vercel

```bash
npx vercel
```

Set environment variables in Vercel dashboard and enable cron jobs.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── ingest/       # Cron job endpoint
│   │   └── news/         # News CRUD endpoints
│   ├── archive/          # Historical archive page
│   ├── login/            # Authentication page
│   └── page.tsx          # Main dashboard
├── components/           # React components
├── config/               # Configuration files
│   └── topics.ts         # Search keywords and categories
├── lib/
│   ├── ai/               # OpenAI integration
│   ├── scrapers/         # Data collection modules
│   └── supabase/         # Database client
└── supabase/
    └── migrations/       # Database schema
```

## Cost Breakdown

| Service | Tier | Monthly Cost |
|---------|------|------------|
| Vercel | Hobby (Free) | $0.00 |
| Supabase | Free Tier | $0.00 |
| NewsAPI | Developer | $0.00 |
| Reddit API | Free | $0.00 |
| Google CSE | Free (100/day) | $0.00 |
| Apify | Pay-per-use | $2-5 |
| OpenAI | Pay-per-token | $3-5 |
| **Total** | | **$5-10** |

## Development Roadmap

- [x] Phase 1: Project foundation and setup
- [ ] Phase 2: Database schema and migrations
- [ ] Phase 3: Data ingestion layer (scrapers)
- [ ] Phase 4: AI enrichment layer
- [ ] Phase 5: API routes (backend)
- [ ] Phase 6: Frontend dashboard
- [ ] Phase 7: Authentication
- [ ] Phase 8: Deployment configuration
- [ ] Phase 9: Testing and refinement

## License

Private project - All rights reserved
