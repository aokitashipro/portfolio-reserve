'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import {
  DashboardStatsGrid,
  TodayReservationsList,
  WeeklyStatsChart,
  QuickActionsCard,
  StaffStatusCard,
  RecentActivityCard,
  AnalyticsReportSection,
  useDashboard,
} from '@/components/admin/dashboard';

export default function AdminDashboard() {
  // 機能フラグを取得
  const { flags: featureFlags } = useFeatureFlags();
  const { stats, loading, error } = useDashboard();

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

  if (error || !stats) {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-64 flex-1 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600">2025年1月15日（水）</p>
        </div>

        {/* Stats Grid */}
        <DashboardStatsGrid stats={stats} />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Today's Reservations & Weekly Chart */}
          <div className="lg:col-span-2">
            <TodayReservationsList reservations={stats.todayReservationsList} />
            <WeeklyStatsChart weeklyStats={stats.weeklyStats} />
          </div>

          {/* Right Column: Quick Actions, Staff Status, Recent Activity */}
          <div className="space-y-6">
            <QuickActionsCard />
            <StaffStatusCard />
            <RecentActivityCard />
          </div>
        </div>

        {/* Analytics Report Section (controlled by feature flag) */}
        {featureFlags?.enableAnalyticsReport && <AnalyticsReportSection stats={stats} />}
      </main>
    </div>
  );
}
