import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AgeGate() {
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSignIn, setIsSignIn] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [ageConfirmLoading, setAgeConfirmLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in and verified
    const checkExistingUser = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          if (user.age_verified) {
            navigate(createPageUrl('Home'));
          } else if (user.email) {
            // User is logged in but not age verified - show verification form
            setIsVerified(true);
          }
        }
      } catch {
        // Not logged in, show age gate
      } finally {
        setLoading(false);
      }
    };

    checkExistingUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  const handleAgeConfirm = async (confirmed) => {
    if (!confirmed) {
      window.location.href = 'https://www.google.com';
      return;
    }
    
    setAgeConfirmLoading(true);
    try {
      const user = await base44.auth.me();
      if (user) {
        // User is logged in, update age verification
        await base44.auth.updateMe({
          age_verified: true,
          age_verified_date: new Date().toISOString()
        });
        navigate(createPageUrl('Home'));
      } else {
        // Not logged in, show sign in form
        setIsVerified(true);
        setAgeConfirmLoading(false);
      }
    } catch {
      // Not logged in, show sign in form
      setIsVerified(true);
      setAgeConfirmLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setAuthLoading(true);
    try {
      // Invite user (they'll get signup email with link)
      await base44.users.inviteUser(email, 'user');
      setError('');
      setEmail('');
      setPassword('');
      setIsSignIn(true);
      alert('Signup successful! Please check your email to complete your registration, then sign in here.');
    } catch (err) {
      setError('Email already exists or invalid. Try signing in instead.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setAuthLoading(true);
    try {
      // Just redirect to login page - Base44 will handle authentication
      await base44.auth.redirectToLogin();
    } catch (err) {
      setError('Sign in failed. Please try again.');
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      await base44.auth.requestPasswordReset(email);
      setResetSuccess(true);
    } catch (err) {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 text-center space-y-6">
            <div>
              <h1 className="text-4xl font-black text-amber-50 mb-2">Age Verification</h1>
              <p className="text-stone-400">Red Dirt Research</p>
            </div>

            <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-4">
              <p className="text-red-100 text-sm">
                You must be 21 years or older to access this website and purchase research peptides.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleAgeConfirm(true)}
                disabled={ageConfirmLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-amber-50 text-lg py-6"
              >
                {ageConfirmLoading ? 'Verifying...' : "I'm 21 or Older"}
              </Button>
              <Button
                onClick={() => handleAgeConfirm(false)}
                disabled={ageConfirmLoading}
                variant="outline"
                className="w-full border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 text-lg py-6"
              >
                I'm Under 21
              </Button>
            </div>

            <p className="text-stone-500 text-xs">
              By confirming, you agree that you are at least 21 years old.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-black text-amber-50 mb-2">Reset Password</h1>
              <p className="text-stone-400">Enter your email to receive a reset link</p>
            </div>

            {resetSuccess ? (
              <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4 text-center space-y-3">
                <p className="text-green-300 font-semibold">Check your email</p>
                <p className="text-stone-300 text-sm">We've sent a password reset link to {email}. Check your inbox and follow the link to reset your password.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-amber-50 text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600"
                  />
                </div>

                {error && (
                  <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-amber-50 text-lg py-6"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}

            <div className="text-center">
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetSuccess(false);
                  setError('');
                  setEmail('');
                }}
                className="text-stone-400 hover:text-amber-50 text-sm underline transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-black text-amber-50 mb-2">
              {isSignIn ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-stone-400">
              {isSignIn ? 'Welcome back' : 'Sign up to access our peptide catalog'}
            </p>
          </div>

          <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-4">
            <div>
              <label className="block text-amber-50 text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-amber-50 text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600"
              />
            </div>

            {isSignIn && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setPassword('');
                  }}
                  className="text-stone-400 hover:text-amber-50 text-xs underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-amber-50 text-sm">Stay logged in to skip age verification</span>
            </label>

            {error && (
              <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={authLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-amber-50 text-lg py-6"
            >
              {authLoading ? 'Processing...' : (isSignIn ? 'Sign In & Continue' : 'Sign Up & Continue')}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsSignIn(!isSignIn);
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="text-stone-400 hover:text-amber-50 text-sm underline transition-colors"
            >
              {isSignIn ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <p className="text-stone-500 text-xs text-center">
            {isSignIn ? 'Sign in to access your account' : 'By signing up, you confirm you are 21 years or older.'}
          </p>
        </div>
      </div>
    </div>
  );
}