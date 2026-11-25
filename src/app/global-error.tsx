'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-white text-gray-900 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-4">
          <h2 className="text-xl font-black text-gray-900">Application Error</h2>
          <p className="text-xs text-gray-500">
            An unexpected error occurred while loading this page.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="bg-[#FF7900] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#ea580c] transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="bg-gray-100 text-gray-800 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
