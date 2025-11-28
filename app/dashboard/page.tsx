import { createAdminClient } from '@/lib/supabase/server';
import Dashboard from '@/components/Dashboard';
import LogoutButton from '@/components/LogoutButton';
import { Database } from '@/lib/supabase/database.types';

type NewsItem = Database['public']['Tables']['news_items']['Row'];

export default async function Home() {
  const supabase = createAdminClient();
  
  // Fetch recent news items (last 100)
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const newsItems = data as NewsItem[] | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CIO Perinatal News</h1>
              <p className="mt-2 text-sm text-gray-600">
                AI-curated medical news for Maternal-Fetal Medicine specialists
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-700">
                  {newsItems && newsItems.length > 0
                    ? new Date(newsItems[0].created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading news: {error.message}</p>
          </div>
        </div>
      )}

      <Dashboard initialNewsItems={newsItems || []} />
    </div>
  );
}
