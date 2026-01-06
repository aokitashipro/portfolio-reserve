export function getCspHeaderValue(options: { isDev: boolean }): string {
  const { isDev } = options;

  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  // Supabase URLを取得（環境変数から、またはワイルドカードで許可）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseHost = '';

  if (supabaseUrl && supabaseUrl.startsWith('https://')) {
    try {
      supabaseHost = new URL(supabaseUrl).origin;
    } catch {
      // URL解析に失敗した場合はワイルドカードを使用
    }
  }

  // connect-src: Supabase APIへの接続を許可
  const connectSrc = supabaseHost
    ? `connect-src 'self' ${supabaseHost}`
    : "connect-src 'self' https://*.supabase.co";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    connectSrc,
    "frame-ancestors 'none'",
  ].join('; ');
}

