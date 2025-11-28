'use client';

interface FilterBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  counts: {
    all: number;
    billing: number;
    gdm: number;
    preeclampsia: number;
    other: number;
  };
}

export default function FilterBar({ selectedCategory, onCategoryChange, counts }: FilterBarProps) {
  const categories = [
    { id: 'all', label: 'All', count: counts.all, color: 'blue' },
    { id: 'billing', label: 'Billing', count: counts.billing, color: 'purple' },
    { id: 'gdm', label: 'GDM', count: counts.gdm, color: 'blue' },
    { id: 'preeclampsia', label: 'Preeclampsia', count: counts.preeclampsia, color: 'red' },
    { id: 'other', label: 'Other', count: counts.other, color: 'gray' },
  ];

  const getButtonClasses = (categoryId: string, color: string) => {
    const isSelected = selectedCategory === categoryId;
    
    if (isSelected) {
      const colorMap: Record<string, string> = {
        blue: 'bg-blue-600 text-white border-blue-600',
        purple: 'bg-purple-600 text-white border-purple-600',
        red: 'bg-red-600 text-white border-red-600',
        gray: 'bg-gray-600 text-white border-gray-600',
      };
      return colorMap[color] || colorMap.blue;
    }

    return 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${getButtonClasses(
            category.id,
            category.color
          )}`}
        >
          {category.label} ({category.count})
        </button>
      ))}
    </div>
  );
}
