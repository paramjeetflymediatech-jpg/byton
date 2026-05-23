import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields (name, email, subject, message) are required.' },
        { status: 400 }
      );
    }

    const recipient = process.env.CONTACT_RECEIVER_EMAIL || 'sales@baytonhorticulture.co.uk';

    // 1. Send admin notification email
    const adminMailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #5EB446; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 24px;">New Contact Form Submission</h2>
        </div>
        <div style="padding: 24px;">
          <p>Hello Admin,</p>
          <p>You have received a new contact inquiry from the website. Here are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #5EB446; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${email}" style="background-color: #5EB446; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply Directly</a>
          </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
          Sent from Bayton Horticulture Store Website.
        </div>
      </div>
    `;

    const adminMailText = `
New Contact Inquiry Received:
-----------------------------
Name: ${name}
Email: ${email}
Subject: ${subject}
Message:
${message}
    `;

    const adminMailResult = await sendMail({
      to: recipient,
      subject: `[Contact Form] ${subject} - ${name}`,
      text: adminMailText,
      html: adminMailHtml,
      replyTo: email, // Set inquirer as Reply-To
    });

    // 2. Send inquirer auto-responder email
    const autoResponderHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #5EB446; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 24px;">Thank You for Reaching Out!</h2>
        </div>
        <div style="padding: 24px;">
          <p>Hi ${name},</p>
          <p>We have received your message regarding <strong>"${subject}"</strong>. Our team is reviewing your inquiry and a horticulture specialist will get back to you as soon as possible (usually within 24 business hours).</p>
          
          <div style="margin: 24px 0; padding: 16px; background-color: #f9fbf7; border-left: 4px solid #5EB446; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; color: #333;">Your Message Copy:</h4>
            <p style="margin: 0; font-style: italic; color: #555; white-space: pre-wrap;">"${message}"</p>
          </div>
          
          <p>If you have any urgent questions, please feel free to call our Coventry superstore directly at <strong>024 7600 0000</strong> during business hours.</p>

          <p style="margin-top: 30px;">Warm regards,<br /><strong>Bayton Horticulture Customer Support Team</strong></p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
          Bayton Horticulture Centre, Bayton Road Industrial Estate, Coventry, West Midlands, CV7 9EL
        </div>
      </div>
    `;

    const autoResponderText = `
Hi ${name},

We have received your message regarding "${subject}". Our team is reviewing your inquiry and a horticulture specialist will get back to you as soon as possible (usually within 24 business hours).

If you have any urgent questions, please feel free to call our Coventry superstore directly at 024 7600 0000.

Warm regards,
Bayton Horticulture Customer Support Team
    `;

    let userMailResult = null;
    try {
      userMailResult = await sendMail({
        to: email,
        subject: `We've received your inquiry - Bayton Horticulture Store`,
        text: autoResponderText,
        html: autoResponderHtml,
      });
    } catch (userMailErr) {
      console.error('Failed to send auto-responder email:', userMailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully!',
      adminMail: adminMailResult,
      userMail: userMailResult,
    });
  } catch (error: any) {
    console.error('Error handling contact form submission API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again later.' },
      { status: 500 }
    );
  }
}
