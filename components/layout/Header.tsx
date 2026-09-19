"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import newLogo from "@/public/images/F1-images/newlogo3.png";

const links = [
  { href: "/#latest", label: "Latest" },
  { href: "/blog", label: "Blog" },
  { href: "/f1", label: "The Grid" },
  { href: "/about", label: "About" },
];

export default function Header(): React.ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-30 bg-[#1c1c1c] text-white">
      <nav
        aria-label="Main navigation"
        className="relative mx-auto flex w-full max-w-[77.5rem] items-center justify-between px-6 py-5 lg:px-10"
      >
        <Link href="/" onClick={() => setMenuOpen(false)} aria-label="Fast Girls Club home">
          <Image
            src={newLogo}
            alt="Fast Girls Club"
            priority
            sizes="80px"
            className="h-auto w-20"
          />
        </Link>

        <div className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[0.18em] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#ff729f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff729f]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="relative z-50 flex items-center gap-3 border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:border-[#ff729f] hover:text-[#ff729f] md:hidden"
        >
          {menuOpen ? "Close" : "Menu"}
          <span aria-hidden="true" className="text-[#ff729f]">{menuOpen ? "×" : "+"}</span>
        </button>

        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 top-full border-t border-white/10 bg-[#1c1c1c] px-6 py-6 shadow-2xl md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-white/10 py-4 text-2xl font-black uppercase tracking-[-0.04em] transition-colors last:border-0 hover:text-[#ff729f]"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        ) : null}
      </nav>
    </header>
  );
}
