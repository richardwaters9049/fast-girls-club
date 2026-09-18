import Link from "next/link";

export default function BlogNotFound(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1c1c1c] px-6 text-center text-white">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff729f]">404 / News desk</p>
        <h1 className="mt-5 text-5xl font-black uppercase tracking-[-0.06em]">Story not found.</h1>
        <Link href="/blog" className="mt-8 inline-block border-b-2 border-[#ff729f] pb-2 text-xs font-black uppercase tracking-[0.18em]">View all stories →</Link>
      </div>
    </main>
  );
}
