import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@123.com');
  const [password, setPassword] = useState('Pass123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const getFriendlyErrorMessage = (err) => {
    const code = err?.code || err?.message || '';
    if (code.includes('auth/invalid-credential') || code.includes('auth/user-not-found') || code.includes('auth/wrong-password')) {
      return 'Invalid email or password. Please check your credentials.';
    }
    if (code.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (code.includes('auth/too-many-requests')) {
      return 'Too many failed attempts. Try again later.';
    }
    return 'Invalid email or password. Please check your credentials.';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both user name and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error("Login error:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#eef7fc] flex items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Curved Card Shell matching media reference */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row min-h-[520px]">
        
        {/* Left Side: Form Area */}
        <div className="w-full md:w-3/5 p-8 sm:p-12 md:p-14 flex flex-col justify-between z-10 bg-white">
          <div className="space-y-6 my-auto max-w-sm w-full mx-auto md:mx-0">
            
            {/* Header Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2a4393] tracking-wide uppercase">
              SIGN IN
            </h1>

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-6 pt-2">
              
              {/* User Name / Email field with bottom border */}
              <div className="relative border-b border-slate-300 focus-within:border-[#2a4393] transition-colors pb-1">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <User className="w-4 h-4 shrink-0 text-slate-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user name"
                    className="w-full bg-transparent text-slate-700 placeholder-slate-400 text-sm focus:outline-none py-1.5"
                  />
                </div>
              </div>

              {/* Password field with bottom border */}
              <div className="relative border-b border-slate-300 focus-within:border-[#2a4393] transition-colors pb-1">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Lock className="w-4 h-4 shrink-0 text-slate-600" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full bg-transparent text-slate-700 placeholder-slate-400 text-sm focus:outline-none py-1.5"
                  />
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#212c75] to-[#1c235b] hover:from-[#1b2460] hover:to-[#161c48] text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-900/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : 'Login'}
                </button>
              </div>

              {/* Options: Remember & Signup / Forgot password */}
              <div className="space-y-3 pt-1 text-xs text-[#2a4393] font-medium">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#2a4393] focus:ring-[#2a4393] border-slate-400"
                    />
                    <span>Remember</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      alert("Self-signup is disabled. Please contact your system administrator.");
                    }}
                    className="hover:underline cursor-pointer font-medium text-[#2a4393]"
                  >
                    Signup
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotSubmitted(false);
                      setShowForgotModal(true);
                    }}
                    className="hover:underline cursor-pointer text-[#2a4393]"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

            </form>

          </div>

          {/* Copyright text */}
          <div className="text-[10px] text-slate-400 mt-8 text-center md:text-left">
            Copyright ©2026 ATHAHAR ROADWAYS. All rights reserved.
          </div>
        </div>

        {/* Right Side: Deep Blue Curved Overlay Container */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-[#293796] via-[#1f2873] to-[#161a52] relative overflow-hidden flex items-center justify-center p-8 min-h-[220px] md:min-h-full">
          
          {/* S-Curve Divider Effect */}
          <div className="hidden md:block absolute -left-12 top-0 bottom-0 w-24 bg-white rounded-r-[100px] pointer-events-none transform scale-y-125"></div>

          {/* Abstract Floating Shapes (Geometrics matching media image) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {/* Wavy Line */}
            <svg className="absolute top-12 left-12 w-16 h-16 text-cyan-200 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M 2 12 Q 6 4 10 12 T 18 12" />
            </svg>

            {/* Plus Icon 1 */}
            <div className="absolute top-1/3 left-1/4 text-3xl font-light text-cyan-200">+</div>

            {/* Large Circle */}
            <div className="absolute bottom-12 right-6 w-36 h-36 border-2 border-cyan-200/50 rounded-full flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/40 to-transparent rounded-full"></div>
            </div>

            {/* Small Circles */}
            <div className="absolute top-10 right-16 w-10 h-10 border border-cyan-200/60 rounded-full"></div>
            <div className="absolute top-1/2 right-12 w-4 h-4 border border-cyan-200/60 rounded-full"></div>
            <div className="absolute bottom-1/3 left-12 w-5 h-5 border border-cyan-200/60 rounded-full"></div>

            {/* Plus Icon 2 */}
            <div className="absolute bottom-16 left-1/3 text-2xl font-light text-cyan-200">+</div>

            {/* Triangle */}
            <svg className="absolute bottom-10 left-10 w-8 h-8 text-cyan-200 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
              <polygon points="12,2 2,22 22,22" />
            </svg>
          </div>

          {/* Center Brand Badge */}
          <div className="relative z-10 text-center text-white space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-xl">
              <span className="text-2xl font-black text-cyan-300">AR</span>
            </div>
            <h2 className="text-xl font-black tracking-wide text-white uppercase">ATHAHAR ROADWAYS</h2>
            <p className="text-xs text-cyan-200 font-medium max-w-[220px] mx-auto leading-tight">NEXT TO PARVATI CRANE, VAKHAR BHAG, SANGLI-416416</p>
          </div>

        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#2a4393] flex items-center gap-2">
                <Lock className="w-4 h-4" /> Reset Password
              </h3>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900">Password Reset Email Sent!</p>
                <p className="text-[11px] text-emerald-700">
                  If an account exists for <span className="font-mono font-bold">{forgotEmail}</span>, you will receive instructions to reset your password.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your registered user email address below to receive password reset instructions.
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-700">Work Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@123.com"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2a4393]/30"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2a4393] hover:bg-[#203373] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
