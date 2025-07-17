'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-50 px-6 py-10">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <Image src="/next.svg" alt="Next.js Logo" width={40} height={40} />
          <span className="text-lg font-semibold text-gray-800">Costing Manager</span>
        </div>
        <nav className="hidden sm:flex gap-4">
          <Link href="/costing-sheet" className="text-gray-600 hover:text-blue-600 transition">
            Costing Sheet
          </Link>
          <Link href="/material-master" className="text-gray-600 hover:text-blue-600 transition">
            Material Master
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="text-center flex flex-col items-center flex-1 justify-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-800 leading-tight">
          Streamline Your Product Costing
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-xl">
          Manage your materials, calculate product costs in real-time, and make data-driven decisions — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/costing-sheet">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-blue-700 transition">
              Costing Sheet
            </button>
          </Link>
          <Link href="/material-master">
            <button className="bg-gray-700 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-gray-800 transition">
              Material Master
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 text-sm text-gray-500 text-center">
        Built with ❤️ using Next.js + TypeScript
      </footer>
    </div>
  );
}
