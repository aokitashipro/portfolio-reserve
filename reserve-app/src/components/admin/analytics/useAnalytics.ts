'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { AnalyticsData, PeriodTab, ReservationTrends } from './types';

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  activePeriodTab: PeriodTab;
  setActivePeriodTab: (tab: PeriodTab) => void;
  getTrendsData: () => ReservationTrends['daily'] | ReservationTrends['weekly'] | ReservationTrends['monthly'];
  hasData: boolean;
  refetch: () => Promise<void>;
}

/**
 * 分析データの取得を管理するカスタムフック
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePeriodTab, setActivePeriodTab] = useState<PeriodTab>('monthly');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/analytics');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Analytics data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // 期間タブに応じたデータを取得
  const getTrendsData = useCallback(() => {
    if (!data) return [];
    switch (activePeriodTab) {
      case 'daily':
        return data.reservationTrends.daily;
      case 'weekly':
        return data.reservationTrends.weekly;
      case 'monthly':
        return data.reservationTrends.monthly;
      default:
        return data.reservationTrends.monthly;
    }
  }, [data, activePeriodTab]);

  // データが存在するかチェック
  const hasData = useMemo(() => {
    if (!data) return false;
    return (
      data.reservationTrends.daily.length > 0 ||
      data.reservationTrends.weekly.length > 0 ||
      data.reservationTrends.monthly.length > 0
    );
  }, [data]);

  return {
    data,
    loading,
    error,
    activePeriodTab,
    setActivePeriodTab,
    getTrendsData,
    hasData,
    refetch: fetchAnalyticsData,
  };
}
