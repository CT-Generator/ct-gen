"use client";

// Zine Modal — paper card with dropIn animation, sticker eyebrow, offset close.
// Backdrop click + ESC both close. Body scroll locks while open.
// Spec: zine-design-system / Requirement: Modal primitive.

import { useEffect, type ReactNode } from "react";
import { Sticker } from "./sticker";

type StickerColor = "hot" | "yellow" | "blue" | "ink";

export function Modal({
  title,
  eyebrow,
  color = "hot",
  onClose,
  children,
}: {
  title: string;
  eyebrow?: string;
  color?: StickerColor;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-bg" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">✕</button>
        {eyebrow ? (
          <Sticker color={color} tilt={-2}>
            {eyebrow}
          </Sticker>
        ) : null}
        <h2
          className="scream"
          style={{ fontSize: "var(--t-scream-sm)", margin: "14px 0 12px" }}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
