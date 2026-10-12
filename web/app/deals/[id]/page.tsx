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
  // Only terminal verdicts release money. Anything earlier must refuse with
  // an explanation instead of submitting a doomed on-chain claim.
  // APPROVED additionally needs a settled appeal window plus a persisted
  // successful end-of-window recheck; REJECTED needs a settled window.
  const terminal = deal.status === "APPROVED" || deal.status === "REJECTED" || deal.status === "EXPIRED";
  const appealSettled = deal.appealDeadline === 0 || Math.floor(Date.now() / 1000) >= deal.appealDeadline;
  const claimable = terminal && appealSettled && (deal.status !== "APPROVED" || deal.recheckOk);
  const claimHint = !w
    ? "Connect wallet"
    : !terminal
      ? "Available after verification: creator claims on approval, brand on rejection or expiry"
      : !appealSettled
        ? "Claim unlocks after the appeal window closes"
        : deal.status === "APPROVED" && !deal.recheckOk
          ? "Run the end-of-window recheck first, then claim"
          : "Claim funds";

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

      {deal.status === "FUNDED" ? (
        isCreator ? (
          <div className="card" role="region" aria-label="Participate in this deal" style={{ padding: 20, marginTop: 16, borderColor: "var(--accent)", borderWidth: 2 }}>
            <h2>Participate — submit your post link</h2>
            <p style={{ color: "var(--ink-muted)", fontSize: 14 }}>
              Publish your post on {deal.platform}, then paste the public URL below before the deadline.
              Validators will check it against the brief.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <input
                aria-label="Your published post URL"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://…"
                inputMode="url"
                style={{ flex: 1, minWidth: 220, minHeight: 44, borderRadius: 10, border: "1px solid var(--border)", padding: "0 12px", background: "var(--bg)", color: "var(--ink)" }}
              />
              <button className="btn btn-accent" disabled={!w || postUrl.trim().length === 0} onClick={() => w && act((s) => dealActions.submitPost(w, id, postUrl.trim(), s))}>
                Submit post
              </button>
            </div>
            <TxStatus stage={stage} tx={tx} error={error} url={tx ? explorerTxUrl(tx) : undefined} />
          </div>
        ) : (
          <div className="card" style={{ padding: 20, marginTop: 16 }}>
            <h2>Waiting on the creator</h2>
            <p style={{ color: "var(--ink-muted)", fontSize: 14 }}>
              Only the designated creator wallet ({shortAddress(deal.creator)}) can submit the post link for this deal.
              {!w ? " Connect that wallet to participate." : " Switch to the creator wallet to participate."}
            </p>
          </div>
        )
      ) : null}

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
          {!isLive || deal.verdictReason || (deal.status !== "SUBMITTED" && deal.status !== "VERIFYING") ? (
            <>
              {!isLive ? <ConsensusMeter agree={deal.consensus.agree} total={deal.consensus.total} /> : null}
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>{deal.verdictReason || "No verdict yet."}</p>
            </>
          ) : (
            <p style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>
              No verification stored yet — press Run verification below. Validators open the live post and must reach
              consensus before any verdict appears here.
            </p>
          )}
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {(deal.status === "SUBMITTED" || deal.status === "VERIFYING" || deal.status === "APPEALED") ? (
              <button className="btn btn-ghost" disabled={!w} style={{ color: "#fff", borderColor: "#333" }} onClick={() => w && act((s) => dealActions.verify(w, id, s))} title={w ? "Run verification" : "Connect wallet"}>
                Run verification
              </button>
            ) : null}
            {deal.status === "APPROVED" ? (
              <p style={{ fontSize: 13, opacity: 0.85 }}>
                End-of-window recheck: {deal.recheckOk ? "passed — creator payout unlocked once the appeal window closes." : "pending — required before creator payout."}
              </p>
            ) : null}
            {deal.status === "APPROVED" && !deal.recheckOk ? (
              <button className="btn btn-ghost" disabled={!w} style={{ color: "#fff", borderColor: "#333" }} onClick={() => w && act((s) => dealActions.recheck(w, id, s))} title={w ? "Re-verify the post is still live after the window" : "Connect wallet"}>
                Recheck live window
              </button>
            ) : null}
            {(isBrand || isCreator) && (deal.status === "APPROVED" || deal.status === "REJECTED") ? (
              <button className="btn btn-ghost" style={{ color: "#fff", borderColor: "#333" }} onClick={() => setAppealOpen(true)}>Appeal (0.05 GEN bond)</button>
            ) : null}
            <button className="btn btn-accent" disabled={!w || !claimable} onClick={() => w && claimable && act((s) => dealActions.claim(w, id, s))} title={claimHint}>
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
