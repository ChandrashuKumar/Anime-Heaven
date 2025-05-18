'use client'

import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h1>
      <p className="text-gray-400 mb-4">{error?.message || 'Failed to load anime details'}</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
        <Link href="/" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
}