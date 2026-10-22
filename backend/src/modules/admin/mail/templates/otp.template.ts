/**
 * Dựng HTML email gửi mã OTP xác minh tài khoản (mã có hạn 10 phút).
 * Dùng bởi: mail/mail.service.ts (sendOtpEmail).
 * Lưu ý: các thẻ <!-- HEADER -->, <!-- BODY -->… nằm trong chuỗi HTML của email, là nội dung gửi đi chứ không phải comment code.
 */
export const buildOtpEmail = (otp: string) => {
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

    <!-- HEADER -->
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
        Mã xác minh tài khoản
      </p>
    </div>

    <!-- BODY -->
    <div style="padding: 28px; color: #111827;">

      <p style="font-size: 14px;">
        Xin chào,
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        Chúng tôi nhận được yêu cầu xác minh tài khoản của bạn. Vui lòng dùng mã OTP dưới đây để hoàn tất.
      </p>

      <!-- OTP BOX -->
      <div style="
        margin: 24px 0;
        padding: 18px;
        text-align: center;
        font-size: 28px;
        letter-spacing: 8px;
        font-weight: bold;
        background: #f3f4f6;
        border-radius: 10px;
        border: 1px dashed #9ca3af;
        color: #111827;
      ">
        ${otp}
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align:center;">
        Mã có hiệu lực trong <b>10 phút</b>. Không chia sẻ mã cho bất kỳ ai.
      </p>

      <!-- SAFETY NOTE -->
      <div style="
        margin-top: 20px;
        font-size: 12px;
        color: #9ca3af;
        text-align: center;
      ">
        Nếu bạn không yêu cầu mã này, hãy bỏ qua email.
      </div>

    </div>

    <!-- FOOTER -->
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