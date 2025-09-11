import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { checkAllAlerts, checkUserAlerts } from '@/lib/alertService';
import { testEmailConfiguration } from '@/lib/emailService';
import { simulatePriceMovement, getStockPrice, clearPriceCache, getCacheStatus } from '@/lib/stockPriceService';

// Helper function to verify JWT token (for user-specific checks)
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch {
    throw new Error('Invalid token');
  }
};

// Helper function to get user from token
const getUserFromToken = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
};

// POST - Trigger alert checking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, symbol, targetPrice } = body;

    console.log('Alert check API called with action:', action);

    // Different actions for alert checking
    switch (action) {
      case 'check-all':
        // Check all alerts across all users (for background jobs)
        // In production, this should be protected by an API key or internal service authentication
        const allResults = await checkAllAlerts();
        return NextResponse.json({
          success: true,
          message: 'Alert check completed',
          results: allResults,
        });

      case 'check-user':
        // Check alerts for a specific user (authenticated)
        try {
          const { userId: authenticatedUserId } = getUserFromToken(request);
          const userIdToCheck = userId || authenticatedUserId;
          
          // Users can only check their own alerts unless they're admin
          if (userIdToCheck !== authenticatedUserId) {
            return NextResponse.json(
              { error: 'Unauthorized - can only check your own alerts' },
              { status: 403 }
            );
          }

          const userResults = await checkUserAlerts(userIdToCheck);
          return NextResponse.json({
            success: true,
            message: 'User alert check completed',
            results: userResults,
          });
        } catch (authError) {
          return NextResponse.json(
            { error: 'Authentication required for user-specific checks' },
            { status: 401 }
          );
        }

      case 'test-email':
        // Test email configuration
        const emailValid = await testEmailConfiguration();
        return NextResponse.json({
          success: emailValid,
          message: emailValid ? 'Email configuration is valid' : 'Email configuration failed',
        });

      case 'simulate-price':
        // Simulate price movement for testing (development only)
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: 'Price simulation not available in production' },
            { status: 403 }
          );
        }

        if (!symbol || !targetPrice) {
          return NextResponse.json(
            { error: 'Symbol and targetPrice required for price simulation' },
            { status: 400 }
          );
        }

        simulatePriceMovement(symbol, parseFloat(targetPrice));
        return NextResponse.json({
          success: true,
          message: `Simulated price movement for ${symbol} to $${targetPrice}`,
        });

      case 'test-real-price':
        // Test fetching a real price from Yahoo Finance
        const testSymbol = symbol || 'AAPL';
        const realPrice = await getStockPrice(testSymbol);
        return NextResponse.json({
          success: !!realPrice,
          symbol: testSymbol,
          price: realPrice,
          message: realPrice 
            ? `Successfully fetched real-time price for ${testSymbol}` 
            : `Failed to fetch price for ${testSymbol}`,
        });

      case 'clear-cache':
        // Clear price cache
        clearPriceCache(symbol);
        return NextResponse.json({
          success: true,
          message: symbol 
            ? `Cleared cache for ${symbol}` 
            : 'Cleared all price cache',
        });

      case 'cache-status':
        // Get cache status
        const cacheStatus = getCacheStatus();
        return NextResponse.json({
          success: true,
          cache: cacheStatus,
          message: `Cache contains ${cacheStatus.length} entries`,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: check-all, check-user, test-email, simulate-price, test-real-price, clear-cache, cache-status' },
          { status: 400 }
        );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process alert check';
    console.error('Alert check API error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get alert check status/info
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'test-email') {
      const emailValid = await testEmailConfiguration();
      return NextResponse.json({
        success: true,
        emailConfigured: emailValid,
        message: emailValid ? 'Email service is ready' : 'Email service needs configuration',
      });
    }

    // Default response with API info
    return NextResponse.json({
      success: true,
      message: 'Alert check API is ready',
      availableActions: [
        'check-all - Check all alerts (POST)',
        'check-user - Check alerts for authenticated user (POST)',
        'test-email - Test email configuration (POST/GET)',
        'simulate-price - Simulate price movement for testing (POST, dev only)',
      ],
      emailConfigured: await testEmailConfiguration(),
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get alert check info';
    console.error('Alert check API GET error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}