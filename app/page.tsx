'use client';

import GraderView from './components/GraderView';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="font-bold text-xl text-blue-900 flex items-center gap-2">
          <span>🇯🇵 Japanese Speech Contest</span>
        </div>
        <div className="text-sm text-gray-500">
          Evaluation Portal
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <div className="flex flex-col">
          <GraderView />
        </div>
        <div className="relative h-[700px] md:h-full w-full overflow-hidden bg-transparent">
          <img
            src="/banner.png"
            alt="Japanese Speech Contest Banner"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </main>
    </div>
  );
}