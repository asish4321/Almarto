import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  code,
}: {
  to: string;
  subject: string;
  code: string;
}): Promise<{ sent: boolean; error?: string }> {
  const host = process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : '');
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"ALMARTO POP DIY" <${user}>`,
        to,
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #eaeaea; border-radius: 20px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #35109B; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">ALMARTO</h1>
              <p style="color: #FF7900; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Official Pop DIY Creator Hub</p>
            </div>
            
            <p style="color: #19152B; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Hello,</p>
            <p style="color: #555555; font-size: 13px; line-height: 1.6; margin-top: 0;">Use the 6-digit verification code below to complete your sign in. This code is confidential and will expire in 10 minutes.</p>
            
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; font-family: monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #35109B; background: #F2EFFF; padding: 16px 32px; border-radius: 16px; border: 2px dashed #C3B5FD;">
                ${code}
              </div>
            </div>
            
            <p style="color: #888888; font-size: 11px; line-height: 1.5; text-align: center; margin-top: 24px; border-top: 1px solid #f0f0f0; pt: 16px;">
              If you did not request this verification code, please ignore this email or reach out to ALMARTO support.
            </p>
          </div>
        `,
      });

      return { sent: true };
    } catch (err) {
      console.error('Nodemailer send error:', err);
      const message = err instanceof Error ? err.message : 'SMTP delivery failed';
      return { sent: false, error: message };
    }
  }

  return { sent: false, error: 'NO_SMTP_CONFIGURED' };
}
