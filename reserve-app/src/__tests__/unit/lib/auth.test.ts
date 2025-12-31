import { describe, it, expect } from '@jest/globals';

/**
 * 認証バリデーションスキーマのテスト
 *
 * Note: auth.tsの実際の関数テストはSupabaseとPrismaのモックが必要なため、
 * E2Eテストで統合テストとして実行します。
 * ここではvalidation schemaの基本的な動作のみをテストします。
 */

describe('認証バリデーションスキーマ', () => {
  describe('registerSchema', () => {
    it('registerSchemaとloginSchemaが正しくエクスポートされている', async () => {
      const validationsModule = await import('@/lib/validations');

      expect(validationsModule.registerSchema).toBeDefined();
      expect(validationsModule.loginSchema).toBeDefined();
      expect(typeof validationsModule.registerSchema.safeParse).toBe('function');
      expect(typeof validationsModule.loginSchema.safeParse).toBe('function');
    });

    it('有効なデータで成功する', async () => {
      const { registerSchema } = await import('@/lib/validations');

      const validData = {
        name: '山田太郎',
        email: 'test@example.com',
        phone: '090-1234-5678',
        password: 'password123',
        passwordConfirm: 'password123',
        termsAccepted: true,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('パスワードが一致しない場合エラー', async () => {
      const { registerSchema } = await import('@/lib/validations');

      const invalidData = {
        name: '山田太郎',
        email: 'test@example.com',
        phone: '090-1234-5678',
        password: 'password123',
        passwordConfirm: 'differentpass',
        termsAccepted: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('有効なデータで成功する', async () => {
      const { loginSchema } = await import('@/lib/validations');

      const validData = {
        email: 'test@example.com',
        password: 'password123',
        remember: true,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rememberフィールドはオプショナル', async () => {
      const { loginSchema } = await import('@/lib/validations');

      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
