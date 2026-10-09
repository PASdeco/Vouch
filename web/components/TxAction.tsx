"use client";

import { useState } from "react";
import type { TxStage } from "@/lib/genlayer/client";

const LABEL: Record<TxStage, string> = {
  signing: "Waiting for signature…",
  submitted: "Submitted.",
  "awaiting-consensus": "Validators are reviewing — this can take a few minutes.",
  finalized: "Finalized.",
  failed: "Failed.",
};

export function useTxAction() {
  const [stage, setStage] = useState<TxStage | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = async (fn: (onStage: (s: TxStage, tx?: string) => void) => Promise<{ tx: string; url: string }>) => {
    setError(null);
    setTx(null);
    try {
      const r = await fn((s, t) => {
        setStage(s);
        if (t) setTx(t);
      });
      return r;
    } catch (e) {
      setStage("failed");
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  };
  return { stage, tx, error, run };
}

export function TxStatus({ stage, tx, error, url }: { stage: TxStage | null; tx: string | null; error: string | null; url?: string }) {
  if (!stage) return null;
  return (
    <div aria-live="polite" className="card" style={{ padding: 12, marginTop: 12 }}>
      <div>{LABEL[stage]}</div>
      {tx ? <div style={{ fontSize: 13 }}>Tx: {url ? <a href={url} target="_blank" rel="noreferrer">{tx.slice(0, 18)}…</a> : tx}</div> : null}
      {error ? <div role="alert" style={{ color: "var(--danger)" }}>{error}</div> : null}
    </div>
  );
}
