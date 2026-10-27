"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../../lib/useUser';
import { API_URL, BASE_API } from '../../lib/api';


export default function ProfilePage() {
  const { user, loading, error, logout, refresh } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error)
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="mt-4">
          <p className="text-sm text-red-400">{error}</p>
          <div className="mt-3 space-x-2">
            <button onClick={() => refresh()} className="rounded bg-cyan-500 px-3 py-1 text-white">Retry</button>
            <button onClick={() => logout()} className="rounded bg-red-500 px-3 py-1 text-white">Sign out</button>
          </div>
        </div>
      </main>
    );

  if (!user) return null;

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-4 space-y-2">
        <div>
          {user.avatar ? (
            // avatar is stored as /uploads/filename
            <img src={`${BASE_API}${user.avatar}`} alt="avatar" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-300" />
          )}
        </div>
        <div>
          <label className="block text-sm">Upload avatar</label>
          <input type="file" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const form = new FormData();
            form.append('file', file);
            try {
              const res = await fetch(API_URL + '/users/me/avatar', {
                method: 'POST',
                body: form,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                } as any,
              });
              if (!res.ok) throw new Error('Upload failed');
              await res.json();
              await refresh();
            } catch (err) {
              console.error(err);
            }
          }} />
        </div>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Roll Number:</strong> {user.rollNo || 'Not provided'}</p>
        <p><strong>Department:</strong> {user.department || 'Not provided'}</p>
        <p><strong>Year:</strong> {user.year || 'Not provided'}</p>
        <p><strong>Section:</strong> {user.section || 'Not provided'}</p>
        <p><strong>Trust Score:</strong> {user.trustScore}</p>
        <div className="pt-2 flex flex-wrap gap-2">
          <Link href="/profile/reputation" className="inline-flex items-center space-x-1 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
            <span>View Reputation & Badges</span>
          </Link>
          <Link href="/leaderboard" className="inline-flex items-center space-x-1 text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors">
            <span>View Campus Leaderboard</span>
          </Link>
        </div>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
        <div className="mt-4">
          <button onClick={() => logout()} className="rounded bg-red-500 px-3 py-1 text-white">Sign out</button>
        </div>
      </div>
    </main>
  );
}
