'use client';

import { useState, useCallback } from 'react';
import type { Reservation, UseReservationModalReturn } from './types';

/**
 * 予約モーダルの状態を管理するカスタムフック
 */
export function useReservationModal(): UseReservationModalReturn {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string>('');
  const [prefilledTime, setPrefilledTime] = useState<string>('');

  const openAddModal = useCallback((date?: string, time?: string) => {
    setPrefilledDate(date || '');
    setPrefilledTime(time || '');
    setShowAddModal(true);
  }, []);

  const openEditModal = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowEditModal(true);
  }, []);

  const openDeleteDialog = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDeleteDialog(true);
  }, []);

  const openDetailModal = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteDialog(false);
    setShowDetailModal(false);
    setSelectedReservation(null);
    setPrefilledDate('');
    setPrefilledTime('');
  }, []);

  const switchToEdit = useCallback(() => {
    setShowDetailModal(false);
    setShowEditModal(true);
  }, []);

  return {
    showAddModal,
    showEditModal,
    showDeleteDialog,
    showDetailModal,
    selectedReservation,
    prefilledDate,
    prefilledTime,
    openAddModal,
    openEditModal,
    openDeleteDialog,
    openDetailModal,
    closeModals,
    switchToEdit,
  };
}
