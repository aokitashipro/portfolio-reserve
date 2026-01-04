/**
 * Property-Based Testing for validations
 *
 * このテストファイルは、fast-checkを使用して
 * バリデーション関数の境界条件を網羅的にテストします。
 *
 * 参考: documents/development/AI時代の品質担保設計_OversightFatigue対策.md
 */

import * as fc from 'fast-check';
import {
  availableSlotsQuerySchema,
  createReservationSchema,
  registerSchema,
} from '@/lib/validations';

describe('Property-Based Testing: validations', () => {
  /**
   * 日付バリデーションのProperty-Based Testing
   */
  describe('Date validation properties', () => {
    // 有効な日付形式 (YYYY-MM-DD) のArbitrary
    const validDateArbitrary = fc
      .tuple(
        fc.integer({ min: 2026, max: 2030 }), // 未来の年
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }) // 28日までなら全ての月で有効
      )
      .map(([year, month, day]) => {
        const m = month.toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        return `${year}-${m}-${d}`;
      });

    // 無効な日付形式のArbitrary
    const invalidDateFormatArbitrary = fc.oneof(
      // スラッシュ区切り
      fc.tuple(
        fc.integer({ min: 2026, max: 2030 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 })
      ).map(([y, m, d]) => `${y}/${m}/${d}`),
      // 日付なしの文字列
      fc.string({ minLength: 1, maxLength: 10 }).filter(s => !/^\d{4}-\d{2}-\d{2}$/.test(s)),
      // 空文字列
      fc.constant('')
    );

    it('should accept any valid YYYY-MM-DD format for future dates', () => {
      fc.assert(
        fc.property(validDateArbitrary, (date) => {
          const result = availableSlotsQuerySchema.safeParse({
            date,
            menuId: '123e4567-e89b-12d3-a456-426614174000',
          });
          return result.success === true;
        }),
        { numRuns: 50 }
      );
    });

    it('should reject any invalid date format', () => {
      fc.assert(
        fc.property(invalidDateFormatArbitrary, (date) => {
          const result = availableSlotsQuerySchema.safeParse({
            date,
            menuId: '123e4567-e89b-12d3-a456-426614174000',
          });
          return result.success === false;
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * 時刻バリデーションのProperty-Based Testing
   */
  describe('Time validation properties', () => {
    // 有効な時刻形式 (HH:mm) のArbitrary
    const validTimeArbitrary = fc
      .tuple(
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 59 })
      )
      .map(([hour, minute]) => {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        return `${h}:${m}`;
      });

    // 無効な時刻形式のArbitrary
    const invalidTimeFormatArbitrary = fc.oneof(
      // 24時以上
      fc.integer({ min: 24, max: 99 }).map(h => `${h}:00`),
      // 60分以上
      fc.integer({ min: 60, max: 99 }).map(m => `12:${m}`),
      // AM/PM形式
      fc.integer({ min: 1, max: 12 }).map(h => `${h}:00 PM`),
      // 区切り文字なし
      fc.tuple(
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 59 })
      ).map(([h, m]) => `${h}${m}`)
    );

    it('should accept any valid HH:mm format', () => {
      fc.assert(
        fc.property(validTimeArbitrary, (time) => {
          const result = createReservationSchema.safeParse({
            menuId: '123e4567-e89b-12d3-a456-426614174000',
            reservedDate: '2026-12-31',
            reservedTime: time,
          });
          return result.success === true;
        }),
        { numRuns: 50 }
      );
    });

    it('should reject any invalid time format', () => {
      fc.assert(
        fc.property(invalidTimeFormatArbitrary, (time) => {
          const result = createReservationSchema.safeParse({
            menuId: '123e4567-e89b-12d3-a456-426614174000',
            reservedDate: '2026-12-31',
            reservedTime: time,
          });
          return result.success === false;
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * 文字列長バリデーションのProperty-Based Testing (notes)
   */
  describe('String length validation properties (notes)', () => {
    // 有効な長さの文字列 (0-500文字)
    const validNotesArbitrary = fc.string({ minLength: 0, maxLength: 500 });

    // 無効な長さの文字列 (501文字以上)
    const invalidNotesArbitrary = fc.string({ minLength: 501, maxLength: 600 });

    it('should accept notes up to 500 characters', () => {
      fc.assert(
        fc.property(validNotesArbitrary, (notes) => {
          const result = createReservationSchema.safeParse({
            menuId: '123e4567-e89b-12d3-a456-426614174000',
            reservedDate: '2026-12-31',
            reservedTime: '14:00',
            notes,
          });
          return result.success === true;
        }),
        { numRuns: 50 }
      );
    });

    it('should reject notes longer than 500 characters', () => {
      fc.assert(
        fc.property(invalidNotesArbitrary, (notes) => {
          const result = createReservationSchema.safeParse({
            menuId: '123e4567-e89b-12d3-a456-426614174000',
            reservedDate: '2026-12-31',
            reservedTime: '14:00',
            notes,
          });
          return result.success === false;
        }),
        { numRuns: 50 }
      );
    });

    // 境界値テスト
    it('should accept exactly 500 characters', () => {
      const result = createReservationSchema.safeParse({
        menuId: '123e4567-e89b-12d3-a456-426614174000',
        reservedDate: '2026-12-31',
        reservedTime: '14:00',
        notes: 'a'.repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it('should reject exactly 501 characters', () => {
      const result = createReservationSchema.safeParse({
        menuId: '123e4567-e89b-12d3-a456-426614174000',
        reservedDate: '2026-12-31',
        reservedTime: '14:00',
        notes: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  /**
   * UUIDバリデーションのProperty-Based Testing
   */
  describe('UUID validation properties', () => {
    // 有効なUUID v4形式のArbitrary
    const validUuidArbitrary = fc.uuid();

    // 無効なUUID形式のArbitrary
    const invalidUuidArbitrary = fc.oneof(
      // 短すぎる文字列
      fc.string({ minLength: 1, maxLength: 35 }),
      // UUIDっぽいが無効な形式
      fc.constant('not-a-valid-uuid'),
      fc.constant('12345678-1234-1234-1234-12345678901'), // 1文字足りない
      fc.constant('12345678-1234-1234-1234-1234567890123'), // 1文字多い
      // 空文字列
      fc.constant('')
    );

    it('should accept any valid UUID', () => {
      fc.assert(
        fc.property(validUuidArbitrary, (uuid) => {
          const result = availableSlotsQuerySchema.safeParse({
            date: '2026-12-31',
            menuId: uuid,
          });
          return result.success === true;
        }),
        { numRuns: 50 }
      );
    });

    it('should reject any invalid UUID', () => {
      fc.assert(
        fc.property(invalidUuidArbitrary, (uuid) => {
          const result = availableSlotsQuerySchema.safeParse({
            date: '2026-12-31',
            menuId: uuid,
          });
          return result.success === false;
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * パスワードバリデーションのProperty-Based Testing
   */
  describe('Password validation properties', () => {
    // 有効なパスワードのArbitrary（8-72文字、小文字・大文字・数字・記号を含む）
    const validPasswordArbitrary = fc
      .tuple(
        fc.string({ minLength: 1, maxLength: 60 }).filter(s => /^[a-zA-Z0-9]*$/.test(s)),
        fc.constant('a'), // 小文字
        fc.constant('A'), // 大文字
        fc.constant('1'), // 数字
        fc.constant('!') // 記号
      )
      .map(([base, lower, upper, num, symbol]) => {
        const password = `${base}${lower}${upper}${num}${symbol}`;
        return password.length >= 8 ? password : `${password}aaaa`; // 最低8文字
      })
      .filter(p => p.length <= 72);

    // 無効なパスワード（小文字なし）
    const noLowercaseArbitrary = fc.constant('ABCD1234!');

    // 無効なパスワード（大文字なし）
    const noUppercaseArbitrary = fc.constant('abcd1234!');

    // 無効なパスワード（数字なし）
    const noNumberArbitrary = fc.constant('ABCDabcd!');

    // 無効なパスワード（記号なし）
    const noSymbolArbitrary = fc.constant('ABCDabcd1');

    it('should accept valid passwords', () => {
      fc.assert(
        fc.property(validPasswordArbitrary, (password) => {
          const result = registerSchema.safeParse({
            name: 'テストユーザー',
            email: 'test@example.com',
            password,
            passwordConfirm: password,
            termsAccepted: true,
          });
          return result.success === true;
        }),
        { numRuns: 30 }
      );
    });

    it('should reject passwords without lowercase', () => {
      fc.assert(
        fc.property(noLowercaseArbitrary, (password) => {
          const result = registerSchema.safeParse({
            name: 'テストユーザー',
            email: 'test@example.com',
            password,
            passwordConfirm: password,
            termsAccepted: true,
          });
          return result.success === false;
        }),
        { numRuns: 1 }
      );
    });

    it('should reject passwords without uppercase', () => {
      fc.assert(
        fc.property(noUppercaseArbitrary, (password) => {
          const result = registerSchema.safeParse({
            name: 'テストユーザー',
            email: 'test@example.com',
            password,
            passwordConfirm: password,
            termsAccepted: true,
          });
          return result.success === false;
        }),
        { numRuns: 1 }
      );
    });

    it('should reject passwords without numbers', () => {
      fc.assert(
        fc.property(noNumberArbitrary, (password) => {
          const result = registerSchema.safeParse({
            name: 'テストユーザー',
            email: 'test@example.com',
            password,
            passwordConfirm: password,
            termsAccepted: true,
          });
          return result.success === false;
        }),
        { numRuns: 1 }
      );
    });

    it('should reject passwords without symbols', () => {
      fc.assert(
        fc.property(noSymbolArbitrary, (password) => {
          const result = registerSchema.safeParse({
            name: 'テストユーザー',
            email: 'test@example.com',
            password,
            passwordConfirm: password,
            termsAccepted: true,
          });
          return result.success === false;
        }),
        { numRuns: 1 }
      );
    });
  });
});

