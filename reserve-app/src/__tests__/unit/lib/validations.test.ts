import {
  availableSlotsQuerySchema,
  createReservationSchema,
  updateReservationSchema,
  validateStatusTransition,
  canEditReservation,
  canDeleteReservation,
} from '@/lib/validations';

// 予約ステータスの型定義
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

// 全ステータスのリスト
const ALL_STATUSES: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];

describe('validations', () => {
  describe('availableSlotsQuerySchema', () => {
    it('should validate correct query parameters', () => {
      const validData = {
        date: '2026-01-20',
        menuId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = availableSlotsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with optional staffId', () => {
      const validData = {
        date: '2026-01-20',
        menuId: '123e4567-e89b-12d3-a456-426614174000',
        staffId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = availableSlotsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        date: '2026/01/20',
        menuId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = availableSlotsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid menuId UUID', () => {
      const invalidData = {
        date: '2026-01-20',
        menuId: 'not-a-uuid',
      };

      const result = availableSlotsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createReservationSchema', () => {
    it('should validate correct reservation data', () => {
      const validData = {
        menuId: '123e4567-e89b-12d3-a456-426614174000',
        staffId: '123e4567-e89b-12d3-a456-426614174001',
        reservedDate: '2026-12-31',
        reservedTime: '14:00',
        notes: 'Window seat preferred',
      };

      const result = createReservationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept reservation without notes', () => {
      const validData = {
        menuId: '123e4567-e89b-12d3-a456-426614174000',
        staffId: '123e4567-e89b-12d3-a456-426614174001',
        reservedDate: '2026-12-31',
        reservedTime: '14:00',
      };

      const result = createReservationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject past dates', () => {
      const invalidData = {
        menuId: '123e4567-e89b-12d3-a456-426614174000',
        staffId: '123e4567-e89b-12d3-a456-426614174001',
        reservedDate: '2020-01-01',
        reservedTime: '14:00',
      };

      const result = createReservationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const invalidData = {
        menuId: '123e4567-e89b-12d3-a456-426614174000',
        staffId: '123e4567-e89b-12d3-a456-426614174001',
        reservedDate: '2026-12-31',
        reservedTime: '2:00 PM',
      };

      const result = createReservationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject notes longer than 500 characters', () => {
      const invalidData = {
        menuId: '123e4567-e89b-12d3-a456-426614174000',
        staffId: '123e4567-e89b-12d3-a456-426614174001',
        reservedDate: '2026-12-31',
        reservedTime: '14:00',
        notes: 'a'.repeat(501),
      };

      const result = createReservationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid hour in time (>23)', () => {
      const invalidData = {
        menuId: '123e4567-e89b-12d3-a456-426614174000',
        staffId: '123e4567-e89b-12d3-a456-426614174001',
        reservedDate: '2026-12-31',
        reservedTime: '24:00',
      };

      const result = createReservationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateReservationSchema', () => {
    it('should validate partial update with menuId', () => {
      const validData = {
        menuId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = updateReservationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate multiple fields update', () => {
      const validData = {
        reservedDate: '2026-12-31',
        reservedTime: '15:00',
        notes: 'Updated notes',
      };

      const result = updateReservationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject past dates', () => {
      const invalidData = {
        reservedDate: '2020-01-01',
      };

      const result = updateReservationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept empty update (all fields optional)', () => {
      const result = updateReservationSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  /**
   * 不変条件テスト: validateStatusTransition
   * 予約ステータス遷移ルールの検証
   */
  describe('validateStatusTransition', () => {
    // 同じステータスへの遷移は許可
    describe('same status transitions (should be valid)', () => {
      it.each(ALL_STATUSES)('should allow %s → %s (same status)', (status) => {
        const result = validateStatusTransition(status, status);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    // 有効な遷移パターン
    describe('valid transitions', () => {
      it('should allow PENDING → CONFIRMED', () => {
        const result = validateStatusTransition('PENDING', 'CONFIRMED');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow CONFIRMED → COMPLETED', () => {
        const result = validateStatusTransition('CONFIRMED', 'COMPLETED');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow CONFIRMED → CANCELLED', () => {
        const result = validateStatusTransition('CONFIRMED', 'CANCELLED');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow CONFIRMED → NO_SHOW', () => {
        const result = validateStatusTransition('CONFIRMED', 'NO_SHOW');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    // 無効な遷移: COMPLETEDからの遷移
    describe('invalid transitions from COMPLETED', () => {
      it('should reject COMPLETED → PENDING', () => {
        const result = validateStatusTransition('COMPLETED', 'PENDING');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('完了済みの予約は保留状態に戻せません');
      });

      it('should reject COMPLETED → CONFIRMED', () => {
        const result = validateStatusTransition('COMPLETED', 'CONFIRMED');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('完了済みの予約は確定状態に戻せません');
      });

      it('should reject COMPLETED → CANCELLED', () => {
        const result = validateStatusTransition('COMPLETED', 'CANCELLED');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('完了済みの予約はキャンセルできません');
      });

      it('should reject COMPLETED → NO_SHOW', () => {
        const result = validateStatusTransition('COMPLETED', 'NO_SHOW');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('完了済みの予約のステータスは変更できません');
      });
    });

    // 無効な遷移: CANCELLEDからの遷移
    describe('invalid transitions from CANCELLED', () => {
      it('should reject CANCELLED → PENDING', () => {
        const result = validateStatusTransition('CANCELLED', 'PENDING');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('キャンセル済みの予約は保留状態に戻せません');
      });

      it('should reject CANCELLED → CONFIRMED', () => {
        const result = validateStatusTransition('CANCELLED', 'CONFIRMED');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('キャンセル済みの予約は確定状態に戻せません');
      });

      it('should reject CANCELLED → COMPLETED', () => {
        const result = validateStatusTransition('CANCELLED', 'COMPLETED');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('キャンセル済みの予約は完了状態にできません');
      });

      it('should reject CANCELLED → NO_SHOW', () => {
        const result = validateStatusTransition('CANCELLED', 'NO_SHOW');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('キャンセル済みの予約のステータスは変更できません');
      });
    });

    // 無効な遷移: NO_SHOWからの遷移
    describe('invalid transitions from NO_SHOW', () => {
      it('should reject NO_SHOW → PENDING', () => {
        const result = validateStatusTransition('NO_SHOW', 'PENDING');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('無断キャンセルの予約は保留状態に戻せません');
      });

      it('should reject NO_SHOW → CONFIRMED', () => {
        const result = validateStatusTransition('NO_SHOW', 'CONFIRMED');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('無断キャンセルの予約は確定状態に戻せません');
      });

      it('should reject NO_SHOW → COMPLETED', () => {
        const result = validateStatusTransition('NO_SHOW', 'COMPLETED');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('無断キャンセルの予約は完了状態にできません');
      });

      it('should reject NO_SHOW → CANCELLED', () => {
        const result = validateStatusTransition('NO_SHOW', 'CANCELLED');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('無断キャンセルの予約のステータスは変更できません');
      });
    });

    // 無効な遷移: PENDINGからの不正な遷移
    describe('invalid transitions from PENDING', () => {
      it('should reject PENDING → COMPLETED', () => {
        const result = validateStatusTransition('PENDING', 'COMPLETED');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('不正な状態遷移です');
      });

      it('should reject PENDING → CANCELLED', () => {
        const result = validateStatusTransition('PENDING', 'CANCELLED');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('不正な状態遷移です');
      });

      it('should reject PENDING → NO_SHOW', () => {
        const result = validateStatusTransition('PENDING', 'NO_SHOW');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('不正な状態遷移です');
      });
    });

    // 無効な遷移: CONFIRMEDからの不正な遷移
    describe('invalid transitions from CONFIRMED', () => {
      it('should reject CONFIRMED → PENDING', () => {
        const result = validateStatusTransition('CONFIRMED', 'PENDING');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('不正な状態遷移です');
      });
    });
  });

  /**
   * 不変条件テスト: canEditReservation
   * ステータスに応じた編集可否のチェック
   */
  describe('canEditReservation', () => {
    describe('editable statuses', () => {
      it('should allow editing PENDING reservations', () => {
        const result = canEditReservation('PENDING');
        expect(result.canEdit).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow editing CONFIRMED reservations', () => {
        const result = canEditReservation('CONFIRMED');
        expect(result.canEdit).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('non-editable statuses', () => {
      it('should reject editing COMPLETED reservations', () => {
        const result = canEditReservation('COMPLETED');
        expect(result.canEdit).toBe(false);
        expect(result.error).toBe('完了済みの予約は編集できません');
      });

      it('should reject editing CANCELLED reservations', () => {
        const result = canEditReservation('CANCELLED');
        expect(result.canEdit).toBe(false);
        expect(result.error).toBe('キャンセル済みの予約は編集できません');
      });

      it('should reject editing NO_SHOW reservations', () => {
        const result = canEditReservation('NO_SHOW');
        expect(result.canEdit).toBe(false);
        expect(result.error).toBe('無断キャンセルの予約は編集できません');
      });
    });
  });

  /**
   * 不変条件テスト: canDeleteReservation
   * ステータスに応じた削除可否のチェック
   */
  describe('canDeleteReservation', () => {
    describe('deletable statuses', () => {
      it('should allow deleting PENDING reservations', () => {
        const result = canDeleteReservation('PENDING');
        expect(result.canDelete).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow deleting CONFIRMED reservations', () => {
        const result = canDeleteReservation('CONFIRMED');
        expect(result.canDelete).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow deleting CANCELLED reservations', () => {
        const result = canDeleteReservation('CANCELLED');
        expect(result.canDelete).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow deleting NO_SHOW reservations', () => {
        const result = canDeleteReservation('NO_SHOW');
        expect(result.canDelete).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('non-deletable statuses', () => {
      it('should reject deleting COMPLETED reservations', () => {
        const result = canDeleteReservation('COMPLETED');
        expect(result.canDelete).toBe(false);
        expect(result.error).toBe('完了済みの予約は削除できません');
      });
    });
  });
});
