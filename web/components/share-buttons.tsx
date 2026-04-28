// Share buttons — always-link-back. Payloads are recipe-naming, never theory text.
// Spec: openspec/changes/v2-rebuild/specs/permalinks-and-sharing/spec.md
// Locale-aware copy via dictionary keys passed in from a server-component wrapper.

"use client";

import { useState } from "react";

type Props = {
  permalink: string;
  culprit: string;
  /** Pre-resolved share copy for the active locale. */
  labels: {
    teaser: string;
    email_subject: string;
    email_body_a: string;
    email_body_b: string;
    copy_link: string;
    copied: string;
    via_x: string;
    via_bluesky: string;
    via_email: string;
    via_system: string;
    site_title: string;
  };
};

export function ShareButtons({ permalink, culprit, labels }: Props) {
  const [copied, setCopied] = useState(false);

  const teaser = labels.teaser;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${teaser} ${permalink}`)}`;
  const bskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${teaser} ${permalink}`)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(labels.email_subject)}&body=${encodeURIComponent(`${labels.email_body_a}${culprit}${labels.email_body_b}\n\n${permalink}`)}`;

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
        title: labels.site_title,
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
        {copied ? labels.copied : labels.copy_link}
      </button>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener"
        className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
      >
        {labels.via_x}
      </a>
      <a
        href={bskyUrl}
        target="_blank"
        rel="noopener"
        className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
      >
        {labels.via_bluesky}
      </a>
      <a
        href={mailtoUrl}
        className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
      >
        {labels.via_email}
      </a>
      <button
        type="button"
        onClick={nativeShare}
        className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors sm:hidden"
        aria-label={labels.via_system}
      >
        ⋯
      </button>
    </div>
  );
}
