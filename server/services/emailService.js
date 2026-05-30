const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

exports.sendWelcomeEmail = async ({ name, email, tempPassword }) => {
  await transporter.sendMail({
    from: `"Sikshalaya Global" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Sikshalaya Teacher Account is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #2563EB;">Welcome to Sikshalaya, ${name}!</h2>
        <p>Your teacher account has been created. Use the details below to log in to the mobile app.</p>
        <div style="background: #F1F5F9; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px;">${tempPassword}</span></p>
        </div>
        <p style="color: #EF4444;"><strong>Please change your password after first login.</strong></p>
        <p style="color: #94A3B8; font-size: 12px;">If you did not expect this email, please contact your school administrator.</p>
      </div>
    `,
  })
}

exports.sendOtpEmail = async ({ name, email, otp }) => {
  await transporter.sendMail({
    from: `"Sikshalaya Global" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Sikshalaya Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #2563EB;">Login Verification</h2>
        <p>Hi ${name}, use the OTP below to complete your login.</p>
        <div style="background: #F1F5F9; padding: 24px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #1E293B;">${otp}</span>
        </div>
        <p style="color: #94A3B8;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  })
}
