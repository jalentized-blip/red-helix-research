import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  
  // View state: 'login' | 'register' | 'forgot-password' | 'verify-otp' | 'reset-password'
  const [view, setView] = useState('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          navigate(createPageUrl('Account'));
        }
      } catch (err) {
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
    
    // Check for reset token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('reset_token');
    if (token) {
      setResetToken(token);
      setView('reset-password');
    }
  }, [navigate]);

  // Clear messages when switching views
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [view]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { access_token, user } = await base44.auth.loginViaEmailPassword(
        email.trim().toLowerCase(),
        password
      );
      
      // Token is automatically stored by the SDK
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to account or previous page
      setTimeout(() => {
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        navigate(returnUrl || createPageUrl('Account'));
      }, 1000);
      
    } catch (err) {
      console.error('Login error:', err);
      if (err.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.status === 403) {
        setError('Your account has been disabled. Please contact support.');
      } else if (err.message?.includes('not verified')) {
        setError('Please verify your email before logging in.');
        setView('verify-otp');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await base44.auth.register({
        email: email.trim().toLowerCase(),
        password: password,
        full_name: fullName.trim() || undefined,
      });

      setSuccess('Registration successful! Please check your email for verification code.');
      setView('verify-otp');
      
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message?.includes('already exists') || err.status === 409) {
        setError('An account with this email already exists. Try logging in instead.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await base44.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        otpCode: otpCode.trim(),
      });

      setSuccess('Email verified successfully! You can now log in.');
      setTimeout(() => {
        setView('login');
        setOtpCode('');
      }, 2000);
      
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      await base44.auth.resendOtp(email.trim().toLowerCase());
      setSuccess('Verification code sent! Please check your email.');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await base44.auth.resetPasswordRequest(email.trim().toLowerCase());
      setSuccess('Password reset email sent! Please check your inbox.');
    } catch (err) {
      console.error('Password reset request error:', err);
      setError('Failed to send reset email. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await base44.auth.resetPassword({
        resetToken: resetToken,
        newPassword: newPassword,
      });

      setSuccess('Password reset successful! You can now log in with your new password.');
      setTimeout(() => {
        setView('login');
        setNewPassword('');
        setResetToken('');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. The link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-stone-300">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="pl-10 bg-stone-900/50 border-stone-700 text-amber-50 placeholder:text-stone-500 focus:border-red-600"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-stone-300">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10 pr-10 bg-stone-900/50 border-stone-700 text-amber-50 placeholder:text-stone-500 focus:border-red-600"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setView('forgot-password')}
          className="text-sm text-red-500 hover:text-red-400 transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-amber-50 font-semibold py-3"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="text-center text-stone-400 text-sm">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => setView('register')}
          className="text-red-500 hover:text-red-400 font-semibold transition-colors"
        >
          Create one
        </button>
      </div>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-stone-300">Full Name (optional)</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="pl-10 bg-stone-900/50 border-stone-700 text-amber-50 placeholder:text-stone-500 focus:border-red-600"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="registerEmail" className="text-stone-300">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            id="registerEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="pl-10 bg-stone-900/50 border-stone-700 text-amber-50 placeholder:text-stone-500 focus:border-red-600"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="registerPassword" className="text-stone-300">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            id="registerPassword"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="pl-10 pr-10 bg-stone-900/50 border-stone-700 text-amber-50 placeholder:text-stone-500 focus:border-red-600"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-stone-300">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10 bg-stone-900/50 border-stone-700 text-amber-50 placeholder:text-stone-500 focus:border-red-600"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-amber-50 font-semibold py-3"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <div className="text-center text-stone-400 text-sm">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => setView('login')}
          className="text-red-500 hover:text-red-400 font-semibold transition-colors"
        >
          Sign in
        </button>
      </div>
    </form>
  );

  const renderVerifyOtpForm = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-stone-400 text-sm">
          We sent a verification code to<br />
          <span className="text-amber-50 font-semibold">{email}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otpCode" className="text-stone-300">Verification Code</Label>
        <Input
          id="otpCode"
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          className="text-center text-2xl tracking-widest bg-stone-900/50 border-stone-700 text-amber-50 placeholder:text-stone-500 focus:border-red-600"
          maxLength={6}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading || otpCode.length < 6}
        className="w-full bg-red-600 hover:bg-red-700 text-amber-50 font-semibold py-3"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Email'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={loading}
          className="text-sm text-red-500 hover:text-red-400 transition-colors"
        >
          Didn't receive a code? Resend
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-stone-400 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resetEmail" className="text-stone-300">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            id="resetEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="pl-10 bg-stone-900/50 border-stone-700 text-amber-50 placeholder:text-stone-500 focus:border-red-600"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-amber-50 font-semibold py-3"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Reset Link'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setView('login')}
          className="text-sm text-stone-400 hover:text-stone-300 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>
      </div>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-stone-400 text-sm">
          Enter your new password below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-stone-300">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="pl-10 pr-10 bg-stone-900/50 border-stone-700 text-amber-50 placeholder:text-stone-500 focus:border-red-600"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-amber-50 font-semibold py-3"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Resetting...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>
    </form>
  );

  const getTitle = () => {
    switch (view) {
      case 'register': return 'Create Account';
      case 'verify-otp': return 'Verify Email';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'New Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'register': return 'Join Red Helix Research';
      case 'verify-otp': return 'Check your inbox';
      case 'forgot-password': return 'We\'ll help you recover';
      case 'reset-password': return 'Choose a strong password';
      default: return 'Sign in to your account';
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back to Home */}
        <Link 
          to={createPageUrl('Home')} 
          className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-50 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-2xl p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-black text-amber-50">RH</span>
            </div>
            <h1 className="text-2xl font-black text-amber-50">{getTitle()}</h1>
            <p className="text-stone-400 text-sm mt-1">{getSubtitle()}</p>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-600/10 border border-red-600/30 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence mode="wait">
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-600/10 border border-green-600/30 rounded-lg flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-400 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'login' && renderLoginForm()}
              {view === 'register' && renderRegisterForm()}
              {view === 'verify-otp' && renderVerifyOtpForm()}
              {view === 'forgot-password' && renderForgotPasswordForm()}
              {view === 'reset-password' && renderResetPasswordForm()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-stone-500 text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
