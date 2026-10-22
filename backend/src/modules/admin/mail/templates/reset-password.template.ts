/**
 * Dựng HTML email chứa link đặt lại mật khẩu (link có hạn 15 phút).
 * Dùng bởi: mail/mail.service.ts (sendPasswordResetEmail).
 */
export const buildPasswordResetEmail = (resetLink: string) => {
  return `
  <div style="
    font-family: Arial, Helvetica, sans-serif;
    max-width: 520px;
    margin: auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  ">
    <div style="
      background: linear-gradient(135deg, #111827, #374151);
      padding: 24px;
      text-align: center;
      color: #ffffff;
    ">
      <h2 style="margin:0; font-size: 20px; letter-spacing: 2px;">
        XE ĐIỆN XANH
      </h2>
      <p style="margin:6px 0 0; font-size: 12px; opacity: 0.8;">
        Yêu cầu đặt lại mật khẩu
      </p>
    </div>

    <div style="padding: 28px; color: #111827;">
      <p style="font-size: 14px;">Xin chào,</p>

      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu tài khoản quản trị Xe Điện Xanh của bạn.
        Bấm nút bên dưới để đặt mật khẩu mới.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #111827, #374151);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 1px;
        ">ĐẶT LẠI MẬT KHẨU</a>
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align: center;">
        Liên kết có hiệu lực trong <b>15 phút</b>. Không chia sẻ cho bất kỳ ai.
      </p>

      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">
        Nếu nút không hoạt động, hãy sao chép liên kết sau vào trình duyệt:<br>
        <span style="color: #374151; word-break: break-all;">${resetLink}</span>
      </p>

      <div style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
        Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email.
      </div>
    </div>

    <div style="
      background: #f9fafb;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    ">
      © ${new Date().getFullYear()} Xe Điện Xanh. Bảo lưu mọi quyền.
    </div>
  </div>
  `;
};
