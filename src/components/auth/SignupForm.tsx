'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string; 
    general?: string 
  }>({});
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const { signup, loading } = useAuthContext(); // ← This gives us 'loading'
  const router = useRouter();

  const validateForm = () => {
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setShowVerificationMessage(false);

    if (!validateForm()) return;

    const result = await signup(name, email, password);
    
    if (result) {
      if (result.requiresVerification) {
        // Show verification message instead of redirecting
        setShowVerificationMessage(true);
      } else if (result.user) {
        // Only redirect if email verification not required
        router.push('/dashboard');
      }
    } else {
      setErrors({ general: 'An account with this email already exists.' });
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification email to <strong>{email}</strong>. 
            Please check your inbox and click the verification link to activate your account.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                type="button" 
                className="text-blue-600 hover:text-blue-500 underline"
                onClick={() => setShowVerificationMessage(false)}
              >
                try signing up again
              </button>
            </p>
            <Link 
              href="/auth/login" 
              className="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Go to Login Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900">Create Account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Enter your full name"
          />

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
            placeholder="Create a password"
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={loading} // ← Changed from isLoading to loading
        >
          Create Account
        </Button>

        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
            Back to home
          </Link>
        </div>
      </form>
    </div>
  );
}