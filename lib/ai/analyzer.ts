import OpenAI from 'openai';
import { ScrapedItem, EnrichedItem } from '../scrapers/types';
import { TopicCategory, categorizeTopic } from '@/config/topics';

let openai: OpenAI;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

interface AnalysisResult {
  relevanceScore: number;
  category: TopicCategory;
  summary: string;
}

const SYSTEM_PROMPT = `You are an expert Maternal-Fetal Medicine (MFM) research assistant analyzing medical news for a practicing MFM specialist who is also a healthcare technology developer.

Your task is to evaluate content relevance across three key areas:

1. **Revenue Cycle Management (RCM) & Billing Automation** - Focus on AUTOMATION and TECHNOLOGY:
   - AI-powered autonomous coding and claims processing
   - Denial management and predictive revenue analytics
   - Prior authorization automation
   - Payer policy changes affecting reimbursement
   - Healthcare IT solutions for revenue integrity
   - NOTE: Generic billing job postings or manual billing processes score LOW (0-3)
   - High scores (7+) require focus on automation, AI, or breakthrough technology

2. **Gestational Diabetes (GDM)** - CGM monitoring in pregnancy, glucose management, FDA approvals, reimbursement for CGM in pregnancy

3. **High-Risk Pregnancy Research**:
   - Preeclampsia: New biomarkers, prevention (aspirin/statins), long-term CV risks
   - Hyperemesis Gravidarum (HG): New treatments, genetic research
   - Gestational Hypertension: Chronic HTN management in pregnancy

For each piece of content:
- Rate relevance from 0-10 (0=irrelevant, 10=critical/groundbreaking)
- Categorize as: "billing", "gdm", "preeclampsia", or "other"
- Provide a 2-sentence summary focused on clinical or business impact for an MFM specialist

Scoring guidelines:
- 9-10: Breakthrough research, major policy changes, game-changing technology
- 7-8: Significant new findings, important updates, highly relevant to MFM practice OR tech development
- 4-6: Moderately relevant, worth knowing about
- 0-3: Tangentially related, not relevant, or generic content without innovation

Respond ONLY with valid JSON in this exact format:
{
  "score": number,
  "category": "billing" | "gdm" | "preeclampsia" | "other",
  "summary": "Two sentences maximum."
}`;

/**
 * Analyze a single scraped item using OpenAI
 */
export async function analyzeItem(item: ScrapedItem): Promise<EnrichedItem | null> {
  try {
    const userPrompt = `Title: ${item.title}\n\nContent: ${item.content.slice(0, 1000)}`; // Limit to 1000 chars to save tokens

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for consistent scoring
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      console.error('No response from OpenAI for:', item.url);
      return null;
    }

    const analysis: AnalysisResult = JSON.parse(response);

    // Validate the response
    if (
      typeof analysis.relevanceScore !== 'number' ||
      !analysis.category ||
      !analysis.summary
    ) {
      console.error('Invalid analysis result for:', item.url);
      return null;
    }

    // Create enriched item
    const enrichedItem: EnrichedItem = {
      ...item,
      aiSummary: analysis.summary,
      relevanceScore: Math.max(0, Math.min(10, Math.round(analysis.relevanceScore))), // Ensure 0-10 range
      category: analysis.category,
    };

    return enrichedItem;
  } catch (error) {
    console.error(`Error analyzing item ${item.url}:`, error);
    return null;
  }
}

/**
 * Analyze multiple items in parallel with rate limiting
 */
export async function analyzeItems(
  items: ScrapedItem[],
  options: {
    batchSize?: number;
    delayMs?: number;
  } = {}
): Promise<EnrichedItem[]> {
  const { batchSize = 5, delayMs = 1000 } = options;
  const enrichedItems: EnrichedItem[] = [];

  console.log(`Starting AI analysis of ${items.length} items...`);

  // Process in batches to avoid rate limits
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(item => analyzeItem(item))
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value !== null) {
        enrichedItems.push(result.value);
      }
    }

    console.log(`Analyzed ${Math.min(i + batchSize, items.length)}/${items.length} items`);

    // Delay between batches to respect rate limits
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log(`AI analysis complete: ${enrichedItems.length}/${items.length} successfully analyzed`);

  return enrichedItems;
}

/**
 * Get estimated token usage for cost tracking
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}
