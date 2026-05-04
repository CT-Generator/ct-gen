// Client portion of the masthead — interactive bits (mobile drawer, locale toggle).
// Server portion in masthead.tsx feeds it pre-resolved labels for the active locale.

"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string };
type Locale = "en" | "de" | "nl";
type LocaleOption = {
  locale: Locale;
  label: string;
  href: string;
  active: boolean;
};

export function MastheadClient({
  home,
  nav,
  activeIndex,
  openLabel,
  toggleAria,
  localeOptions,
}: {
  home: string;
  nav: NavItem[];
  activeIndex: number;
  openLabel: string;
  toggleAria: string;
  localeOptions: LocaleOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-ink dark:border-ink-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-9 lg:py-5">
        <Link href={home} className="flex items-center gap-2 sm:gap-3">
          <LogoMark size={28} className="sm:hidden" />
          <LogoMark size={32} className="hidden sm:inline-flex" />
          <div
            className="font-display leading-none"
            style={{ fontSize: 16, fontWeight: 600 }}
          >
            Conspiracy Generator
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-[13px] text-ink-soft dark:text-ink-soft-dark md:flex">
          {nav.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "hover:text-ink dark:hover:text-ink-dark",
                i === activeIndex &&
                  "text-ink dark:text-ink-dark border-b border-ink dark:border-ink-dark pb-0.5",
              )}
            >
              {item.label}
            </Link>
          ))}
          <LocaleToggle options={localeOptions} ariaLabel={toggleAria} />
          <ThemeToggle />
        </nav>

        {/* Mobile theme + nav toggle */}
        <div className="md:hidden flex items-center gap-1 -mr-2">
          <LocaleToggle options={localeOptions} ariaLabel={toggleAria} compact />
          <ThemeToggle />
          <button
            type="button"
            aria-label={openLabel}
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
            {nav.map((item, i) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block py-3 text-[15px] text-ink-soft dark:text-ink-soft-dark border-b border-ink/10 dark:border-ink-dark/10 last:border-b-0",
                    i === activeIndex && "text-ink dark:text-ink-dark",
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

function LocaleToggle({
  options,
  ariaLabel,
  compact = false,
}: {
  options: LocaleOption[];
  ariaLabel: string;
  compact?: boolean;
}) {
  const writeCookie = (target: Locale) => {
    // Persist the new locale via the cookie so the next request honors it
    // even before the server-side cookie write (mirroring what middleware does).
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `cgen_lang=${target}; path=/; max-age=${oneYear}; SameSite=Lax${
      window.location.protocol === "https:" ? "; Secure" : ""
    }`;
  };
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "font-mono uppercase tracking-[0.14em] text-[10px] flex items-center gap-1 px-1.5 py-1",
        compact && "px-1",
      )}
    >
      {options.map((opt, i) => (
        <span key={opt.locale} className="flex items-center gap-1">
          {i > 0 ? (
            <span aria-hidden className="text-ink-soft dark:text-ink-soft-dark">|</span>
          ) : null}
          <Link
            href={opt.href}
            onClick={() => writeCookie(opt.locale)}
            aria-current={opt.active ? "true" : undefined}
            className={cn(
              opt.active
                ? "text-ink dark:text-ink-dark border-b border-ink dark:border-ink-dark pb-0.5"
                : "text-ink-soft dark:text-ink-soft-dark",
            )}
          >
            {opt.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
