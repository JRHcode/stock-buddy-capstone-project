import { NextRequest, NextResponse } from 'next/server';
import { checkAllAlerts } from '@/lib/alertService';

// This endpoint can be called by external cron services like:
// - Vercel Cron Jobs
// - GitHub Actions 
// - External cron services
// - Manual testing

export async function GET(request: NextRequest) {
  try {
    console.log('Cron job triggered - checking all alerts');
    
    // Verify this is a legitimate cron request
    // In production, you'd want to add authentication here
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && (!authHeader || authHeader !== `Bearer ${cronSecret}`)) {
      console.warn('Unauthorized cron request blocked');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const startTime = Date.now();
    
    // Run the alert checking process
    const results = await checkAllAlerts();
    
    const duration = Date.now() - startTime;
    
    console.log(`Cron job completed in ${duration}ms:`, results);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Cron job failed';
    console.error('Cron job error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Support POST as well for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}