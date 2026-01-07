/**
 * ダッシュボードで使用する型定義と定数
 */

export interface Reservation {
  id: string;
  time: string;
  customer: string;
  menu: string;
  staff: string;
  status: string;
}

export interface WeeklyStat {
  date: string;
  day: string;
  count: number;
}

export interface DashboardStats {
  todayReservations: number;
  monthlyReservations: number;
  monthlyRevenue: number;
  repeatRate: number;
  todayReservationsList: Reservation[];
  weeklyStats: WeeklyStat[];
}

export interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
  testId: string;
}

export interface StaffStatus {
  name: string;
  status: string;
  available: boolean;
}

export interface Activity {
  action: string;
  time: string;
  icon: string;
}

// ステータスバッジのスタイル
export const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

// ステータスラベル
export const STATUS_LABELS: Record<string, string> = {
  confirmed: '確定',
  pending: '保留',
  cancelled: 'キャンセル',
};

// 統計カードを生成するヘルパー関数
export function createStatsCards(stats: DashboardStats): StatCard[] {
  return [
    {
      label: '本日の予約',
      value: `${stats.todayReservations}件`,
      change: '+3',
      trend: 'up',
      color: 'blue',
      testId: 'stat-today-reservations',
    },
    {
      label: '今月の予約',
      value: `${stats.monthlyReservations}件`,
      change: '+15%',
      trend: 'up',
      color: 'green',
      testId: 'stat-monthly-reservations',
    },
    {
      label: '今月の売上',
      value: `¥${stats.monthlyRevenue.toLocaleString()}`,
      change: '+8%',
      trend: 'up',
      color: 'orange',
      testId: 'stat-monthly-revenue',
    },
    {
      label: 'リピート率',
      value: `${stats.repeatRate}%`,
      change: '+2%',
      trend: 'up',
      color: 'purple',
      testId: 'stat-repeat-rate',
    },
  ];
}

// ステータスバッジのスタイルを取得
export function getStatusStyles(status: string): { className: string; label: string } {
  return {
    className: STATUS_STYLES[status] || 'bg-gray-100 text-gray-800',
    label: STATUS_LABELS[status] || status,
  };
}

// ハードコードされたスタッフデータ
export const STAFF_DATA: StaffStatus[] = [
  { name: '田中 太郎', status: '勤務中', available: true },
  { name: '佐藤 花子', status: '勤務中', available: true },
  { name: '鈴木 一郎', status: '休憩中', available: false },
];

// ハードコードされた活動データ
export const ACTIVITY_DATA: Activity[] = [
  { action: '新規予約', time: '5分前', icon: '📅' },
  { action: '予約変更', time: '15分前', icon: '✏️' },
  { action: '新規顧客登録', time: '1時間前', icon: '👤' },
];
