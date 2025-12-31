import { describe, it, expect } from '@jest/globals';
import { registerSchema, loginSchema } from '@/lib/validations';

describe('認証バリデーション', () => {
  describe('registerSchema', () => {
    it('有効なデータで成功する', () => {
      const validData = {
        name: '山田太郎',
        email: 'test@example.com',
        phone: '090-1234-5678',
        password: 'password123',
        passwordConfirm: 'password123',
        terms: true,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('名前が空の場合エラー', () => {
      const invalidData = {
        name: '',
        email: 'test@example.com',
        phone: '090-1234-5678',
        password: 'password123',
        passwordConfirm: 'password123',
        terms: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('名前を入力してください');
      }
    });

    it('無効なメールアドレスの場合エラー', () => {
      const invalidData = {
        name: '山田太郎',
        email: 'invalid-email',
        phone: '090-1234-5678',
        password: 'password123',
        passwordConfirm: 'password123',
        terms: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('有効なメールアドレス');
      }
    });

    it('無効な電話番号の場合エラー', () => {
      const invalidData = {
        name: '山田太郎',
        email: 'test@example.com',
        phone: '123',
        password: 'password123',
        passwordConfirm: 'password123',
        terms: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('有効な電話番号');
      }
    });

    it('パスワードが8文字未満の場合エラー', () => {
      const invalidData = {
        name: '山田太郎',
        email: 'test@example.com',
        phone: '090-1234-5678',
        password: 'pass',
        passwordConfirm: 'pass',
        terms: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('8文字以上');
      }
    });

    it('パスワードが一致しない場合エラー', () => {
      const invalidData = {
        name: '山田太郎',
        email: 'test@example.com',
        phone: '090-1234-5678',
        password: 'password123',
        passwordConfirm: 'differentpass',
        terms: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.errors.find((e) =>
          e.message.includes('パスワードが一致しません')
        );
        expect(error).toBeDefined();
      }
    });

    it('利用規約に同意しない場合エラー', () => {
      const invalidData = {
        name: '山田太郎',
        email: 'test@example.com',
        phone: '090-1234-5678',
        password: 'password123',
        passwordConfirm: 'password123',
        terms: false,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('利用規約に同意');
      }
    });
  });

  describe('loginSchema', () => {
    it('有効なデータで成功する', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        remember: true,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('メールアドレスが空の場合エラー', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('メールアドレスを入力');
      }
    });

    it('無効なメールアドレスの場合エラー', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('有効なメールアドレス');
      }
    });

    it('パスワードが空の場合エラー', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('パスワードを入力');
      }
    });

    it('rememberフィールドはオプショナル', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
