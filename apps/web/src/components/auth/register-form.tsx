'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@atomic-ai/ui';
import { Input } from '@atomic-ai/ui';
import Link from 'next/link';

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain uppercase, lowercase, number and special character');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(email, name, password);
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Create Account</h2>
          <p className="text-sm text-gray-400">Join Atomic AI today</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900 bg-opacity-30 p-4 text-sm text-red-400 border border-red-700">
            {error}
          </div>
        )}

        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting || isLoading}
          className="bg-gray-800 text-white placeholder:text-gray-500 border-gray-700"
          required
        />

        <Input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting || isLoading}
          className="bg-gray-800 text-white placeholder:text-gray-500 border-gray-700"
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting || isLoading}
          className="bg-gray-800 text-white placeholder:text-gray-500 border-gray-700"
          required
          helperText="Min 8 chars, uppercase, lowercase, number, special char"
        />

        <Input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSubmitting || isLoading}
          className="bg-gray-800 text-white placeholder:text-gray-500 border-gray-700"
          required
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
          isLoading={isSubmitting}
        >
          Create Account
        </Button>

        <div className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
