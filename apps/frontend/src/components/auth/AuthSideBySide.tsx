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
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  QrCode,
  Scan,
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

  // Registration Handler: Creates Account First, Then Signs In
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
        year: data.year ? Number(data.year) : undefined,
      });

      setRegStage('signing-in');
      await auth.login({ email: data.email, password: data.password });

      setRegStage('success');
      setTimeout(() => {
        router.push(redirectUrl);
      }, 900);
    } catch (err: any) {
      setRegisterError(err?.message || 'Registration failed. Please verify your details.');
      setRegStage('idle');
    }
  }

  const mascotState = getMascotState();

  return (
    <div className="min-h-screen bg-[#0d0e12] text-stone-100 flex flex-col justify-between relative overflow-hidden py-6 sm:py-10 px-4 sm:px-6 lg:px-8 selection:bg-stone-800 selection:text-white">
      {/* Interactive Geometric Radar & Coordinates Canvas */}
      <LostAndFoundCanvas />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between z-10 mb-6">
        <Link href="/" className="flex items-center space-x-2.5">
          <FindoraLogo variant="dark" size="md" />
        </Link>

        <Link
          href="/found-items"
          className="text-xs text-stone-400 hover:text-white flex items-center space-x-1.5 transition-colors"
        >
          <span>Return to inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Hide & Seek Interactive Focus Centerpiece */}
      <div className="z-10 mb-4">
        <HideAndSeekMascot
          state={mascotState}
          activeFieldLabel={focusedField ? focusedField.replace('-', ' ') : undefined}
        />
      </div>

      {/* Mobile Mode Switcher */}
      <div className="lg:hidden max-w-md mx-auto w-full mb-6 z-10">
        <div className="grid grid-cols-2 p-1 border border-stone-800 bg-stone-900/80">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2 text-xs uppercase tracking-wider font-mono transition-colors ${
              activeTab === 'login'
                ? 'bg-stone-100 text-stone-950 font-medium'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 text-xs uppercase tracking-wider font-mono transition-colors ${
              activeTab === 'register'
                ? 'bg-stone-100 text-stone-950 font-medium'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Create account
          </button>
        </div>
      </div>

      {/* Main Dual-Panel Editorial Container */}
      <main className="max-w-5xl mx-auto w-full z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 border border-stone-800 bg-stone-950/85 backdrop-blur-xl">
          
          {/* ============================================================== */}
          {/* LEFT PANEL: SIGN IN                                           */}
          {/* ============================================================== */}
          <section
            className={`p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-800 ${
              activeTab === 'login' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono tracking-wider text-stone-400">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Existing Member</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-white">
                  Sign In
                </h1>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                  Authenticate your student or faculty identity to manage custody records and report items.
                </p>
              </div>

              {loginError && (
                <div className="border border-rose-500/40 bg-rose-950/20 text-rose-200 p-3 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="border border-emerald-500/40 bg-emerald-950/20 text-emerald-200 p-3 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Credentials confirmed. Establishing session...</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type="email"
                      placeholder="name@university.edu"
                      {...loginRegister('email')}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-900/60 border border-stone-800 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="mt-1 text-xs text-rose-400">{loginErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider">
                      Passcode
                    </label>
                    <span className="text-xs text-stone-400 hover:text-stone-200 cursor-pointer transition-colors">
                      Reset
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...loginRegister('password')}
                      onFocus={() => setFocusedField('login-password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-10 py-2.5 bg-stone-900/60 border border-stone-800 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
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
                  className="w-full py-3 bg-stone-100 hover:bg-white text-stone-950 font-medium text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
                >
                  {loginLoading ? (
                    <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Unregistered profile?</span>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-stone-200 hover:text-white underline underline-offset-4 lg:hidden"
              >
                Go to register
              </button>
              <span className="hidden lg:inline text-stone-500">Registration form on the right</span>
            </div>
          </section>

          {/* ============================================================== */}
          {/* RIGHT PANEL: SIGN UP / REGISTER                                */}
          {/* ============================================================== */}
          <section
            className={`p-6 sm:p-10 flex flex-col justify-between bg-stone-900/20 ${
              activeTab === 'register' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono tracking-wider text-stone-400">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>New Member</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white">
                  Create Account
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                  Establish verified campus identity to register lost belongings or file ownership claims.
                </p>
              </div>

              {registerError && (
                <div className="border border-rose-500/40 bg-rose-950/20 text-rose-200 p-3 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* Dynamic Stage Notifications */}
              {regStage === 'creating' && (
                <div className="border border-stone-700 bg-stone-900 p-3 text-xs flex items-center space-x-2 text-stone-200">
                  <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Step 1: Storing campus member profile...</span>
                </div>
              )}

              {regStage === 'signing-in' && (
                <div className="border border-stone-700 bg-stone-900 p-3 text-xs flex items-center space-x-2 text-stone-200">
                  <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Step 2: Authenticating and initializing custody session...</span>
                </div>
              )}

              {regStage === 'success' && (
                <div className="border border-emerald-500/40 bg-emerald-950/20 text-emerald-200 p-3 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Registration complete. Loading portal...</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        placeholder="Enter your name"
                        {...regRegister('username')}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-3 py-2 bg-stone-900/60 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                    </div>
                    {registerErrors.username && (
                      <p className="mt-1 text-[11px] text-rose-400">{registerErrors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                      Campus ID No.
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        placeholder="e.g. 2026-CS-042"
                        {...regRegister('rollNo')}
                        onFocus={() => setFocusedField('roll-number')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-3 py-2 bg-stone-900/60 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                    Campus Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type="email"
                      placeholder="your.email@university.edu"
                      {...regRegister('email')}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-3 py-2 bg-stone-900/60 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="mt-1 text-[11px] text-rose-400">{registerErrors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                      Department
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        {...regRegister('department')}
                        onFocus={() => setFocusedField('department')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-3 py-2 bg-stone-900/60 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                      Academic Year
                    </label>
                    <select
                      {...regRegister('year')}
                      onFocus={() => setFocusedField('year')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-stone-500 transition-colors"
                    >
                      <option value="1">1st Year (Freshman)</option>
                      <option value="2">2nd Year (Sophomore)</option>
                      <option value="3">3rd Year (Junior)</option>
                      <option value="4">4th Year (Senior)</option>
                      <option value="5">Graduate / Faculty</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1.5 uppercase tracking-wider">
                    Create Passcode
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      {...regRegister('password')}
                      onFocus={() => setFocusedField('register-password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-10 py-2 bg-stone-900/60 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
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
                    className="w-full py-2.5 bg-stone-100 hover:bg-white text-stone-950 font-medium text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
                  >
                    {regStage === 'creating' ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                        <span>Creating profile...</span>
                      </>
                    ) : regStage === 'signing-in' ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : regStage === 'success' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Profile ready</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Already registered?</span>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-stone-200 hover:text-white underline underline-offset-4 lg:hidden"
              >
                Go to sign in
              </button>
              <span className="hidden lg:inline text-stone-500">Sign in on the left</span>
            </div>
          </section>
        </div>

        {/* Verification Architecture Protocol Strip */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 border border-stone-800 bg-stone-950/60 divide-y md:divide-y-0 md:divide-x divide-stone-800">
          <div className="p-4 flex items-start space-x-3">
            <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-stone-200">Campus Verification</p>
              <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">Closed institutional registry restricted to verified campus members.</p>
            </div>
          </div>

          <div className="p-4 flex items-start space-x-3">
            <QrCode className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-stone-200">Ephemeral Handover</p>
              <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">Time-limited QR and alphanumeric tokens for physical return.</p>
            </div>
          </div>

          <div className="p-4 flex items-start space-x-3">
            <Scan className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-stone-200">Cross-Referencing</p>
              <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">Automated image-to-report feature matching across all stations.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-stone-600 mt-8 z-10">
        Findora Institutional Custody Network
      </footer>
    </div>
  );
}