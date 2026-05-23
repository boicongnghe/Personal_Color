const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetPasswordEmail = async (toEmail, displayName, resetUrl) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#8b5cf6,#ec4899);padding:32px;text-align:center;">
        <img src="${process.env.CLIENT_URL}/logo.png" alt="Clarity" width="64" height="64" style="border-radius:16px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Clarity</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Ứng dụng phân tích màu sắc cá nhân</p>
      </div>
      <div style="padding:32px 28px;">
        <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px;">Đặt lại mật khẩu</h2>
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Xin chào <strong>${displayName || toEmail}</strong>,<br/>
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
          Link này có hiệu lực trong <strong>1 giờ</strong>.
        </p>
        <a href="${resetUrl}" style="display:block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;text-align:center;text-decoration:none;padding:14px 24px;border-radius:12px;font-size:15px;font-weight:700;margin-bottom:24px;">
          Đặt lại mật khẩu →
        </a>
        <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.<br/>
          Link sẽ tự động hết hạn sau 1 giờ.
        </p>
      </div>
      <div style="background:#f9fafb;padding:16px 28px;border-top:1px solid #f3f4f6;">
        <p style="color:#9ca3af;font-size:11px;margin:0;text-align:center;">© 2025 Clarity App · Tất cả quyền được bảo lưu</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Clarity App" <${process.env.SMTP_USER}>`,
    to:   toEmail,
    subject: 'Đặt lại mật khẩu Clarity',
    html,
  });
};

module.exports = { sendResetPasswordEmail };
