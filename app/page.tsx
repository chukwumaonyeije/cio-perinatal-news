import { createClient } from '@/lib/supabase/client';

export default async function Home() {
  const supabase = createClient();
  
  // Fetch recent news items
  const { data: newsItems, error } = await supabase
    .from('news_items')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">CIO Perinatal News</h1>
          <p className="mt-2 text-sm text-gray-600">
            AI-curated medical news for Maternal-Fetal Medicine specialists
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error loading news: {error.message}</p>
          </div>
        )}

        {!newsItems || newsItems.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              No news items yet
            </h2>
            <p className="text-blue-700">
              The system will automatically collect and analyze news daily at 4:00 AM EST.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                All ({newsItems.length})
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                Billing
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                GDM
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                Preeclampsia
              </span>
            </div>

            {newsItems.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
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
                  <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {item.relevance_score}/10
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{item.summary}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-medium text-blue-600">{item.source}</span>
                  <span>•</span>
                  <span className="capitalize">{item.category}</span>
                  <span>•</span>
                  <span>{new Date(item.published_at).toLocaleDateString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
