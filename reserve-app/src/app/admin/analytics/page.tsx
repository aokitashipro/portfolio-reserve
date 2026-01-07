'use client';

import AdminSidebar from '@/components/AdminSidebar';
import {
  SummaryCards,
  ReservationTrendsChart,
  RepeatRateAnalysis,
  RepeatRateTrendChart,
  useAnalytics,
} from '@/components/admin/analytics';

export default function AnalyticsPage() {
  const {
    data,
    loading,
    error,
    activePeriodTab,
    setActivePeriodTab,
    getTrendsData,
    hasData,
  } = useAnalytics();

  // ローディング状態
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="flex h-96 items-center justify-center">
            <div data-testid="loading-message" className="text-gray-500">
              読み込み中...
            </div>
          </div>
        </main>
      </div>
    );
  }

  // エラー状態
  if (error || !data) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 flex-1 p-8">
          <div data-testid="error-message" className="rounded-lg bg-red-50 p-4 text-red-800">
            {error || 'データの取得に失敗しました'}
          </div>
        </main>
      </div>
    );
  }

  // データが空の場合
  if (!hasData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 flex-1 p-8">
          <h1 data-testid="analytics-title" className="mb-6 text-3xl font-bold text-gray-900">
            分析レポート
          </h1>
          <div
            data-testid="no-data-message"
            className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center"
          >
            <p className="text-gray-500">データがありません</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-64 flex-1 p-8">
        {/* ページタイトル */}
        <h1 data-testid="analytics-title" className="mb-8 text-3xl font-bold text-gray-900">
          分析レポート
        </h1>

        {/* サマリーカード */}
        <SummaryCards repeatRate={data.repeatRate} />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 予約推移グラフ */}
          <ReservationTrendsChart
            trendsData={getTrendsData()}
            activePeriodTab={activePeriodTab}
            onTabChange={setActivePeriodTab}
          />

          {/* リピート率分析 */}
          <RepeatRateAnalysis repeatRate={data.repeatRate} />

          {/* リピート率推移グラフ */}
          <RepeatRateTrendChart monthlyTrends={data.repeatRate.monthlyTrends} />
        </div>
      </main>
    </div>
  );
}
