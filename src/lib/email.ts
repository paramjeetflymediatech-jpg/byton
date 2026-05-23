import nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export async function sendMail(options: SendMailOptions) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"Bayton Horticulture Store" <noreply@baytonhorticulturecentre.co.uk>';

  // Check if SMTP is configured
  if (!host || !user || !pass) {
    console.log('------------------------------------------------------------');
    console.log('⚠️  SMTP Configuration missing. Using development fallback.');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Reply-To: ${options.replyTo || 'N/A'}`);
    console.log(`Text Body: ${options.text}`);
    console.log('------------------------------------------------------------');

    try {
      // Create a test account dynamically using ethereal.email
      console.log('Generating Ethereal SMTP test account for preview...');
      const testAccount = await nodemailer.createTestAccount();
      
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: `"Test Sender" <${testAccount.user}>`,
        to: options.to,
        replyTo: options.replyTo,
        subject: `[TEST] ${options.subject}`,
        text: options.text,
        html: options.html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`✉️  Ethereal Mail Sent! Message ID: ${info.messageId}`);
      console.log(`🔗  Preview URL: ${previewUrl}`);
      console.log('------------------------------------------------------------');
      return { success: true, previewUrl };
    } catch (err) {
      console.error('Failed to send Ethereal fallback email:', err);
      // Even if ethereal fails, return success since we logged the message to console
      return { success: true, loggedToConsole: true };
    }
  }

  // Create real SMTP transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports (587 etc)
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  console.log(`✉️  Email successfully sent. Message ID: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}
