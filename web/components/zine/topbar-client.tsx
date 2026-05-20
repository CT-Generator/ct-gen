"use client";

// Client portion of the Topbar — interactive bits: theme toggle, locale toggle,
// mobile drawer. Server portion in topbar.tsx feeds pre-resolved labels.

import Link from "next/link";
import { useState } from "react";
import { Sticker } from "./sticker";

type NavItem = { key: string; label: string; href: string };
type Locale = "en" | "de" | "nl";
type LocaleOption = {
  locale: Locale;
  label: string;
  href: string;
  active: boolean;
};

// Write the cgen_lang cookie so the next request honors the chosen locale
// before middleware sees the URL change. Mirrors masthead-client.tsx.
function writeLocaleCookie(target: Locale) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `cgen_lang=${target}; path=/; max-age=${oneYear}; SameSite=Lax${
    typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : ""
  }`;
}

const BAR =
  "sticky top-0 z-50 bg-ink text-paper px-[clamp(14px,2.5vw,24px)] py-2 " +
  "flex items-center justify-between gap-3 " +
  "text-[12px] font-semibold uppercase tracking-[0.06em]";

export function TopbarClient({
  brandLabel,
  issueTag,
  home,
  nav,
  localeOptions,
  toggleAria,
  openLabel,
}: {
  brandLabel: string;
  issueTag: string;
  home: string;
  nav: NavItem[];
  localeOptions: LocaleOption[];
  toggleAria: string;
  openLabel: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className={BAR} style={{ fontFamily: "var(--font-body)" }}>
      <Link
        href={home}
        className="flex items-center gap-3 min-w-0 flex-shrink"
        style={{ color: "inherit", textDecoration: "none", whiteSpace: "nowrap" }}
      >
        {/* Star-clipped magenta brand mark */}
        <span
          aria-hidden="true"
          className="flex items-center justify-center"
          style={{
            width: 22,
            height: 22,
            background: "var(--hot)",
            color: "var(--ink)",
            fontFamily: "var(--font-display)",
            fontSize: 14,
            transform: "rotate(-8deg)",
            flex: "0 0 22px",
            clipPath:
              "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          }}
        >
          !
        </span>
        <span>{brandLabel}</span>
        <span style={{ opacity: 0.4 }} className="hidden sm:inline">·</span>
        <span
          className="hidden sm:inline overflow-hidden text-ellipsis"
          style={{ opacity: 0.7 }}
        >
          {issueTag}
        </span>
      </Link>

      <nav className="flex items-center gap-2 flex-shrink-0">
        {/* Hamburger on mobile */}
        <button
          type="button"
          className="sm:hidden"
          aria-label={openLabel}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
          style={{
            background: "transparent",
            color: "var(--paper)",
            border: "1.5px solid rgba(243,233,196,0.3)",
            padding: "5px 8px",
            fontFamily: "var(--font-body)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}
        >
          ☰
        </button>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          {nav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              style={{
                background: "var(--paper)",
                color: "var(--ink)",
                border: "1.5px solid var(--paper)",
                padding: "5px 11px",
                textDecoration: "none",
                fontFamily: "inherit",
                fontWeight: 700,
                letterSpacing: "inherit",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                transition: "background var(--t-fast), color var(--t-fast)",
              }}
              className="hover:!bg-punch hover:!border-punch"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Locale toggle */}
        <div role="group" aria-label={toggleAria} className="flex items-center gap-1">
          {localeOptions.map((opt) => (
            <Link
              key={opt.locale}
              href={opt.href}
              onClick={() => writeLocaleCookie(opt.locale)}
              aria-current={opt.active ? "true" : undefined}
              style={{
                fontSize: 11,
                padding: "3px 7px",
                color: opt.active ? "var(--punch)" : "rgba(243,233,196,0.55)",
                textDecoration: "none",
                borderBottom: opt.active ? "1px solid var(--punch)" : "1px dotted rgba(243,233,196,0.3)",
              }}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="sm:hidden absolute top-full left-0 right-0"
          style={{
            background: "var(--ink)",
            borderTop: "2px solid var(--paper)",
            padding: "12px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            zIndex: 49,
          }}
        >
          {nav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              style={{
                background: "var(--paper)",
                color: "var(--ink)",
                padding: "8px 12px",
                textDecoration: "none",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <Sticker color="hot" tilt={-1}>Menu</Sticker>
            {localeOptions.map((opt) => (
              <Link
                key={opt.locale}
                href={opt.href}
                onClick={() => {
                  writeLocaleCookie(opt.locale);
                  setDrawerOpen(false);
                }}
                aria-current={opt.active ? "true" : undefined}
                style={{
                  fontSize: 12,
                  padding: "4px 8px",
                  color: opt.active ? "var(--punch)" : "var(--paper)",
                  textDecoration: "none",
                  border: opt.active ? "1.5px solid var(--punch)" : "1.5px solid rgba(243,233,196,0.3)",
                }}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
