'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  AddStaffModal,
  EditStaffModal,
  DeleteStaffDialog,
  ShiftSettingModal,
  StaffSearchBar,
  StaffList,
  StaffPageHeader,
  StaffPageMessages,
  useStaff,
  useStaffModal,
  useShiftVacation,
} from '@/components/admin/staff';

export default function AdminStaffPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // カスタムフック
  const {
    staff,
    loading,
    error: staffError,
    successMessage: staffSuccessMessage,
    addStaff,
    editStaff,
    deleteStaff,
  } = useStaff(searchQuery);

  const {
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
  } = useStaffModal();

  const {
    shiftFormData,
    vacationFormData,
    activeTab,
    initializeShiftData,
    submitShift,
    submitVacation,
    setActiveTab,
    setShiftFormData,
    setVacationFormData,
    resetShiftVacation,
    error: shiftError,
    successMessage: shiftSuccessMessage,
  } = useShiftVacation();

  // エラー・成功メッセージを統合
  const error = staffError || shiftError;
  const successMessage = staffSuccessMessage || shiftSuccessMessage;

  // シフトモーダルを開く
  const handleShiftSetting = async (staffMember: typeof selectedStaff) => {
    if (!staffMember) return;
    openShiftModal(staffMember);
    await initializeShiftData(staffMember);
  };

  // モーダルを閉じる（シフトリセット含む）
  const handleCloseModals = () => {
    closeModals();
    resetShiftVacation();
  };

  // シフト送信
  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    const success = await submitShift(selectedStaff.id);
    if (success) handleCloseModals();
  };

  // 休暇送信
  const handleVacationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    const success = await submitVacation(selectedStaff.id);
    if (success) handleCloseModals();
  };

  // スタッフ追加送信
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addStaff(formData);
    if (success) handleCloseModals();
  };

  // スタッフ編集送信
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    const success = await editStaff(selectedStaff.id, formData);
    if (success) handleCloseModals();
  };

  // スタッフ削除確認
  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;
    const success = await deleteStaff(selectedStaff.id);
    if (success) handleCloseModals();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="flex h-96 items-center justify-center">
            <div data-testid="loading-message" className="text-gray-500">読み込み中...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-64 flex-1 p-8">
        <StaffPageHeader onAddClick={openAddModal} />
        <StaffPageMessages successMessage={successMessage} error={error} />
        <StaffSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <StaffList
          staff={staff}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
          onShiftSetting={handleShiftSetting}
        />
      </main>

      {/* モーダル */}
      {showAddModal && (
        <AddStaffModal
          formData={formData}
          error={error}
          onFormChange={setFormData}
          onSubmit={handleAddSubmit}
          onClose={handleCloseModals}
        />
      )}

      {showEditModal && selectedStaff && (
        <EditStaffModal
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleEditSubmit}
          onClose={handleCloseModals}
        />
      )}

      {showDeleteDialog && selectedStaff && (
        <DeleteStaffDialog
          staff={selectedStaff}
          onConfirm={handleDeleteConfirm}
          onClose={handleCloseModals}
        />
      )}

      {showShiftModal && selectedStaff && (
        <ShiftSettingModal
          staff={selectedStaff}
          activeTab={activeTab}
          shiftFormData={shiftFormData}
          vacationFormData={vacationFormData}
          error={shiftError}
          onTabChange={setActiveTab}
          onShiftFormChange={setShiftFormData}
          onVacationFormChange={setVacationFormData}
          onShiftSubmit={handleShiftSubmit}
          onVacationSubmit={handleVacationSubmit}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
}
