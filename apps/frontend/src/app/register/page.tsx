"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rollNo: z.string().optional(),
  department: z.string().optional(),
  year: z.number().min(1).max(6).optional(),
  section: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const auth = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterForm) {
    setMessage(null);
    setLoading(true);
    try {
      await auth.register({
        email: data.email,
        username: data.username,
        password: data.password,
        rollNo: data.rollNo,
        department: data.department,
        year: data.year,
        section: data.section,
      });
      router.push('/login');
    } catch (err: any) {
      setMessage(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input {...register('email')} className="w-full rounded border p-2" />
          {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm">Username</label>
          <input {...register('username')} className="w-full rounded border p-2" />
          {errors.username && <p className="text-sm text-red-400">{errors.username.message}</p>}
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" {...register('password')} className="w-full rounded border p-2" />
          {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm">Roll Number (Optional)</label>
          <input {...register('rollNo')} className="w-full rounded border p-2" />
          {errors.rollNo && <p className="text-sm text-red-400">{errors.rollNo.message}</p>}
        </div>
        <div>
          <label className="block text-sm">Department (Optional)</label>
          <input {...register('department')} className="w-full rounded border p-2" />
          {errors.department && <p className="text-sm text-red-400">{errors.department.message}</p>}
        </div>
        <div>
          <label className="block text-sm">Year (1-6, Optional)</label>
          <input type="number" {...register('year', { valueAsNumber: true })} className="w-full rounded border p-2" />
          {errors.year && <p className="text-sm text-red-400">{errors.year.message}</p>}
        </div>
        <div>
          <label className="block text-sm">Section (Optional)</label>
          <input {...register('section')} className="w-full rounded border p-2" />
          {errors.section && <p className="text-sm text-red-400">{errors.section.message}</p>}
        </div>
        <div>
          <button disabled={loading} className="rounded bg-emerald-500 px-4 py-2 text-white disabled:opacity-50">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </div>
        {message && <p className="text-sm text-red-400">{message}</p>}
      </form>
    </main>
  );
}
