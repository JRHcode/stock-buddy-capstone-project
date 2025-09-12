'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          // Redirect to login after 3 seconds
          setTimeout(() => router.push('/auth/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResendEmail = async () => {
    // Extract email from token if possible, or ask user to enter email
    // For now, redirect to login where they can request resend
    router.push('/auth/login?resend=true');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-md w-full bg-white dark:bg-dark-surface p-8 rounded-lg shadow dark:shadow-lg border dark:border-dark-border">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
              Verifying your email...
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Please wait while we verify your account.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
              Email Verified Successfully!
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
              Redirecting to login page in 3 seconds...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? 'Redirecting...' : 'Request New Verification Email'}
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Signup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}