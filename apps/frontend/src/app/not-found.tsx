import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              404 • Page Not Found
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Lost in Campus?
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              The page you are looking for does not exist or may have been moved.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/found-items"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Items</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
