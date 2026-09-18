"use client";

import Link from "next/link";

export default function BlogError({ reset }: { reset: () => void }): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1c1c1c] px-6 text-center text-white">
      <div className="max-w-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff729f]">Editorial desk</p>
        <h1 className="mt-5 text-5xl font-black uppercase tracking-[-0.06em]">Stories unavailable.</h1>
        <p className="mt-5 text-sm leading-7 text-white/50">The news feed could not be loaded just now. The rest of Fast Girls Club is still available.</p>
        <div className="mt-8 flex justify-center gap-4">
          <button type="button" onClick={reset} className="bg-[#ff729f] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#1c1c1c]">Try again</button>
          <Link href="/" className="border border-white/20 px-5 py-3 text-xs font-black uppercase tracking-[0.16em]">Home</Link>
        </div>
      </div>
    </main>
  );
}
