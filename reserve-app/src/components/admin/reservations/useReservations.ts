'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthFetch, extractErrorMessage } from '@/hooks/useAuthFetch';
import type { Reservation, ReservationFormData, UseReservationsReturn } from './types';

/**
 * 予約のCRUD操作を管理するカスタムフック
 */
export function useReservations(): UseReservationsReturn {
  const { authFetch } = useAuthFetch();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/admin/reservations');
      const result = await response.json();

      if (result.success) {
        setReservations(result.data?.data || []);
      } else {
        setError(extractErrorMessage(result.error) || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ネットワークエラーが発生しました');
      console.error('Reservations fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const addReservation = useCallback(async (formData: ReservationFormData): Promise<boolean> => {
    try {
      if (!formData.customer || !formData.menu || !formData.staff || !formData.date || !formData.time) {
        setError('必須項目を入力してください');
        return false;
      }

      const response = await authFetch('/api/admin/reservations', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('予約を追加しました');
        await fetchReservations();
        return true;
      } else {
        setError(extractErrorMessage(result.error) || '予約の追加に失敗しました');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      return false;
    }
  }, [authFetch, fetchReservations]);

  const editReservation = useCallback(async (id: string, formData: ReservationFormData): Promise<boolean> => {
    try {
      const response = await authFetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('予約を更新しました');
        await fetchReservations();
        return true;
      } else {
        setError(extractErrorMessage(result.error) || '予約の更新に失敗しました');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      return false;
    }
  }, [authFetch, fetchReservations]);

  const deleteReservation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await authFetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('予約を削除しました');
        await fetchReservations();
        return true;
      } else {
        setError(extractErrorMessage(result.error) || '予約の削除に失敗しました');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      return false;
    }
  }, [authFetch, fetchReservations]);

  return {
    reservations,
    loading,
    error,
    successMessage,
    fetchReservations,
    addReservation,
    editReservation,
    deleteReservation,
    clearError,
    clearSuccessMessage,
  };
}
