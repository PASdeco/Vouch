"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MOCK_DEALS } from "@/lib/mock";
import { shortAddress } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { ConsensusMeter } from "@/components/ConsensusMeter";
import { Skeleton } from "@/components/Skeleton";
import { useWallet } from "@/lib/wallet";
import { fetchDeal, isConfigured } from "@/lib/genlayer/client";
import { dealActions } from "@/lib/genlayer/actions";
import { useTxAction, TxStatus } from "@/components/TxAction";
import { explorerTxUrl, STUDIONET } from "@/lib/chain";
import type { Deal } from "@/lib/deals";

export default function DealDetail({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postUrl, setPostUrl] = useState("");
  const [appealOpen, setAppealOpen] = useState(false);
  const { address, provider } = useWallet();
  const { stage, tx, error, run } = useTxAction();

  useEffect(() => {
    void params.then((p) => setId(p.id));
  }, [params]);

  const load = useCallback(async () => {
    if (!id) return;
    const live = Boolean(address && isConfigured() && process.env.NEXT_PUBLIC_MOCK_MODE !== "true");
    if (live) {
      try {
        setDeal(await fetchDeal(id));
        setIsLive(true);
      } catch {
        setDeal(MOCK_DEALS.find((d) => d.id === id) ?? MOCK_DEALS[0]);
        setIsLive(false);
      }
    } else {
      setDeal(MOCK_DEALS.find((d) => d.id === id) ?? MOCK_DEALS[0]);
      setIsLive(false);
    }
    setLoading(false);
  }, [id, address]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!deal) return;
    if (deal.status !== "SUBMITTED" && deal.status !== "VERIFYING") return;
    const t = setInterval(() => { void load(); }, 15000);
    return () => clearInterval(t);
  }, [deal, load]);

  if (loading || !deal || !id) {
    return (
      <div className="container-vouch" style={{ paddingTop: 24 }}>
        <Skeleton label="deal" />
      </div>
    );
  }

  const w = address && provider ? { address, provider } : null;
  const isCreator = w && deal.creator.toLowerCase() === address!.toLowerCase();
  const isBrand = w && deal.brand.toLowerCase() === address!.toLowerCase();

  const act = (fn: (onStage: Parameters<Parameters<typeof run>[0]>[0]) => Promise<{ tx: string; url: string }>) => {
    void run(fn).then(() => load());
  };

  return (
    <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Link href="/deals" className="btn btn-ghost">Back to deals</Link>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 32 }}>{deal.id}</h1>
        <StatusBadge status={deal.status} />
        <span style={{ marginLeft: "auto", fontWeight: 700 }} className="font-display">{deal.amount}</span>
      </div>
      <p style={{ color: "var(--ink-muted)" }}>
        Brand {shortAddress(deal.brand)} — Creator {shortAddress(deal.creator)}
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 16 }} className="hero-grid">
        <div className="card" style={{ padding: 20 }}>
          <h2>Brief</h2>
          <p>{deal.brief}</p>
          <h3 style={{ marginTop: 16 }}>Checklist</h3>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            {deal.requirements.map((r) => (
              <li key={r.id}>{r.label} — {r.met === "pass" ? "Pass" : r.met === "fail" ? "Fail" : r.met === "unclear" ? "Unclear" : "Pending"}</li>
            ))}
          </ul>
          {deal.postUrl ? <p style={{ marginTop: 12 }}>Post: <a href={deal.postUrl} target="_blank" rel="noreferrer">View evidence</a></p> : <p style={{ color: "var(--ink-muted)" }}>No post submitted yet.</p>}
        </div>
        <div style={{ background: "#101814", color: "#EAF0EC", borderRadius: 16, padding: 20 }}>
          <h2>Consensus</h2>
          <ConsensusMeter agree={deal.consensus.agree} total={deal.consensus.total} />
          <p style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>{deal.verdictReason || "No verdict yet."}</p>
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {isCreator && deal.status === "FUNDED" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input aria-label="Post URL" value={postUrl} onChange={(e) => setPostUrl(e.target.value)} placeholder="https://…" style={{ flex: 1, minHeight: 44, borderRadius: 10, padding: "0 12px" }} />
                <button className="btn btn-accent" disabled={!w} onClick={() => w && act((s) => dealActions.submitPost(w, id, postUrl, s))}>Submit</button>
              </div>
            ) : null}
            {(deal.status === "SUBMITTED" || deal.status === "VERIFYING" || deal.status === "APPEALED") ? (
              <button className="btn btn-ghost" disabled={!w} style={{ color: "#fff", borderColor: "#333" }} onClick={() => w && act((s) => dealActions.verify(w, id, s))} title={w ? "Run verification" : "Connect wallet"}>
                Run verification
              </button>
            ) : null}
            {(isBrand || isCreator) && (deal.status === "APPROVED" || deal.status === "REJECTED") ? (
              <button className="btn btn-ghost" style={{ color: "#fff", borderColor: "#333" }} onClick={() => setAppealOpen(true)}>Appeal (0.05 GEN bond)</button>
            ) : null}
            <button className="btn btn-accent" disabled={!w} onClick={() => w && act((s) => dealActions.claim(w, id, s))} title={w ? "Claim funds" : "Connect wallet"}>
              Claim funds
            </button>
          </div>
          <TxStatus stage={stage} tx={tx} error={error} url={tx ? explorerTxUrl(tx) : undefined} />
          {!w ? <p style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>Connect a wallet on StudioNet to act. {isLive ? "Live StudioNet data." : "Showing demo data."}</p> : !isLive ? <p style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>Showing demo data — this deal id was not found on-chain.</p> : null}
        </div>
      </div>

      {appealOpen ? (
        <div role="dialog" aria-modal="true" aria-label="Appeal bond" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
          <div className="card" style={{ padding: 24, maxWidth: 420 }}>
            <h2>Appeal with bond</h2>
            <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>0.05 GEN bond. Re-runs verification; the bond goes to the final winner. Spam is deterred.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setAppealOpen(false)}>Cancel</button>
              <button className="btn btn-accent" disabled={!w} onClick={() => w && (setAppealOpen(false), act((s) => dealActions.appeal(w, id, 5n * 10n ** 16n, s)))}>Appeal</button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <h2>Timeline</h2>
        <ol>
          <li>Funded — escrow locked</li>
          <li>{deal.status} — {deal.updatedAt} (<a href={`${STUDIONET.explorerUrl}`} target="_blank" rel="noreferrer">explorer</a>)</li>
        </ol>
      </div>
      {(deal.status === "SUBMITTED" || deal.status === "VERIFYING") ? (
        <p aria-live="polite" style={{ color: "var(--ink-muted)", marginTop: 12 }}>Validators are reviewing — this can take a few minutes.</p>
      ) : null}
    </div>
  );
}
