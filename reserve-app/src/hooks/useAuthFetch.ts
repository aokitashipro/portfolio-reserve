'use client';

import { useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

/**
 * 認証付きfetchを提供するカスタムフック
 * Supabaseセッションからアクセストークンを取得し、リクエストヘッダーに含める
 */
export function useAuthFetch() {
  const authFetch = useCallback(async (url: string, options?: RequestInit) => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('認証が必要です。再度ログインしてください。');
    }

    const headers = new Headers(options?.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);
    if (!headers.has('Content-Type') && options?.body) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }, []);

  return { authFetch };
}

/**
 * エラーメッセージを安全に抽出するヘルパー
 */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'エラーが発生しました';
}
