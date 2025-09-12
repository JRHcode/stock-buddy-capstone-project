import nodemailer from 'nodemailer';

export interface AlertEmailData {
  userEmail: string;
  userName: string;
  symbol: string;
  condition: 'above' | 'below' | 'change';
  targetValue: number;
  currentValue: number;
  triggeredAt: Date;
}

// Create email transporter
const createTransporter = () => {
  // For development, use Gmail SMTP
  // In production, you'd use a service like SendGrid, AWS SES, etc.
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
    },
  });
};

// Generate alert email HTML template
const generateAlertEmailHTML = (data: AlertEmailData): string => {
  const conditionText = data.condition === 'above' 
    ? `went above $${data.targetValue}` 
    : data.condition === 'below'
    ? `went below $${data.targetValue}`
    : `changed significantly`;

  const priceChange = data.condition === 'above' 
    ? 'increase' 
    : data.condition === 'below'
    ? 'decrease'
    : 'change';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Stock Alert Triggered - ${data.symbol}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #374151; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
            .alert-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .price { font-size: 24px; font-weight: bold; color: #059669; }
            .symbol { font-size: 28px; font-weight: bold; color: #1f2937; }
            .condition { color: #dc2626; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 Stock Alert Triggered</h1>
                <p>Your price alert for <span class="symbol">${data.symbol}</span> has been triggered!</p>
            </div>
            
            <div class="content">
                <h2>Hello ${data.userName},</h2>
                
                <div class="alert-box">
                    <h3>📈 Alert Details</h3>
                    <p><strong>Symbol:</strong> ${data.symbol}</p>
                    <p><strong>Condition:</strong> <span class="condition">Price ${conditionText}</span></p>
                    <p><strong>Target Price:</strong> $${data.targetValue.toFixed(2)}</p>
                    <p><strong>Current Price:</strong> <span class="price">$${data.currentValue.toFixed(2)}</span></p>
                    <p><strong>Triggered At:</strong> ${data.triggeredAt.toLocaleString()}</p>
                </div>
                
                <p>Your stock ${data.symbol} has experienced a significant ${priceChange}. The current price is <strong>$${data.currentValue.toFixed(2)}</strong>, which triggered your alert condition.</p>
                
                <p>This alert has been automatically disabled to prevent spam. You can create a new alert in your Stock Buddy dashboard if needed.</p>
                
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts" 
                       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        View Your Alerts
                    </a>
                </p>
            </div>
            
            <div class="footer">
                <p>&copy; 2024 Stock Buddy. All rights reserved.</p>
                <p><small>You received this email because you have an active price alert. You can manage your alerts in your dashboard.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate plain text version for email clients that don't support HTML
const generateAlertEmailText = (data: AlertEmailData): string => {
  const conditionText = data.condition === 'above' 
    ? `went above $${data.targetValue}` 
    : data.condition === 'below'
    ? `went below $${data.targetValue}`
    : `changed significantly`;

  return `
STOCK ALERT TRIGGERED - ${data.symbol}

Hello ${data.userName},

Your price alert for ${data.symbol} has been triggered!

Alert Details:
- Symbol: ${data.symbol}
- Condition: Price ${conditionText}
- Target Price: $${data.targetValue.toFixed(2)}
- Current Price: $${data.currentValue.toFixed(2)}
- Triggered At: ${data.triggeredAt.toLocaleString()}

Your stock ${data.symbol} has reached your target price. The current price is $${data.currentValue.toFixed(2)}.

This alert has been automatically disabled to prevent spam. You can create a new alert in your Stock Buddy dashboard if needed.

Visit your alerts: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts

---
Stock Buddy - Your Personal Stock Assistant
  `.trim();
};

// Send alert email
export const sendAlertEmail = async (data: AlertEmailData): Promise<boolean> => {
  try {
    console.log('Sending alert email to:', data.userEmail, 'for symbol:', data.symbol);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Stock Buddy Alerts',
        address: process.env.EMAIL_USER!,
      },
      to: data.userEmail,
      subject: `🚨 Alert: ${data.symbol} price ${data.condition === 'above' ? 'above' : data.condition === 'below' ? 'below' : 'changed'} $${data.targetValue}`,
      html: generateAlertEmailHTML(data),
      text: generateAlertEmailText(data),
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Alert email sent successfully:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('Failed to send alert email:', error);
    return false;
  }
};

// Generate verification email HTML template
const generateVerificationEmailHTML = (userName: string, verificationUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Verify Your Stock Buddy Account</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #374151; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
            .verify-button { 
                display: inline-block; 
                background: #059669; 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: bold;
                margin: 20px 0;
            }
            .verify-button:hover { background: #047857; }
            .welcome-text { font-size: 18px; color: #1f2937; }
            .important { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📈 Welcome to Stock Buddy!</h1>
                <p>Thanks for joining our community of smart investors.</p>
            </div>
            
            <div class="content">
                <h2>Hello ${userName},</h2>
                
                <p class="welcome-text">Welcome to Stock Buddy! We're excited to have you on board.</p>
                
                <p>To get started and access all features, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="verify-button">
                        ✅ Verify Email Address
                    </a>
                </div>
                
                <div class="important">
                    <p><strong>⏰ This verification link expires in 24 hours.</strong></p>
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
                </div>
                
                <p>Once verified, you'll be able to:</p>
                <ul>
                    <li>🔍 Search and track any stock in real-time</li>
                    <li>📊 Build and manage your portfolio</li>
                    <li>⚠️ Set up price alerts and notifications</li>
                    <li>📈 View detailed charts and analysis</li>
                </ul>
                
                <p>If you didn't create this account, please ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>&copy; 2024 Stock Buddy. All rights reserved.</p>
                <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate verification email plain text version
const generateVerificationEmailText = (userName: string, verificationUrl: string): string => {
  return `
WELCOME TO STOCK BUDDY - VERIFY YOUR EMAIL

Hello ${userName},

Welcome to Stock Buddy! We're excited to have you on board.

To get started and access all features, please verify your email address by visiting this link:

${verificationUrl}

This verification link expires in 24 hours.

Once verified, you'll be able to:
- Search and track any stock in real-time
- Build and manage your portfolio  
- Set up price alerts and notifications
- View detailed charts and analysis

If you didn't create this account, please ignore this email.

---
Stock Buddy - Your Personal Stock Assistant
  `.trim();
};

// Send verification email
export const sendVerificationEmail = async (
  email: string, 
  name: string, 
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Sending verification email to:', email);
    
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Stock Buddy',
        address: process.env.EMAIL_USER!,
      },
      to: email,
      subject: 'Verify your Stock Buddy account',
      html: generateVerificationEmailHTML(name, verificationUrl),
      text: generateVerificationEmailText(name, verificationUrl),
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', result.messageId);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Test email configuration
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};