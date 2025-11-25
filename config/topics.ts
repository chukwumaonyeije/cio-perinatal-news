export type TopicCategory = 'billing' | 'gdm' | 'preeclampsia' | 'other';

export interface TopicConfig {
  category: TopicCategory;
  keywords: string[];
  description: string;
}

export const TOPICS: TopicConfig[] = [
  {
    category: 'billing',
    keywords: [
      'medical billing automation',
      'healthcare RCM',
      'revenue cycle management',
      'claims processing AI',
      'medical coding automation',
      'healthcare billing software',
      'insurance claims automation',
      'medical practice management',
    ],
    description: 'Medical billing automation and revenue cycle management',
  },
  {
    category: 'gdm',
    keywords: [
      'gestational diabetes',
      'GDM',
      'CGM pregnancy',
      'continuous glucose monitoring pregnancy',
      'diabetes in pregnancy',
      'glucose monitoring gestational',
      'prenatal diabetes',
    ],
    description: 'Gestational Diabetes Mellitus and CGM monitoring',
  },
  {
    category: 'preeclampsia',
    keywords: [
      'preeclampsia',
      'pre-eclampsia',
      'gestational hypertension',
      'pregnancy induced hypertension',
      'hyperemesis gravidarum',
      'HG pregnancy',
      'severe morning sickness',
      'eclampsia',
      'HELLP syndrome',
    ],
    description: 'Preeclampsia, gestational hypertension, and hyperemesis gravidarum research',
  },
];

// Combine all keywords for broad searches
export const ALL_KEYWORDS = TOPICS.flatMap(topic => topic.keywords);

// Helper function to determine category from keywords
export function categorizeTopic(text: string): TopicCategory {
  const lowerText = text.toLowerCase();
  
  for (const topic of TOPICS) {
    const hasMatch = topic.keywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    if (hasMatch) {
      return topic.category;
    }
  }
  
  return 'other';
}
