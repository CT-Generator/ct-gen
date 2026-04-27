// Masthead — site header on every page.
// Mobile: brand mark + name only; nav collapses behind a hamburger placeholder.
// Source: design system, component-sheets.jsx → HomeSheet (header strip)

"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "The recipe", href: "/recipe" as const },
  { label: "For teachers", href: "/teach" as const },
  { label: "About", href: "/about" as const },
  { label: "Generate", href: "/" as const, active: true },
];

export function Masthead() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-ink dark:border-ink-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-9 lg:py-5">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <LogoMark size={28} className="sm:hidden" />
          <LogoMark size={32} className="hidden sm:inline-flex" />
          <div>
            <div
              className="font-display leading-none"
              style={{ fontSize: 16, fontWeight: 600 }}
            >
              Conspiracy Generator
            </div>
            <div className="meta mt-1 hidden sm:block">
              Boudry · Meyer · Ghent · Hamburg
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-[13px] text-ink-soft dark:text-ink-soft-dark md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "hover:text-ink dark:hover:text-ink-dark",
                item.active &&
                  "text-ink dark:text-ink-dark border-b border-ink dark:border-ink-dark pb-0.5",
              )}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile theme + nav toggle */}
        <div className="md:hidden flex items-center gap-1 -mr-2">
          <ThemeToggle />
        <button
          type="button"
          aria-label="Open navigation"
          aria-expanded={open}
          className="rounded p-2 text-ink dark:text-ink-dark"
          onClick={() => setOpen((o) => !o)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="md:hidden border-t border-ink/10 dark:border-ink-dark/10">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block py-3 text-[15px] text-ink-soft dark:text-ink-soft-dark border-b border-ink/10 dark:border-ink-dark/10 last:border-b-0",
                    item.active && "text-ink dark:text-ink-dark",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
