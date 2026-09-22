"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import newLogo from "@/public/images/F1-images/newlogo3.png";

const links = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/#latest", label: "Latest" },
  { href: "/f1", label: "The Grid" },

];

export default function Header(): React.ReactElement {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 16);

    updateScrolled();

    window.addEventListener("scroll", updateScrolled, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    const updateHash = () => {
      setHash(window.location.hash);
    };

    updateHash();

    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  const isActiveLink = (href: string): boolean => {
    if (href === "/#latest") {
      return pathname === "/" && hash === "#latest";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={`sticky top-0 z-50 shrink-0 bg-[#1c1c1c] pb-px text-white transition-shadow duration-300 motion-reduce:transition-none ${scrolled
        ? "shadow-none"
        : "shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
        }`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,#682840_0%,#3b2130_48%,#1c1c1c_100%)] transition-opacity duration-300 motion-reduce:transition-none ${scrolled ? "opacity-100" : "opacity-0"
          }`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10 transition-opacity duration-300 motion-reduce:transition-none ${scrolled ? "opacity-0" : "opacity-100"
          }`}
      />

      <nav
        aria-label="Main navigation"
        className="relative z-10 mx-auto flex w-full max-w-[77.5rem] items-center justify-between px-6 py-5 lg:px-10"
      >
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          aria-label="Fast Girls Club home"
        >
          <Image
            src={newLogo}
            alt="Fast Girls Club"
            priority
            sizes="80px"
            className="h-auto w-20"
          />
        </Link>

        <div className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[0.18em] md:flex">
          {links.map((link) => {
            const active = isActiveLink(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`transition-colors hover:text-[#ff729f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff729f] ${active
                  ? "text-[#ff729f]"
                  : "text-white"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="relative z-50 flex items-center gap-3 border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:border-[#ff729f] hover:text-[#ff729f] md:hidden"
        >
          {menuOpen ? "Close" : "Menu"}

          <span
            aria-hidden="true"
            className="text-[#ff729f]"
          >
            {menuOpen ? "×" : "+"}
          </span>
        </button>

        {menuOpen ? (
          <motion.div
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="absolute left-0 right-0 top-full border-t border-white/10 bg-[#1c1c1c] px-6 py-6 shadow-2xl md:hidden"
          >
            {links.map((link) => {
              const active = isActiveLink(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`block border-b border-white/10 py-4 text-2xl font-black uppercase tracking-[-0.04em] transition-colors last:border-0 hover:text-[#ff729f] ${active
                    ? "text-[#ff729f]"
                    : "text-white"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </motion.div>
        ) : null}
      </nav>
    </header>
  );
}