'use client';

import { useState, useMemo } from 'react';
import NewsCard from './NewsCard';
import FilterBar from './FilterBar';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  ai_summary: string | null;
  source: string;
  category: string;
  relevance_score: number;
  published_at: string | null;
}

interface DashboardProps {
  initialNewsItems: NewsItem[];
}

export default function Dashboard({ initialNewsItems }: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredNews = useMemo(() => {
    if (selectedCategory === 'all') return initialNewsItems;
    return initialNewsItems.filter((item) => item.category === selectedCategory);
  }, [initialNewsItems, selectedCategory]);

  const counts = useMemo(() => {
    const categoryCounts = initialNewsItems.reduce(
      (acc, item) => {
        acc[item.category as keyof typeof acc] = (acc[item.category as keyof typeof acc] || 0) + 1;
        return acc;
      },
      { all: initialNewsItems.length, billing: 0, gdm: 0, preeclampsia: 0, other: 0 }
    );
    return categoryCounts;
  }, [initialNewsItems]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {initialNewsItems.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">No news items yet</h2>
          <p className="text-blue-700">
            The system will automatically collect and analyze news daily at 4:00 AM EST.
          </p>
          <p className="text-blue-600 text-sm mt-2">
            Or manually trigger the ingestion at <code className="bg-blue-100 px-2 py-1 rounded">/api/ingest</code>
          </p>
        </div>
      ) : (
        <>
          <FilterBar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            counts={counts}
          />

          {filteredNews.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No items in this category</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
