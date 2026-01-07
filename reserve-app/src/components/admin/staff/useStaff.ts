'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Staff, StaffFormData, UseStaffReturn } from './types';

/**
 * スタッフのCRUD操作を管理するカスタムフック
 */
export function useStaff(searchQuery: string = ''): UseStaffReturn {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  // メッセージ自動クリア
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(clearMessages, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, clearMessages]);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/api/admin/staff?search=${encodeURIComponent(searchQuery)}`
        : '/api/admin/staff';

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setStaff(result.data);
        setError(null);
      } else {
        setError(result.error?.message || result.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Staff fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const addStaff = useCallback(async (data: StaffFormData): Promise<boolean> => {
    try {
      if (!data.name || !data.email) {
        setError('名前とメールアドレスは必須です');
        return false;
      }

      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('スタッフを追加しました');
        await fetchStaff();
        return true;
      } else {
        setError(result.error?.message || result.error || 'スタッフの追加に失敗しました');
        return false;
      }
    } catch (err) {
      setError('スタッフの追加に失敗しました');
      console.error('Add staff error:', err);
      return false;
    }
  }, [fetchStaff]);

  const editStaff = useCallback(async (id: string, data: StaffFormData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('スタッフ情報を更新しました');
        await fetchStaff();
        return true;
      } else {
        setError(result.error?.message || result.error || 'スタッフ情報の更新に失敗しました');
        return false;
      }
    } catch (err) {
      setError('スタッフ情報の更新に失敗しました');
      console.error('Edit staff error:', err);
      return false;
    }
  }, [fetchStaff]);

  const deleteStaff = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('スタッフを削除しました');
        await fetchStaff();
        return true;
      } else {
        setError(result.error?.message || result.error || 'スタッフの削除に失敗しました');
        return false;
      }
    } catch (err) {
      setError('スタッフの削除に失敗しました');
      console.error('Delete staff error:', err);
      return false;
    }
  }, [fetchStaff]);

  return {
    staff,
    loading,
    error,
    successMessage,
    fetchStaff,
    addStaff,
    editStaff,
    deleteStaff,
    clearMessages,
  };
}
