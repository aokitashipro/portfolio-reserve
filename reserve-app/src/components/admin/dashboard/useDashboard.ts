'use client';

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { DashboardStats } from './types';

interface UseDashboardReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * ダッシュボードのデータ取得を管理するカスタムフック
 */
export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // テスト環境では認証をスキップ
      const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH_IN_TEST === 'true';
      const headers: Record<string, string> = {};

      if (!skipAuth) {
        // セッションからアクセストークンを取得
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError('認証が必要です。再度ログインしてください。');
          return;
        }

        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/admin/stats', {
        headers,
      });
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        // エラーがオブジェクトの場合はメッセージを抽出
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || JSON.stringify(result.error)
            : result.error || 'データの取得に失敗しました';
        setError(errorMessage);
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats,
  };
}
