// "Save as PDF" trigger — uses the browser's native print dialog.
// The print stylesheet (in globals.css under @media print) handles the rest.

"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="font-mono uppercase border border-ink/40 dark:border-ink-dark/40 px-3 py-1.5 hover:border-ink dark:hover:border-ink-dark transition-colors"
      style={{ fontSize: 10, letterSpacing: "0.14em" }}
    >
      Save as PDF
    </button>
  );
}
