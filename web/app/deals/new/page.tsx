"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/lib/wallet";
import { dealActions } from "@/lib/genlayer/actions";
import { isConfigured } from "@/lib/genlayer/client";
import { useTxAction, TxStatus } from "@/components/TxAction";
import { useToast } from "@/components/Toast";
import { explorerTxUrl } from "@/lib/chain";

const CHIPS = ["Mention product", "Show on camera", "Disclose #ad", "Stay live N days"];
const PLATFORMS = ["YouTube", "TikTok", "X", "Instagram"];

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Form() {
  const q = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { address, provider } = useWallet();
  const [brief, setBrief] = useState(q.get("brief") ?? "");
  const [creator, setCreator] = useState(q.get("creator") ?? "");
  const [platform, setPlatform] = useState("YouTube");
  const [amount, setAmount] = useState(q.get("amount") ?? "0.05");
  const [liveDays, setLiveDays] = useState(30);
  const [deadline, setDeadline] = useState(() => toISODate(new Date(Date.now() + 30 * 864e5)));
  const [step, setStep] = useState<"edit" | "review">("edit");
  const { stage, tx, error, run } = useTxAction();

  const canSign = Boolean(address && provider && isConfigured());

  const submit = async () => {
    if (!address || !provider) throw new Error("Connect a wallet first.");
    const wei = BigInt(Math.floor(Number(amount) * 1e18));
    if (!(wei > 0n)) throw new Error("Amount must be greater than 0.");
    // A date-only deadline means midnight; by evening that is already past and
    // the contract reverts. Interpret it as end of the selected day instead.
    const [y, m, d] = deadline.split("-").map(Number);
    if (!y || !m || !d) throw new Error("Pick a valid deadline date.");
    const dl = Math.floor(new Date(y, m - 1, d, 23, 59, 59).getTime() / 1000);
    if (dl <= Math.floor(Date.now() / 1000)) {
      throw new Error("Deadline must be in the future — pick tomorrow or later.");
    }
    await run((onStage) =>
      dealActions.createDeal({ address, provider }, { creator, brief, platform, deadline: dl, liveDays, amountWei: wei }, onStage),
    );
    toast("Deal created — funds locked in escrow.");
    router.push("/");
  };

  return (
    <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 32 }}>Create a deal</h1>
      <p style={{ color: "var(--ink-muted)" }}>StudioNet demo — no real funds. Step {step === "edit" ? "1" : "2"} of 2.</p>
      {step === "edit" ? (
        <form style={{ display: "grid", gap: 12, marginTop: 16 }} onSubmit={(e) => { e.preventDefault(); setStep("review"); }}>
          <label style={{ display: "grid", gap: 6 }}>Creator address<input value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="0x…" required style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--border)", padding: "0 12px" }} /></label>
          <label style={{ display: "grid", gap: 6 }}>Platform<select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--border)", padding: "0 12px" }}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></label>
          <div>
            <label htmlFor="brief" style={{ display: "grid", gap: 6 }}>Brief<textarea id="brief" value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} required maxLength={2000} style={{ borderRadius: 10, border: "1px solid var(--border)", padding: 12 }} /></label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {CHIPS.map((c) => (
                <button key={c} type="button" className="badge" style={{ border: "1px solid var(--border)", minHeight: 44, cursor: "pointer" }} onClick={() => setBrief((b) => (b ? `${b}\n- ${c}` : `- ${c}`))}>
                  + {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>Amount (GEN)<input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.05" required style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--border)", padding: "0 12px" }} /></label>
            <label style={{ display: "grid", gap: 6 }}>Min live days<input type="number" min={1} max={365} value={liveDays} onChange={(e) => setLiveDays(Number(e.target.value))} style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--border)", padding: "0 12px" }} /></label>
          </div>
          <label style={{ display: "grid", gap: 6 }}>Deadline<input type="date" value={deadline} min={toISODate(new Date())} onChange={(e) => setDeadline(e.target.value)} required style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--border)", padding: "0 12px" }} /><span style={{ fontSize: 12, color: "var(--ink-muted)" }}>Counts until end of the selected day. Must be a future date.</span></label>
          <button className="btn btn-accent" type="submit">Review</button>
        </form>
      ) : (
        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          <h2>Review</h2>
          <dl>
            <dt>Creator</dt><dd>{creator}</dd>
            <dt>Platform</dt><dd>{platform}</dd>
            <dt>Amount</dt><dd>{amount} GEN</dd>
            <dt>Deadline</dt><dd>{deadline}</dd>
          </dl>
          <p style={{ whiteSpace: "pre-wrap" }}>{brief || "(empty brief)"}</p>
          {!canSign ? <p style={{ color: "var(--ink-muted)" }}>Connect a wallet on StudioNet to sign. Read-only preview below.</p> : null}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={() => setStep("edit")}>Back</button>
            <button className="btn btn-accent" disabled={!canSign} onClick={() => { void submit(); }} title={canSign ? "Sign and submit" : "Connect wallet first"}>
              Sign + submit
            </button>
          </div>
          <TxStatus stage={stage} tx={tx} error={error} url={tx ? explorerTxUrl(tx) : undefined} />
        </div>
      )}
    </div>
  );
}

export default function NewDealPage() {
  return <Suspense><Form /></Suspense>;
}
