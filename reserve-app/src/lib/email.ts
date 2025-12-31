import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ReservationEmailData {
  to: string;
  userName: string;
  menuName: string;
  staffName: string;
  reservedDate: string;
  reservedTime: string;
  price: number;
  duration: number;
  notes?: string;
}

/**
 * Send reservation confirmation email
 */
export async function sendReservationConfirmationEmail(data: ReservationEmailData) {
  const {
    to,
    userName,
    menuName,
    staffName,
    reservedDate,
    reservedTime,
    price,
    duration,
    notes,
  } = data;

  const formattedDate = new Date(reservedDate).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #3b82f6;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .info-table {
            width: 100%;
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #6b7280;
            width: 120px;
            flex-shrink: 0;
          }
          .info-value {
            color: #111827;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>予約確認</h1>
        </div>
        <div class="content">
          <p>${userName} 様</p>
          <p>ご予約ありがとうございます。<br>以下の内容で予約を承りました。</p>

          <div class="info-table">
            <div class="info-row">
              <div class="info-label">予約日時</div>
              <div class="info-value">${formattedDate} ${reservedTime}</div>
            </div>
            <div class="info-row">
              <div class="info-label">メニュー</div>
              <div class="info-value">${menuName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">担当者</div>
              <div class="info-value">${staffName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">料金</div>
              <div class="info-value">¥${price.toLocaleString()}</div>
            </div>
            <div class="info-row">
              <div class="info-label">所要時間</div>
              <div class="info-value">${duration}分</div>
            </div>
            ${notes ? `
            <div class="info-row">
              <div class="info-label">備考</div>
              <div class="info-value">${notes}</div>
            </div>
            ` : ''}
          </div>

          <p><strong>キャンセル・変更について：</strong><br>
          予約日の前日までマイページから変更可能です。<br>
          当日キャンセルの場合はお電話にてご連絡ください。</p>

          <p>ご来店を心よりお待ちしております。</p>
        </div>
        <div class="footer">
          <p>このメールは自動送信されています。<br>
          ご不明な点がございましたら、店舗までお問い合わせください。</p>
        </div>
      </body>
    </html>
  `;

  const emailText = `
${userName} 様

ご予約ありがとうございます。
以下の内容で予約を承りました。

━━━━━━━━━━━━━━━━━━
予約情報
━━━━━━━━━━━━━━━━━━
予約日時: ${formattedDate} ${reservedTime}
メニュー: ${menuName}
担当者: ${staffName}
料金: ¥${price.toLocaleString()}
所要時間: ${duration}分
${notes ? `備考: ${notes}` : ''}

━━━━━━━━━━━━━━━━━━

【キャンセル・変更について】
予約日の前日までマイページから変更可能です。
当日キャンセルの場合はお電話にてご連絡ください。

ご来店を心よりお待ちしております。

━━━━━━━━━━━━━━━━━━
このメールは自動送信されています。
ご不明な点がございましたら、店舗までお問い合わせください。
  `.trim();

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject: '【予約確認】ご予約ありがとうございます',
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw new Error('メール送信に失敗しました');
    }

    return emailData;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
