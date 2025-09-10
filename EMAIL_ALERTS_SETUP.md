# Email Alerts Setup Guide

## Overview
The Stock Buddy app now supports email notifications for price alerts! When a stock reaches your target price, you'll receive an email notification.

## Setup Instructions

### 1. Email Service Configuration

Add these environment variables to your `.env.local` file:

```bash
# Email Service Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password

# Optional: Custom app URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Cron job security (for production)
CRON_SECRET=your-secret-key-for-cron-jobs
```

### 2. Gmail App Password Setup

Since we're using Gmail SMTP, you'll need to create an App Password:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication (required for App Passwords)
3. Go to Security > 2-Step Verification > App passwords
4. Generate a new App password for "Mail"
5. Use this App password (not your regular Gmail password) in `EMAIL_APP_PASSWORD`

### 3. Alternative Email Providers

If you prefer not to use Gmail, you can modify `/src/lib/emailService.ts` to use other providers:

**SendGrid:**
```typescript
const transporter = nodemailer.createTransporter({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

**AWS SES:**
```typescript
const transporter = nodemailer.createTransporter({
  service: 'AWS SES',
  auth: {
    user: process.env.AWS_ACCESS_KEY_ID,
    pass: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});
```

## How It Works

### 1. Background Monitoring
- A cron job runs every 15 minutes to check all active alerts
- It fetches current stock prices and compares them to alert conditions
- When an alert is triggered, an email is sent and the alert is disabled

### 2. Alert Conditions
- **Above**: Trigger when stock price goes above target value
- **Below**: Trigger when stock price goes below target value  
- **Change**: Trigger when stock price changes by more than target percentage

### 3. Email Features
- Professional HTML email template
- Plain text fallback for all email clients
- Automatic alert deactivation to prevent spam
- Direct link back to your alerts dashboard

## API Endpoints

### Check Alerts Manually
```bash
# Check all alerts (for background jobs)
POST /api/alerts/check
{
  "action": "check-all"
}

# Check alerts for current user
POST /api/alerts/check
Authorization: Bearer <your-jwt-token>
{
  "action": "check-user"
}

# Test email configuration
POST /api/alerts/check
{
  "action": "test-email"
}
```

### Simulate Price Movement (Development Only)
```bash
POST /api/alerts/check
{
  "action": "simulate-price",
  "symbol": "JPM",
  "targetPrice": 500
}
```

### Cron Job Endpoint
```bash
GET /api/cron/alerts
Authorization: Bearer <CRON_SECRET>
```

## Testing the System

### 1. Test Email Configuration
Visit `/alerts` page and use the "Test Email" button, or:
```bash
curl -X POST http://localhost:3000/api/alerts/check \
  -H "Content-Type: application/json" \
  -d '{"action": "test-email"}'
```

### 2. Create a Test Alert
1. Go to the Alerts page
2. Create an alert for a stock (e.g., JPM above $500)
3. Use the price simulation to trigger it:
```bash
curl -X POST http://localhost:3000/api/alerts/check \
  -H "Content-Type: application/json" \
  -d '{"action": "simulate-price", "symbol": "JPM", "targetPrice": 501}'
```

### 3. Manual Alert Check
```bash
curl -X POST http://localhost:3000/api/alerts/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"action": "check-user"}'
```

## Production Deployment

### Vercel
The included `vercel.json` file automatically sets up a cron job to run every 15 minutes. Just deploy and it will work!

### Other Platforms
Set up a cron job to hit your `/api/cron/alerts` endpoint every 15 minutes:
```bash
# Add to your server's crontab
*/15 * * * * curl -X GET "https://your-domain.com/api/cron/alerts" -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Environment Variables for Production
```bash
EMAIL_USER=your-production-email@company.com
EMAIL_APP_PASSWORD=your-production-app-password
NEXT_PUBLIC_APP_URL=https://your-domain.com
CRON_SECRET=your-secure-random-secret
```

## Monitoring

### Check System Status
```bash
GET /api/alerts/check?action=test-email
```

### View Logs
All email sending and alert checking activities are logged to the console. In production, these will appear in your hosting platform's logs.

## Troubleshooting

### Common Issues

1. **"Invalid credentials" email error**
   - Make sure you're using an App Password, not your regular Gmail password
   - Verify 2FA is enabled on your Google account

2. **"No alerts triggered"**
   - Check that alerts are marked as `isActive: true`
   - Verify stock symbols are correct
   - Use price simulation to test specific scenarios

3. **Cron job not running**
   - Verify `CRON_SECRET` is set correctly
   - Check your hosting platform's cron job configuration
   - Test the endpoint manually first

4. **Emails not being received**
   - Check spam folder
   - Verify `EMAIL_USER` is a valid sending address
   - Test with `test-email` action first

### Debug Mode
Set `NODE_ENV=development` to enable additional console logging and the price simulation feature.

## Security Notes

- App Passwords are more secure than regular passwords
- The cron endpoint should be protected with `CRON_SECRET` in production
- Users can only check their own alerts (user isolation enforced)
- Alerts are automatically disabled after triggering to prevent spam

## Future Enhancements

- SMS notifications via Twilio
- Push notifications
- Webhook support for Discord/Slack
- Advanced alert conditions (technical indicators)
- Alert scheduling (only during market hours)