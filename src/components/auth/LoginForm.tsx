'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [needsVerification, setNeedsVerification] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { login, loading, error: authError } = useAuthContext();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setErrors({ general: 'Verification email sent! Please check your inbox and spam folder.' });
      } else {
        setErrors({ general: data.error || 'Failed to resend verification email.' });
      }
    } catch (error) {
      setErrors({ general: 'Failed to resend verification email. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErrors({ general: 'Please enter your email address first.' });
      return;
    }

    setIsResettingPassword(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setErrors({ general: 'Password reset email sent! Please check your inbox and spam folder.' });
        setShowResetButton(false);
      } else {
        setErrors({ general: data.error || 'Failed to send password reset email.' });
      }
    } catch (error) {
      setErrors({ general: 'Failed to send password reset email. Please try again.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setNeedsVerification(false);
    setShowResetButton(false);

    if (!validateForm()) return;

    const success = await login(email, password);
    
    if (success) {
      router.push('/dashboard');
    } else {
      // Check if it's an email verification error
      if (authError && authError.includes('verify your email')) {
        setNeedsVerification(true);
        setErrors({ general: authError });
      } else {
        setErrors({ general: authError || 'Invalid email or password. Please check your credentials and try again.' });
        setShowResetButton(true); // Show reset button on login failure
      }
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900">Sign In</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {errors.general && (
          <div className={`border px-4 py-3 rounded-md ${
            errors.general.includes('sent!') 
              ? 'bg-green-50 border-green-200 text-green-600' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {errors.general}
            {needsVerification && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={handleResendVerification}
                  isLoading={isResending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="Enter your password"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
        >
          Sign In
        </Button>

        {showResetButton && (
          <Button
            type="button"
            onClick={handlePasswordReset}
            isLoading={isResettingPassword}
            variant="outline"
            className="w-full"
          >
            {isResettingPassword ? 'Sending Reset Email...' : 'Reset Password'}
          </Button>
        )}

        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
            Back to home
          </Link>
        </div>
      </form>
    </div>
  );
}