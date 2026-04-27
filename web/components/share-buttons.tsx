// Share buttons — always-link-back. Payloads are recipe-naming, never theory text.
// Spec: openspec/changes/v2-rebuild/specs/permalinks-and-sharing/spec.md

"use client";

import { useState } from "react";

type Props = {
  permalink: string;
  culprit: string;
};

export function ShareButtons({ permalink, culprit }: Props) {
  const [copied, setCopied] = useState(false);

  const teaser = `Built a fake conspiracy theory using the four-move recipe at`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${teaser} ${permalink}`)}`;
  const bskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${teaser} ${permalink}`)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent("A fake conspiracy theory, with the recipe shown")}&body=${encodeURIComponent(`I made a fake conspiracy theory about "${culprit}" using the four-move recipe. The recipe page explains how it was built and why each move works:\n\n${permalink}`)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(permalink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  async function nativeShare() {
    if (typeof navigator === "undefined" || !("share" in navigator)) return copy();
    try {
      await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
        title: "Conspiracy Generator",
        text: teaser,
        url: permalink,
      });
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="flex flex-wrap gap-2" data-share-area>
      <button
        type="button"
        onClick={copy}
        className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener"
        className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
      >
        X
      </a>
      <a
        href={bskyUrl}
        target="_blank"
        rel="noopener"
        className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
      >
        Bluesky
      </a>
      <a
        href={mailtoUrl}
        className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
      >
        Email
      </a>
      <button
        type="button"
        onClick={nativeShare}
        className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors sm:hidden"
        aria-label="Share via system"
      >
        ⋯
      </button>
    </div>
  );
}
