"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Key,
  QrCode,
  Check,
  TrendingUp,
} from 'lucide-react';
import { FindoraLogo } from '@/components/brand/FindoraLogo';

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid student/campus email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  email: z.string().email({ message: 'Enter a valid university email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rollNo: z.string().optional(),
  department: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthSideBySideProps {
  initialMode?: 'login' | 'register';
}

export function AuthSideBySide({ initialMode = 'login' }: AuthSideBySideProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/';

  // Active view: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Status and loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Registration Multi-Stage
  const [regStage, setRegStage] = useState<'idle' | 'creating' | 'signing-in' | 'success'>('idle');
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Forms
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    watch: watchLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    watch: watchReg,
    formState: { errors: registerErrors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const regName = watchReg('username');
  const regEmail = watchReg('email');
  const regPassword = watchReg('password') || '';
  const loginEmail = watchLogin('email');

  // Submit Handlers
  async function onLogin(data: LoginForm) {
    setLoginError(null);
    setLoginLoading(true);
    try {
      await auth.login({ email: data.email, password: data.password });
      setLoginSuccess(true);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 700);
    } catch (err: any) {
      setLoginError(err?.message || 'Invalid credentials or connection error');
    } finally {
      setLoginLoading(false);
    }
  }

  async function onRegister(data: RegisterForm) {
    setRegisterError(null);
    setRegStage('creating');
    try {
      await auth.register({
        email: data.email,
        username: data.username,
        password: data.password,
        rollNo: data.rollNo || undefined,
        department: data.department || undefined,
      });

      setRegStage('signing-in');
      await auth.login({ email: data.email, password: data.password });

      setRegStage('success');
      setTimeout(() => {
        router.push(redirectUrl);
      }, 900);
    } catch (err: any) {
      setRegisterError(err?.message || 'Registration failed. Please check your details.');
      setRegStage('idle');
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF2FC] flex flex-col justify-center items-center py-6 sm:py-12 px-3 sm:px-6 relative overflow-hidden font-sans">
      
      {/* Decorative Background Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(24,72,224,0.15)] overflow-hidden border border-slate-100 z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* ============================================================== */}
        {/* LEFT SECTION: FORM AREA (7 COLS)                              */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Navigation & Visible Slider Bar */}
            <div className="flex items-center justify-between gap-3 mb-8">
              {/* Back to Home Button */}
              <Link
                href="/"
                className="w-10 h-10 rounded-full border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-400 bg-white shadow-sm transition-all active:scale-95 shrink-0"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              {/* VISIBLE SLIDER CONTROLLER */}
              <div className="relative inline-flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/80 shadow-inner select-none">
                {/* Smooth Glider Thumb */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-md transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeTab === 'login' ? 'translate-x-0' : 'translate-x-full'
                  }`}
                />
                
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`relative z-10 px-4 sm:px-5 py-1.5 text-xs font-bold rounded-full transition-colors duration-200 ${
                    activeTab === 'login' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`relative z-10 px-4 sm:px-5 py-1.5 text-xs font-bold rounded-full transition-colors duration-200 ${
                    activeTab === 'register' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Quick Switch Text Link */}
              <div className="text-xs text-slate-500 text-right whitespace-nowrap hidden sm:block">
                {activeTab === 'register' ? (
                  <>
                    Already member?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-blue-600 font-bold hover:underline ml-1"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    No account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-blue-600 font-bold hover:underline ml-1"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Form Titles */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'register' ? 'Sign Up' : 'Sign In'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                {activeTab === 'register'
                  ? 'Secure Your Campus Belongings with Findora'
                  : 'Welcome back to Findora campus recovery'}
              </p>
            </div>

            {/* Notifications / Errors */}
            {loginError && activeTab === 'login' && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && activeTab === 'login' && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified! Directing to your campus listings...</span>
              </div>
            )}

            {registerError && activeTab === 'register' && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            {regStage === 'success' && activeTab === 'register' && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Account created! Logging you in...</span>
              </div>
            )}

            {/* ========================================================== */}
            {/* SIGN IN FORM                                               */}
            {/* ========================================================== */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center border-b border-slate-200 focus-within:border-blue-600 transition-colors pb-2">
                    <Mail className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                    <input
                      type="email"
                      placeholder="Campus Email"
                      {...loginRegister('email')}
                      className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    {loginEmail && loginEmail.includes('@') && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                    )}
                  </div>
                  {loginErrors.email && (
                    <p className="text-xs text-rose-500">{loginErrors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center border-b border-slate-200 focus-within:border-blue-600 transition-colors pb-2">
                    <Lock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Password"
                      {...loginRegister('password')}
                      className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-slate-400 hover:text-slate-600 ml-2 shrink-0"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs text-rose-500">{loginErrors.password.message}</p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginLoading || loginSuccess}
                    className="w-full sm:w-auto min-w-[180px] py-3.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {loginLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* ========================================================== */
              /* SIGN UP FORM                                               */
              /* ========================================================== */
              <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center border-b border-slate-200 focus-within:border-blue-600 transition-colors pb-2">
                    <User className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      {...regRegister('username')}
                      className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    {regName && regName.length >= 3 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                    )}
                  </div>
                  {registerErrors.username && (
                    <p className="text-xs text-rose-500">{registerErrors.username.message}</p>
                  )}
                </div>

                {/* University Email */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center border-b border-slate-200 focus-within:border-blue-600 transition-colors pb-2">
                    <Mail className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                    <input
                      type="email"
                      placeholder="University Email"
                      {...regRegister('email')}
                      className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    {regEmail && regEmail.includes('@') && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                    )}
                  </div>
                  {registerErrors.email && (
                    <p className="text-xs text-rose-500">{registerErrors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center border-b border-slate-200 focus-within:border-blue-600 transition-colors pb-2">
                    <Lock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="Password"
                      {...regRegister('password')}
                      className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="text-slate-400 hover:text-slate-600 ml-2 shrink-0"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="text-xs text-rose-500">{registerErrors.password.message}</p>
                  )}
                </div>

                {/* Password Strength Checklist */}
                <div className="space-y-1 text-xs text-slate-400 pt-1">
                  <div className={`flex items-center space-x-1.5 ${regPassword.length >= 6 ? 'text-emerald-600 font-medium' : ''}`}>
                    <Check className={`w-3.5 h-3.5 ${regPassword.length >= 6 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>Least 6 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${regEmail && regEmail.includes('@') ? 'text-emerald-600 font-medium' : ''}`}>
                    <Check className={`w-3.5 h-3.5 ${regEmail && regEmail.includes('@') ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>Campus email format</span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={regStage !== 'idle'}
                    className="w-full sm:w-auto min-w-[180px] py-3.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {regStage !== 'idle' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign Up</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Brand Marker */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Findora Smart Campus</span>
            <div className="flex items-center space-x-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Network Active</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT SECTION: SHOWCASE VISUALS & METRIC CARDS (5 COLS)        */}
        {/* ============================================================== */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-10 flex-col justify-between overflow-hidden text-white">
          
          {/* Organic Background Curved Wave Layers */}
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1/4 -left-12 w-72 h-72 bg-blue-400/25 rounded-full blur-2xl pointer-events-none" />
          
          {/* Top Decorative Floating Card (Stats & Activity) - Authentically Tailored to Findora */}
          <div className="relative z-10 w-full pt-4">
            <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-2xl max-w-[285px] ml-auto transform -rotate-1 hover:rotate-0 transition-transform duration-300 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Campus Recoveries
                </span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  94.8% Rate
                </span>
              </div>

              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  1,420<span className="text-blue-600">+</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Items safely reclaimed this semester
                </p>
              </div>

              {/* Clean Smooth Trend Line with Gradient Area */}
              <div className="relative h-14 mt-3 w-full">
                <svg viewBox="0 0 200 50" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Subtle Gradient Area Fill */}
                  <path
                    d="M 5 45 Q 40 38, 70 32 T 130 18 T 195 10 L 195 50 L 5 50 Z"
                    fill="url(#chartGrad)"
                  />
                  {/* Active Spline Line */}
                  <path
                    d="M 5 45 Q 40 38, 70 32 T 130 18 T 195 10"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Active Pinpoint ON the curve */}
                  <circle cx="130" cy="18" r="4.5" fill="#2563EB" />
                  <circle cx="130" cy="18" r="9" fill="#2563EB" opacity="0.2" className="animate-ping" />
                  <circle cx="195" cy="10" r="4.5" fill="#10B981" />
                </svg>
              </div>

              <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Wallets • IDs • Tech</span>
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" /> +18% MoM
                </span>
              </div>
            </div>
          </div>

          {/* Middle Decorative Badges */}
          <div className="relative z-10 flex items-center justify-end space-x-2.5 my-3 pr-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-white text-xs font-semibold shadow-lg border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Smart AI Matching</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-white text-xs font-semibold shadow-lg border border-white/20">
              <QrCode className="w-3.5 h-3.5 text-blue-200" />
              <span>1-Time QR Handover</span>
            </div>
          </div>

          {/* Bottom Floating Card: "Your data, your rules" */}
          <div className="relative z-10 w-full pb-2">
            <div className="bg-white text-slate-900 p-5 rounded-3xl shadow-2xl max-w-[295px] mr-auto transform rotate-1 hover:rotate-0 transition-transform duration-300 border border-slate-100">
              <div className="flex items-center space-x-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    Privacy-First Returns
                  </h3>
                  <span className="text-[10px] font-semibold text-blue-600">
                    Encrypted Ownership Proof
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Serial numbers & secret marks remain hidden. Single-use QR authorization tokens verify in-person handovers.
              </p>
              
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  ✓ AI-Assisted Matches
                </span>
                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  ✓ 1-Time QR Token
                </span>
              </div>
            </div>

            <div className="mt-6 text-[11px] text-blue-200/80 text-center font-medium">
              Findora Campus Lost & Found • University Verified
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
