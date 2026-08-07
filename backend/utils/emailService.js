const nodemailer = require('nodemailer');

/**
 * Configure standard nodemailer transporter.
 * If SMTP credentials are not specified in the environment,
 * automatically generates a temporary sandbox account on ethereal.email.
 */
let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port == 465, // true for 465, false for other ports
      auth: { user, pass },
    });
    console.log('📬 SMTP Mail Transporter configured successfully.');
  } else {
    console.log('📬 No SMTP settings found. Generating Ethereal Mail sandbox credentials...');
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📬 Ethereal Mail Sandbox Account created:\n  User: ${testAccount.user}\n  Pass: ${testAccount.pass}`);
  }

  return cachedTransporter;
};

/**
 * Sends a raw or html email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"StayWise App" <no-reply@staywise.com>',
      to,
      subject,
      text,
      html,
    });

    // If using Ethereal sandbox, log the click-to-view preview URL in terminal
    if (!process.env.SMTP_HOST) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`\n======================================================`);
      console.log(`📧 [ETHEREAL SANDBOX EMAIL DISPATCHED]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Preview URL: ${previewUrl}`);
      console.log(`======================================================\n`);
    } else {
      console.log(`📧 Mail successfully delivered to ${to}. MessageID: ${info.messageId}`);
    }

    return { success: true, info };
  } catch (err) {
    console.error('❌ [EmailService] Failed to send email:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a welcome email to a new user based on their role
 */
const sendWelcomeEmail = async (user) => {
  const isOwner = user.role === 'owner';
  const roleLabel = isOwner ? 'Host' : 'Guest';
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to StayWise</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; color: #1f2937; }
        .wrapper { width: 100%; padding: 40px 0; background-color: #f3f4f6; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(31, 41, 55, 0.05); }
        .header { background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 8px 0 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .logo { font-size: 36px; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .content h2 { font-size: 20px; font-weight: 700; margin-top: 0; color: #111827; }
        .content p { font-size: 15px; color: #4b5563; margin-bottom: 20px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: ${isOwner ? '#def7ec' : '#e1effe'}; color: ${isOwner ? '#03543f' : '#1e429f'}; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; }
        .features-list { list-style: none; padding: 0; margin: 24px 0; }
        .feature-item { font-size: 14px; color: #4b5563; margin-bottom: 12px; display: flex; align-items: flex-start; }
        .feature-icon { margin-right: 10px; font-size: 16px; }
        .btn-container { text-align: center; margin: 32px 0 16px; }
        .btn { display: inline-block; padding: 12px 30px; font-size: 14px; font-weight: 700; color: #ffffff !important; background-color: #6366f1; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.15); }
        .footer { text-align: center; padding: 24px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af; }
        .footer a { color: #6366f1; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <span class="logo">🏡</span>
            <h1>StayWise</h1>
          </div>
          <div class="content">
            <span class="badge">${roleLabel} Account</span>
            <h2>Welcome to the family, ${user.name}!</h2>
            <p>We are absolutely thrilled to have you join StayWise. Your account has been registered successfully as a <strong>${roleLabel.toLowerCase()}</strong>.</p>
            
            <p>Here are some of the premium features waiting for you on your dashboard:</p>
            
            <ul class="features-list">
              ${
                isOwner
                  ? `
                <li class="feature-item"><span class="feature-icon">✨</span> Create and manage your homestay listings with ease</li>
                <li class="feature-item"><span class="feature-icon">🤖</span> Auto-generate premium descriptions using Google Gemini AI</li>
                <li class="feature-item"><span class="feature-icon">📈</span> Unlock host analytics and AI-driven dynamic pricing predictions</li>
                <li class="feature-item"><span class="feature-icon">💬</span> Message guests directly in the Messenger Inbox</li>
                `
                  : `
                <li class="feature-item"><span class="feature-icon">🔍</span> Explore and search local homestay listings in beautiful layouts</li>
                <li class="feature-item"><span class="feature-icon">🛡️</span> Secure payments with escrow release configurations</li>
                <li class="feature-item"><span class="feature-icon">💬</span> Chat with AI Local Guides to learn about your host area</li>
                <li class="feature-item"><span class="feature-icon">📬</span> Contact hosts directly through our private messenger</li>
                `
              }
            </ul>

            <div class="btn-container">
              <a href="${dashboardUrl}" target="_blank" class="btn">Access Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} StayWise. All rights reserved.</p>
            <p>If you did not create this account, please ignore this email or <a href="#">contact support</a>.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Welcome to StayWise, ${user.name}! 🏡`,
    html,
    text: `Welcome to StayWise, ${user.name}! Your account has been created successfully as a ${roleLabel}. Access your dashboard at ${dashboardUrl}`,
  });
};

/**
 * Sends a 2FA-like password reset verification email
 */
const sendResetPasswordEmail = async (user, code, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; color: #1f2937; }
        .wrapper { width: 100%; padding: 40px 0; background-color: #f3f4f6; }
        .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(31, 41, 55, 0.05); }
        .header { background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 4px 0 0; font-size: 22px; font-weight: 800; }
        .logo { font-size: 28px; }
        .content { padding: 32px 24px; text-align: center; }
        .content h2 { font-size: 18px; font-weight: 700; color: #111827; margin-top: 0; }
        .content p { font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
        .otp-container { display: inline-block; padding: 16px 32px; background-color: #f3f4f6; border-radius: 12px; margin: 8px 0 24px; border: 1px dashed #6366f1; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #4f46e5; letter-spacing: 6px; }
        .expiry-notice { font-size: 12px; color: #9ca3af; margin-top: 8px; font-style: italic; }
        .btn-container { margin: 24px 0 12px; }
        .btn { display: inline-block; padding: 10px 24px; font-size: 13px; font-weight: 700; color: #ffffff !important; background-color: #6366f1; border-radius: 8px; text-decoration: none; }
        .footer { text-align: center; padding: 20px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <span class="logo">🔑</span>
            <h1>StayWise Security</h1>
          </div>
          <div class="content">
            <h2>Reset Password Code</h2>
            <p>We received a request to reset the password for your StayWise account. Please use the following 6-digit verification code to proceed:</p>
            
            <div class="otp-container">
              <span class="otp-code">${code}</span>
            </div>
            
            <p class="expiry-notice">This 2FA reset code is valid for 15 minutes only and can be used once.</p>

            <p>If you prefer to reset using a direct URL, you can click the button below:</p>
            <div class="btn-container">
              <a href="${resetUrl}" target="_blank" class="btn">Reset Password Directly</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} StayWise. All rights reserved.</p>
            <p>If you did not make this request, you can safely ignore this email; your account remains secure.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Password Reset Verification Code: ${code} 🔑`,
    html,
    text: `Your StayWise password reset code is ${code}. Or, reset your password using the link: ${resetUrl}`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
};
