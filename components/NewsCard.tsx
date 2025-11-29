'use client';

import { useState } from 'react';

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

interface NewsCardProps {
  item: NewsItem;
  onBookmarkUpdate?: (itemId: string, bookmarked: boolean) => void;
}

export default function NewsCard({ item, onBookmarkUpdate }: NewsCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(item.bookmarked);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBookmarkToggle = async () => {
    if (isUpdating) return;
    
    const newBookmarkedState = !isBookmarked;
    
    // Optimistic update
    setIsBookmarked(newBookmarkedState);
    setIsUpdating(true);
    
    // Notify parent component immediately
    if (onBookmarkUpdate) {
      onBookmarkUpdate(item.id, newBookmarkedState);
    }

    try {
      const response = await fetch('/api/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, bookmarked: newBookmarkedState }),
      });

      if (!response.ok) {
        // Revert on error
        setIsBookmarked(isBookmarked);
        if (onBookmarkUpdate) {
          onBookmarkUpdate(item.id, isBookmarked);
        }
        console.error('Failed to update bookmark');
      }
    } catch (error) {
      // Revert on error
      setIsBookmarked(isBookmarked);
      if (onBookmarkUpdate) {
        onBookmarkUpdate(item.id, isBookmarked);
      }
      console.error('Error updating bookmark:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'billing':
        return 'bg-purple-100 text-purple-800';
      case 'gdm':
        return 'bg-blue-100 text-blue-800';
      case 'preeclampsia':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-xl font-semibold text-gray-900 flex-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            {item.title}
          </a>
        </h2>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleBookmarkToggle}
            disabled={isUpdating}
            className="text-2xl hover:scale-110 transition-transform disabled:opacity-50"
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
          >
            {isBookmarked ? '⭐' : '☆'}
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(item.relevance_score)}`}>
            {item.relevance_score}/10
          </span>
        </div>
      </div>

      {item.ai_summary && (
        <p className="text-gray-700 mb-4 leading-relaxed">{item.ai_summary}</p>
      )}

      <div className="flex items-center gap-3 text-sm">
        <span className="font-medium text-blue-600">{item.source}</span>
        <span className="text-gray-400">•</span>
        <span className={`capitalize px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
          {item.category}
        </span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500">{formatDate(item.published_at)}</span>
      </div>
    </article>
  );
}
