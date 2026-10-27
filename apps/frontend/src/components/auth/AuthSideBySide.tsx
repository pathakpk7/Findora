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
  Building,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  QrCode,
  Zap,
} from 'lucide-react';
import { HideAndSeekMascot, MascotState } from './HideAndSeekMascot';
import { LostAndFoundCanvas } from './LostAndFoundCanvas';
import { FindoraLogo } from '@/components/brand/FindoraLogo';

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid student/campus email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Enter a valid university email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rollNo: z.string().optional(),
  department: z.string().optional(),
  year: z.coerce.number().min(1).max(6).optional(),
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

  // Responsive active view for mobile screens
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Focus tracking for Hide & Seek animation
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Status and loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Registration Multi-Stage: idle | creating | signing-in | success
  const [regStage, setRegStage] = useState<'idle' | 'creating' | 'signing-in' | 'success'>('idle');
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Forms
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Calculate dynamic Mascot state for Hide & Seek animations
  const getMascotState = (): MascotState => {
    if (loginSuccess || regStage === 'success') return 'success';
    if (focusedField === 'login-password') {
      return showLoginPassword ? 'password-revealed' : 'password-hidden';
    }
    if (focusedField === 'register-password') {
      return showRegisterPassword ? 'password-revealed' : 'password-hidden';
    }
    if (focusedField) return 'text-focused';
    return 'idle';
  };

  // Login Handler
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

  // Registration Handler: Creates Account First, Then Signs In!
  async function onRegister(data: RegisterForm) {
    setRegisterError(null);
    setRegStage('creating');
    try {
      // Step 1: Create Account in database first
      await auth.register({
        email: data.email,
        username: data.username,
        password: data.password,
        rollNo: data.rollNo || undefined,
        department: data.department || undefined,
        year: data.year ? Number(data.year) : undefined,
      });

      // Step 2: Now Sign In with the newly created account
      setRegStage('signing-in');
      await auth.login({ email: data.email, password: data.password });

      // Step 3: Success state & redirect
      setRegStage('success');
      setTimeout(() => {
        router.push(redirectUrl);
      }, 900);
    } catch (err: any) {
      setRegisterError(err?.message || 'Registration failed. Please check your details.');
      setRegStage('idle');
    }
  }

  const mascotState = getMascotState();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Interactive Lost & Found Background Radar & Items */}
      <LostAndFoundCanvas />

      {/* Top Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Top Branding Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10 mb-4">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <FindoraLogo variant="dark" size="md" />
        </Link>

        <Link
          href="/found-items"
          className="text-xs sm:text-sm text-slate-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
        >
          <span>Back to Browse Items</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Interactive Mascot Centerpiece with Hide & Seek Reaction */}
      <div className="z-10 mb-3">
        <HideAndSeekMascot
          state={mascotState}
          activeFieldLabel={focusedField ? focusedField.replace('-', ' ') : undefined}
        />
      </div>

      {/* Mobile Screen Switcher Tabs */}
      <div className="lg:hidden max-w-md mx-auto w-full mb-6 z-10">
        <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 flex backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Main Dual-Panel Side-by-Side Card */}
      <div className="max-w-6xl mx-auto w-full z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-2xl shadow-[0_0_60px_-15px_rgba(37,99,235,0.25)] overflow-hidden">
          
          {/* ============================================================== */}
          {/* LEFT PANEL: SIGN IN                                           */}
          {/* ============================================================== */}
          <div
            className={`p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 transition-all ${
              activeTab === 'login' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 bg-blue-500/15 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-semibold text-blue-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Existing Member</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Sign In to Your Account
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Enter your credentials to claim items, verify found belongings, or scan QR handovers.
                </p>
              </div>

              {loginError && (
                <div className="bg-rose-500/15 border border-rose-500/30 text-rose-200 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Credentials verified! Directing to campus...</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student / University Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@university.edu"
                      {...loginRegister('email')}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="mt-1 text-xs text-rose-400">{loginErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer">
                      Forgot?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...loginRegister('password')}
                      onFocus={() => setFocusedField('login-password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-10 py-3 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="mt-1 text-xs text-rose-400">{loginErrors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loginLoading || loginSuccess}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
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
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Need a student account?</span>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold lg:hidden"
              >
                Switch to Sign Up →
              </button>
              <span className="hidden lg:inline text-slate-500">Fill form on the right →</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT PANEL: SIGN UP / REGISTER                                */}
          {/* ============================================================== */}
          <div
            className={`p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-gradient-to-b from-white/[0.02] to-transparent transition-all ${
              activeTab === 'register' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-300">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>New Student Registration</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Create Campus Account
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  First create your profile, then we sign you in automatically to begin recovering and claiming items.
                </p>
              </div>

              {registerError && (
                <div className="bg-rose-500/15 border border-rose-500/30 text-rose-200 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* Dynamic Stage Notifications (Create First -> Then Sign In) */}
              {regStage === 'creating' && (
                <div className="bg-blue-500/20 border border-blue-400/30 text-blue-200 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 animate-pulse">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span><strong>Step 1 of 2:</strong> Creating your campus account in database...</span>
                </div>
              )}

              {regStage === 'signing-in' && (
                <div className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 animate-pulse">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span><strong>Step 2 of 2:</strong> Account created! Signing you in securely...</span>
                </div>
              )}

              {regStage === 'success' && (
                <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Success!</strong> Account created &amp; logged in. Welcome to Findora!</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name / Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter your name"
                        {...regRegister('username')}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                      />
                    </div>
                    {registerErrors.username && (
                      <p className="mt-1 text-[11px] text-rose-400">{registerErrors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Roll / Student ID No.
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 2026-CS-042"
                        {...regRegister('rollNo')}
                        onFocus={() => setFocusedField('roll-number')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    University Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="your.email@university.edu"
                      {...regRegister('email')}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="mt-1 text-[11px] text-rose-400">{registerErrors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Department
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        {...regRegister('department')}
                        onFocus={() => setFocusedField('department')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Academic Year
                    </label>
                    <select
                      {...regRegister('year')}
                      onFocus={() => setFocusedField('year')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                    >
                      <option value="1">1st Year (Freshman)</option>
                      <option value="2">2nd Year (Sophomore)</option>
                      <option value="3">3rd Year (Junior)</option>
                      <option value="4">4th Year (Senior)</option>
                      <option value="5">Graduate / Master&apos;s</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Create Password (Hide &amp; Seek Protection)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      {...regRegister('password')}
                      onFocus={() => setFocusedField('register-password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="mt-1 text-[11px] text-rose-400">{registerErrors.password.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={regStage !== 'idle'}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
                  >
                    {regStage === 'creating' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>1. Creating Account...</span>
                      </>
                    ) : regStage === 'signing-in' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>2. Signing In...</span>
                      </>
                    ) : regStage === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Account Verified! Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account &amp; Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold lg:hidden"
              >
                Switch to Sign In →
              </button>
              <span className="hidden lg:inline text-slate-500">← Sign in on the left</span>
            </div>
          </div>
        </div>

        {/* Bottom Campus Trust Pillars */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Campus-Only Directory</h4>
              <p className="text-[11px] text-slate-400">Encrypted student profiles prevent external spam.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Single-Use QR Handover</h4>
              <p className="text-[11px] text-slate-400">Cryptographic tokens confirm in-person handovers.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">AI-Powered Matching</h4>
              <p className="text-[11px] text-slate-400">Smart similarity scans connect lost &amp; found items.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-slate-600 mt-8 z-10">
        © {new Date().getFullYear()} Findora Campus Lost &amp; Found System. All rights reserved.
      </footer>
    </div>
  );
}
