"use client";

import { useState } from "react";
import { MOVES } from "@/lib/recipe";

type QuizItem = {
  id: string;
  kind: "real" | "fake";
  text: string;
  label?: string;
};

type Answer = "real" | "fake";

export function QuizGame({ items }: { items: QuizItem[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const finished = step >= items.length;

  if (finished) {
    return <QuizResult items={items} answers={answers} onRetry={() => { setStep(0); setAnswers({}); }} />;
  }

  const item = items[step]!;
  function answer(a: Answer) {
    setAnswers((m) => ({ ...m, [item.id]: a }));
    setStep((s) => s + 1);
  }

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="meta">Question {step + 1} of {items.length}</span>
        <div className="flex gap-1 ml-2">
          {items.map((_, i) => (
            <div
              key={i}
              className="h-1 w-7"
              style={{ background: i < step ? MOVES[1].color : i === step ? MOVES[2].color : "color-mix(in oklab, currentColor 15%, transparent)" }}
            />
          ))}
        </div>
      </div>

      <div
        className="border-l-2 pl-4 sm:pl-5 py-2 max-w-prose-theory"
        style={{ borderColor: MOVES[2].color }}
      >
        <p className="font-body text-[15px] sm:text-[16px] leading-[1.65] whitespace-pre-wrap">{item.text}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <button
          type="button"
          onClick={() => answer("real")}
          className="border-2 border-ink dark:border-ink-dark px-4 py-3 font-display hover:bg-ink hover:text-paper dark:hover:bg-ink-dark dark:hover:text-paper-dark transition-colors"
          style={{ fontSize: 17, fontWeight: 600 }}
        >
          Real
        </button>
        <button
          type="button"
          onClick={() => answer("fake")}
          className="border-2 border-ink dark:border-ink-dark px-4 py-3 font-display hover:bg-ink hover:text-paper dark:hover:bg-ink-dark dark:hover:text-paper-dark transition-colors"
          style={{ fontSize: 17, fontWeight: 600 }}
        >
          Fake
        </button>
      </div>
    </div>
  );
}

function QuizResult({
  items,
  answers,
  onRetry,
}: {
  items: QuizItem[];
  answers: Record<string, Answer>;
  onRetry: () => void;
}) {
  const score = items.filter((i) => answers[i.id] === i.kind).length;

  return (
    <div className="mt-10">
      <p className="meta">Result</p>
      <div
        className="mt-3 font-display text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05]"
        style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        {score} <span className="text-ink-soft dark:text-ink-soft-dark">/ {items.length}</span>
      </div>

      <div className="mt-8 space-y-5">
        {items.map((item, i) => {
          const ans = answers[item.id];
          const correct = ans === item.kind;
          return (
            <div
              key={item.id}
              className="border-l-2 pl-4 py-2"
              style={{ borderColor: correct ? MOVES[1].color : MOVES[0].color }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="meta">{i + 1}</span>
                <span
                  className="meta"
                  style={{ color: correct ? MOVES[1].color : MOVES[0].color }}
                >
                  {correct ? "Right" : "Wrong"}
                </span>
                <span className="meta">
                  {item.kind === "real" ? `Real — ${item.label}` : "Fake (generated)"}
                </span>
              </div>
              <p className="text-[14px] leading-snug">{item.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rule-h pt-6 max-w-prose-theory">
        <p className="text-[15px] leading-relaxed">
          Real conspiracies leave paper trails. Defectors talk. Prosecutors indict. Documents leak. The
          fakes don't — they need anomalies, fabricated connections, and dismissed counter-evidence to
          stay afloat. If you got fooled, that's the point: the recipe works because the moves <em>look</em>{" "}
          like investigation. Once you can name them, you can spot them.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 border-2 border-ink dark:border-ink-dark px-4 py-3 font-display hover:bg-ink hover:text-paper dark:hover:bg-ink-dark dark:hover:text-paper-dark transition-colors"
          style={{ fontSize: 16, fontWeight: 600 }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
