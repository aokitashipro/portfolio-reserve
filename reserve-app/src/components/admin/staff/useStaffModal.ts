'use client';

import { useState, useCallback } from 'react';
import type { Staff, StaffFormData, UseStaffModalReturn } from './types';

const INITIAL_FORM_DATA: StaffFormData = {
  name: '',
  email: '',
  phone: '',
  role: '',
};

/**
 * スタッフ管理モーダルの状態を管理するカスタムフック
 */
export function useStaffModal(): UseStaffModalReturn {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(INITIAL_FORM_DATA);

  const openAddModal = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setShowAddModal(true);
  }, []);

  const openEditModal = useCallback((staff: Staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      role: staff.role || '',
    });
    setShowEditModal(true);
  }, []);

  const openDeleteDialog = useCallback((staff: Staff) => {
    setSelectedStaff(staff);
    setShowDeleteDialog(true);
  }, []);

  const openShiftModal = useCallback((staff: Staff) => {
    setSelectedStaff(staff);
    setShowShiftModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteDialog(false);
    setShowShiftModal(false);
    setSelectedStaff(null);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  return {
    showAddModal,
    showEditModal,
    showDeleteDialog,
    showShiftModal,
    selectedStaff,
    formData,
    openAddModal,
    openEditModal,
    openDeleteDialog,
    openShiftModal,
    closeModals,
    setFormData,
  };
}
