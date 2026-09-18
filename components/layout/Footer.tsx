import Link from "next/link";

export default function Footer(): React.ReactElement {
  return (
    <footer
      id="about"
      className="border-t border-white/10 bg-black px-6 py-10 text-white lg:px-10"
    >
      <div className="mx-auto flex max-w-[77.5rem] flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <Link href="/" className="text-xl font-black uppercase tracking-[-0.05em]">
            Fast Girls<span className="text-[#ff729f]">.</span>
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/30">
            Women in motorsport
          </p>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
          © {new Date().getFullYear()} Fast Girls Club
        </p>
      </div>
    </footer>
  );
}
