import Header from "@/components/layout/Header";

export default function BlogLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#e6e6e6] text-[#1c1c1c]">
      <Header />
      <section className="relative bg-[#1c1c1c] px-6 py-14 text-white lg:px-10 lg:py-20">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#ff729f,#ee8434,transparent_85%)]" />
        <div className="mx-auto max-w-[77.5rem]" role="status">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#ff729f]">Fast Girls Club / Editorial</p>
          <p className="mt-7 text-4xl font-black uppercase tracking-[-0.05em]">Opening the paddock…</p>
        </div>
      </section>
    </main>
  );
}
