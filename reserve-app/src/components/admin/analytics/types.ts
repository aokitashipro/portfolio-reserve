/**
 * 分析レポートで使用する型定義
 */

export interface ReservationTrends {
  daily: Array<{ date: string; count: number }>;
  weekly: Array<{ week: string; count: number }>;
  monthly: Array<{ month: string; count: number }>;
}

export interface RepeatRate {
  overall: number;
  newCustomers: number;
  repeatCustomers: number;
  monthlyTrends: Array<{ month: string; rate: number }>;
}

export interface AnalyticsData {
  reservationTrends: ReservationTrends;
  repeatRate: RepeatRate;
}

export type PeriodTab = 'daily' | 'weekly' | 'monthly';

export interface PieChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

// 期間タブに応じたデータキーを取得
export function getDataKeyForPeriod(periodTab: PeriodTab): string {
  switch (periodTab) {
    case 'daily':
      return 'date';
    case 'weekly':
      return 'week';
    case 'monthly':
      return 'month';
  }
}

// 円グラフ用データを生成
export function createPieChartData(repeatRate: RepeatRate): PieChartData[] {
  return [
    { name: '新規顧客', value: repeatRate.newCustomers, color: '#3B82F6' },
    { name: 'リピーター', value: repeatRate.repeatCustomers, color: '#10B981' },
  ];
}
