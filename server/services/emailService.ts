/**
 * Email Notification Service
 * Send email notifications for crisis alerts and other events
 */

import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface CrisisEmailData {
  alertId: string;
  alertType: string;
  riskScore: number;
  keywords: string[];
  context: string;
  sessionId: string;
  timestamp: Date;
}

/**
 * Send crisis alert email
 */
export async function sendCrisisAlertEmail(
  recipient: string,
  data: CrisisEmailData
): Promise<void> {
  const subject = `🚨 CRISIS ALERT: ${data.alertType.toUpperCase()} - Risk Score ${data.riskScore}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .alert-box { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 15px 0; }
        .risk-badge { display: inline-block; background: #DC2626; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
        .keywords { background: #FEE2E2; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .button { display: inline-block; background: #9333EA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🚨 Crisis Alert Detected</h1>
          <p style="margin: 5px 0 0 0;">Immediate attention required</p>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <h2 style="margin-top: 0;">Alert Details</h2>
            <p><strong>Type:</strong> ${data.alertType.toUpperCase()}</p>
            <p><strong>Risk Score:</strong> <span class="risk-badge">${data.riskScore}/100</span></p>
            <p><strong>Session ID:</strong> ${data.sessionId}</p>
            <p><strong>Time:</strong> ${data.timestamp.toLocaleString()}</p>
          </div>
          
          <div class="keywords">
            <strong>Detected Keywords:</strong><br>
            ${data.keywords.map(k => `<span style="background: #DC2626; color: white; padding: 2px 6px; border-radius: 3px; margin: 2px; display: inline-block;">${k}</span>`).join(' ')}
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <strong>Message Context:</strong>
            <p style="font-style: italic; color: #4b5563;">"${data.context}"</p>
          </div>
          
          <a href="https://purposeful-individual.onrender.com/admin/crisis" class="button">
            View in Admin Dashboard →
          </a>
          
          <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px; margin: 15px 0;">
            <strong>⚠️ Action Required:</strong>
            <ul style="margin: 10px 0;">
              <li>Review the full conversation immediately</li>
              <li>Assess if emergency services need to be contacted</li>
              <li>Document your response and actions taken</li>
              <li>Follow up with the user if possible</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated crisis alert from Purposeful Live Coaching Platform</p>
          <p>Alert ID: ${data.alertId}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
CRISIS ALERT DETECTED

Type: ${data.alertType.toUpperCase()}
Risk Score: ${data.riskScore}/100
Session ID: ${data.sessionId}
Time: ${data.timestamp.toLocaleString()}

Detected Keywords: ${data.keywords.join(', ')}

Message Context:
"${data.context}"

View in Admin Dashboard: https://purposeful-individual.onrender.com/admin/crisis

ACTION REQUIRED:
- Review the full conversation immediately
- Assess if emergency services need to be contacted
- Document your response and actions taken
- Follow up with the user if possible

Alert ID: ${data.alertId}
  `;

  try {
    await transporter.sendMail({
      from: `"Purposeful Crisis Monitor" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject,
      text,
      html,
    });
    
    console.log(`[EMAIL] Crisis alert sent to ${recipient}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send crisis alert:`, error);
    throw error;
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  recipient: string,
  name: string
): Promise<void> {
  const subject = "Welcome to Purposeful Live Coaching! 🎉";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #9333EA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #9333EA; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welcome, ${name}! 🎉</h1>
          <p style="margin: 10px 0 0 0;">Your journey to freedom starts here</p>
        </div>
        
        <div class="content">
          <p>Hi ${name},</p>
          
          <p>Welcome to Purposeful Live Coaching! We're thrilled to have you join our community of individuals working towards quitting their day jobs and living purposefully.</p>
          
          <h2>What You Can Do Now:</h2>
          
          <div class="feature">
            <strong>💬 Start a Coaching Session</strong>
            <p>Chat with our AI coach anytime, 24/7. Get personalized guidance tailored to your goals.</p>
          </div>
          
          <div class="feature">
            <strong>📞 Call for Voice Coaching</strong>
            <p>Prefer to talk? Call us at <strong>+1 (564) 529-6454</strong> for voice coaching.</p>
          </div>
          
          <div class="feature">
            <strong>📊 Track Your Progress</strong>
            <p>Use our wellness modules to track your spiritual, mental, emotional, physical, and financial growth.</p>
          </div>
          
          <a href="https://purposeful-individual.onrender.com" class="button">
            Get Started →
          </a>
          
          <p style="margin-top: 30px;">If you have any questions, just reply to this email. We're here to help!</p>
          
          <p>To your freedom,<br>
          <strong>The Purposeful Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Purposeful Live Coaching" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject,
      html,
    });
    
    console.log(`[EMAIL] Welcome email sent to ${recipient}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send welcome email:`, error);
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("[EMAIL] SMTP configuration verified");
    return true;
  } catch (error) {
    console.error("[EMAIL] SMTP configuration error:", error);
    return false;
  }
}
