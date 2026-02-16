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
  CheckCircle,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';

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
      
      setSuccess('Login successful! Redirecting...');
      
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
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
        <div className="relative">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="researcher@institution.com"
            className="peer pl-14 bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
            required
          />
          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 peer-focus:opacity-0 transition-opacity" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="peer pl-14 pr-14 bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
            required
          />
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 peer-focus:opacity-0 transition-opacity" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#dc2626] transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setView('forgot-password')}
          className="text-xs font-black text-[#dc2626] uppercase tracking-widest hover:text-[#b91c1c] transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            Authenticating...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm font-medium text-slate-500">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setView('register')}
            className="text-[#dc2626] font-black uppercase tracking-widest hover:text-red-700 transition-colors"
          >
            Create one
          </button>
        </p>
      </div>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-5">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
        <div className="relative">
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="peer pl-14 bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
          />
          <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 peer-focus:opacity-0 transition-opacity" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
        <div className="relative">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="researcher@institution.com"
            className="peer pl-14 bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
            required
          />
          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 peer-focus:opacity-0 transition-opacity" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="peer pl-14 pr-14 bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
            required
          />
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 peer-focus:opacity-0 transition-opacity" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#dc2626] transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm Password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="peer pl-14 bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
            required
          />
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 peer-focus:opacity-0 transition-opacity" />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            Creating Account...
          </>
        ) : (
          'Register Account'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setView('login')}
            className="text-[#dc2626] font-black uppercase tracking-widest hover:text-red-700 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );

  const renderVerifyOtpForm = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-slate-500 font-medium">
          We sent a verification code to<br />
          <span className="text-slate-900 font-black">{email}</span>
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Verification Code</label>
        <div className="relative max-w-[200px] mx-auto">
          <Input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="peer text-center tracking-[0.5em] font-black text-2xl h-16 bg-slate-50 border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all"
            required
            maxLength={6}
          />
          <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 peer-focus:opacity-0 transition-opacity" />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || otpCode.length < 6}
        className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
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
          className="text-xs font-black text-[#dc2626] uppercase tracking-widest hover:text-red-700 transition-colors"
        >
          Didn't receive a code? Resend
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-slate-500 font-medium">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="researcher@institution.com"
            className="pl-14 bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
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
          className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>
      </div>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-slate-500 font-medium">
          Enter your new password below.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Password</label>
        <div className="relative">
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <Input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="pl-14 pr-14 bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#dc2626] transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            Resetting...
          </>
        ) : (
          'Update Password'
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <SEO 
        title={`${getTitle()} - Red Helix Research`}
        description="Secure researcher portal for Red Helix Research. Access your laboratory orders, tracking, and COA documentation."
      />

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[#dc2626] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[-10%] w-[600px] h-[600px] bg-slate-600 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Back to Home */}
        <Link 
          to={createPageUrl('Home')} 
          className="inline-flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-[#dc2626] mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Laboratory Home
        </Link>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          {/* Subtle logo accent */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
            <ShieldCheck className="w-48 h-48 text-slate-900" />
          </div>

          {/* Logo / Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="w-20 h-20 bg-[#dc2626] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100 rotate-3">
              <span className="text-3xl font-black text-white">RH</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
              {getTitle().split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? "text-[#dc2626]" : ""}>{word} </span>
              ))}
            </h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{getSubtitle()}</p>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-6 bg-[#dc2626] border border-red-500 rounded-2xl flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
                <p className="text-sm font-bold text-white uppercase tracking-tight leading-tight">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-6 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-4"
              >
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-sm font-bold text-green-600 uppercase tracking-tight leading-tight">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content */}
          <div className="relative z-10">
            {view === 'login' && renderLoginForm()}
            {view === 'register' && renderRegisterForm()}
            {view === 'verify-otp' && renderVerifyOtpForm()}
            {view === 'forgot-password' && renderForgotPasswordForm()}
            {view === 'reset-password' && renderResetPasswordForm()}
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-8 text-center">
          <Link 
            to={createPageUrl('Contact')}
            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#dc2626] transition-colors"
          >
            Need technical assistance? Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
