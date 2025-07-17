'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-10">
      <Image src="/next.svg" alt="Next.js Logo" width={180} height={38} priority />

      <h1 className="text-2xl font-bold text-center">Welcome to Costing Manager</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/costing-sheet">
          <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Go to Costing Sheet
          </button>
        </Link>
        <Link href="/material-master">
          <button className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700">
            Go to Material Master
          </button>
        </Link>
      </div>

      <footer className="mt-20 text-sm text-gray-500">
        Built with ❤️ using Next.js + TypeScript
      </footer>
    </div>
  );
}
