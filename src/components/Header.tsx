"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Zap } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/tools', label: 'All Tools' },
    { href: '/compare', label: 'Compare' },
    { href: '/stack-builder', label: 'Stack Builder' },
    { href: '/blog', label: 'Blog' },
    { href: '/deals', label: 'Deals' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030305]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white hidden sm:block">
            CreatorAI <span className="text-purple-400">Hub</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/submit"
            className="hidden sm:inline-flex items-center rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
          >
            Submit Tool
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/5 px-4 py-4 md:hidden bg-[#030305]/95 backdrop-blur-xl">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 rounded-lg bg-purple-600 px-3 py-2.5 text-sm font-bold text-white text-center hover:bg-purple-500 transition-colors"
            >
              Submit Tool
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
