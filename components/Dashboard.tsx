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
  bookmarked: boolean;
}

interface DashboardProps {
  initialNewsItems: NewsItem[];
}

export default function Dashboard({ initialNewsItems }: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NewsItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const filteredNews = useMemo(() => {
    const items = searchResults !== null ? searchResults : initialNewsItems;
    
    if (selectedCategory === 'all') return items;
    if (selectedCategory === 'starred') return items.filter((item) => item.bookmarked);
    return items.filter((item) => item.category === selectedCategory);
  }, [initialNewsItems, searchResults, selectedCategory]);

  const counts = useMemo(() => {
    const items = searchResults !== null ? searchResults : initialNewsItems;
    const starredCount = items.filter(item => item.bookmarked).length;
    
    const categoryCounts = items.reduce(
      (acc, item) => {
        acc[item.category as keyof typeof acc] = (acc[item.category as keyof typeof acc] || 0) + 1;
        return acc;
      },
      { all: items.length, billing: 0, gdm: 0, preeclampsia: 0, other: 0, starred: starredCount }
    );
    return categoryCounts;
  }, [initialNewsItems, searchResults]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {initialNewsItems.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">No news items yet</h2>
          <p className="text-blue-700">
            The system will automatically collect and analyze news every 6 hours.
          </p>
          <p className="text-blue-600 text-sm mt-2">
            Or manually trigger the ingestion at <code className="bg-blue-100 px-2 py-1 rounded">/api/ingest</code>
          </p>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles by title, content, or summary..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {isSearching && (
                <div className="absolute right-12 top-4 text-gray-400">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>
            {searchResults !== null && (
              <p className="mt-2 text-sm text-gray-600">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}
          </div>

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
