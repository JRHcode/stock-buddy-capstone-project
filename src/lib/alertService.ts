import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getMultipleStockPrices, StockPrice } from '@/lib/stockPriceService';
import { sendAlertEmail, AlertEmailData } from '@/lib/emailService';
import { IAlert } from '@/models/User';

export interface AlertCheckResult {
  totalAlertsChecked: number;
  alertsTriggered: number;
  emailsSent: number;
  errors: string[];
}

// Check if an alert condition is met
const isAlertTriggered = (alert: IAlert, currentPrice: number): boolean => {
  if (!alert.isActive) {
    return false;
  }

  switch (alert.condition) {
    case 'above':
      return currentPrice > alert.targetValue;
    case 'below':
      return currentPrice < alert.targetValue;
    case 'change':
      // For 'change' condition, trigger if price moved more than targetValue percent
      if (alert.currentValue) {
        const changePercent = Math.abs((currentPrice - alert.currentValue) / alert.currentValue * 100);
        return changePercent > alert.targetValue;
      }
      return false;
    default:
      return false;
  }
};

// Process alerts for a single user
const processUserAlerts = async (userId: string, stockPrices: Record<string, StockPrice | null>): Promise<{
  triggeredCount: number;
  emailsSent: number;
  errors: string[];
}> => {
  let triggeredCount = 0;
  let emailsSent = 0;
  const errors: string[] = [];

  try {
    const user = await User.findById(userId);
    if (!user || !user.alerts) {
      return { triggeredCount, emailsSent, errors };
    }

    const alertsToUpdate: IAlert[] = [];
    
    for (const alert of user.alerts) {
      if (!alert.isActive) {
        continue;
      }

      const stockPrice = stockPrices[alert.symbol];
      if (!stockPrice) {
        errors.push(`No price data available for ${alert.symbol}`);
        continue;
      }

      // Check if alert should be triggered
      if (isAlertTriggered(alert, stockPrice.price)) {
        console.log(`Alert triggered for user ${user.email}: ${alert.symbol} ${alert.condition} ${alert.targetValue}`);
        
        triggeredCount++;

        // Update alert status
        alert.isActive = false; // Disable to prevent spam
        alert.triggeredAt = new Date();
        alert.currentValue = stockPrice.price;

        alertsToUpdate.push(alert);

        // Send email notification
        try {
          const emailData: AlertEmailData = {
            userEmail: user.email,
            userName: user.name,
            symbol: alert.symbol,
            condition: alert.condition,
            targetValue: alert.targetValue,
            currentValue: stockPrice.price,
            triggeredAt: alert.triggeredAt,
          };

          const emailSent = await sendAlertEmail(emailData);
          if (emailSent) {
            emailsSent++;
            console.log(`Alert email sent to ${user.email} for ${alert.symbol}`);
          } else {
            errors.push(`Failed to send email to ${user.email} for ${alert.symbol}`);
          }
        } catch (emailError) {
          errors.push(`Email error for ${user.email}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
        }
      } else {
        // Update current value even if not triggered (for tracking)
        alert.currentValue = stockPrice.price;
        alertsToUpdate.push(alert);
      }
    }

    // Save updated alerts to database
    if (alertsToUpdate.length > 0) {
      await user.save();
      console.log(`Updated ${alertsToUpdate.length} alerts for user ${user.email}`);
    }

  } catch (error) {
    const errorMsg = `Error processing alerts for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    errors.push(errorMsg);
  }

  return { triggeredCount, emailsSent, errors };
};

// Main function to check all alerts across all users
export const checkAllAlerts = async (): Promise<AlertCheckResult> => {
  console.log('Starting alert check process...');
  
  const result: AlertCheckResult = {
    totalAlertsChecked: 0,
    alertsTriggered: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    await connectToDatabase();

    // Get all users with active alerts
    const usersWithAlerts = await User.find({
      'alerts.isActive': true,
    }).select('_id name email alerts');

    if (usersWithAlerts.length === 0) {
      console.log('No users with active alerts found');
      return result;
    }

    console.log(`Found ${usersWithAlerts.length} users with active alerts`);

    // Collect all unique symbols from all alerts
    const allSymbols = new Set<string>();
    let totalActiveAlerts = 0;

    for (const user of usersWithAlerts) {
      for (const alert of user.alerts) {
        if (alert.isActive) {
          allSymbols.add(alert.symbol);
          totalActiveAlerts++;
        }
      }
    }

    result.totalAlertsChecked = totalActiveAlerts;
    console.log(`Found ${totalActiveAlerts} active alerts for ${allSymbols.size} unique symbols`);

    if (allSymbols.size === 0) {
      return result;
    }

    // Fetch current prices for all symbols
    console.log('Fetching current stock prices...');
    const stockPrices = await getMultipleStockPrices(Array.from(allSymbols));
    
    // Process alerts for each user
    for (const user of usersWithAlerts) {
      const userResult = await processUserAlerts(user._id.toString(), stockPrices);
      result.alertsTriggered += userResult.triggeredCount;
      result.emailsSent += userResult.emailsSent;
      result.errors.push(...userResult.errors);
    }

    console.log(`Alert check complete. Checked: ${result.totalAlertsChecked}, Triggered: ${result.alertsTriggered}, Emails sent: ${result.emailsSent}`);
    
    if (result.errors.length > 0) {
      console.error(`Errors during alert processing:`, result.errors);
    }

  } catch (error) {
    const errorMsg = `Fatal error during alert check: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
  }

  return result;
};

// Check alerts for a specific user (useful for testing)
export const checkUserAlerts = async (userId: string): Promise<AlertCheckResult> => {
  console.log(`Checking alerts for user: ${userId}`);
  
  const result: AlertCheckResult = {
    totalAlertsChecked: 0,
    alertsTriggered: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    await connectToDatabase();

    const user = await User.findById(userId).select('name email alerts');
    if (!user || !user.alerts) {
      console.log('User not found or has no alerts');
      return result;
    }

    // Count active alerts
    const activeAlerts = user.alerts.filter(alert => alert.isActive);
    result.totalAlertsChecked = activeAlerts.length;

    if (activeAlerts.length === 0) {
      console.log('No active alerts for this user');
      return result;
    }

    // Get unique symbols for this user
    const symbols = [...new Set(activeAlerts.map(alert => alert.symbol))];
    console.log(`Fetching prices for ${symbols.length} symbols for user ${user.email}`);

    // Fetch current prices
    const stockPrices = await getMultipleStockPrices(symbols);
    
    // Process user's alerts
    const userResult = await processUserAlerts(userId, stockPrices);
    result.alertsTriggered = userResult.triggeredCount;
    result.emailsSent = userResult.emailsSent;
    result.errors = userResult.errors;

    console.log(`User alert check complete for ${user.email}. Triggered: ${result.alertsTriggered}, Emails sent: ${result.emailsSent}`);

  } catch (error) {
    const errorMsg = `Error checking alerts for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
  }

  return result;
};