const otpEmailTemplate = (otp) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify Your Email</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 15px;">
          <table width="100%" max-width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.08);overflow:hidden;">

            <tr>
              <td style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:24px;text-align:center;color:#fff;">
                <h1 style="margin:0;font-size:24px;">CarRental</h1>
                <p style="margin:6px 0 0;font-size:14px;opacity:.9;">
                  Verify your email address
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 28px;color:#333;">
                <p style="margin:0 0 16px;font-size:16px;">Hi 👋,</p>

                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
                  Thank you for creating an account with <b>CarRental</b>.
                  Please use the OTP below to complete your registration.
                </p>

                <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;margin:24px 0;">
                  <p style="margin:0 0 8px;font-size:14px;color:#555;">
                    Your verification code
                  </p>
                  <h2 style="margin:0;font-size:32px;letter-spacing:6px;color:#4f46e5;">
                    ${otp}
                  </h2>
                </div>

                <p style="margin:0 0 16px;font-size:14px;color:#555;">
                  ⏱️ This code will expire in <b>10 minutes</b>.
                </p>

                <p style="margin:0;font-size:14px;color:#555;">
                  If you didn’t request this, you can safely ignore this email.
                </p>

                <p style="margin-top:24px;font-size:14px;color:#555;">
                  Thanks,<br />
                  <b>CarRental Team</b>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#888;">
                © 2026 CarRental. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports = otpEmailTemplate;
