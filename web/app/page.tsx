import Link from "next/link";
import { MOCK_DEALS } from "@/lib/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { ConsensusMeter } from "@/components/ConsensusMeter";

const FAQS = [
  {
    q: "What do validators check?",
    a: "Validators open the live post URL and check it only against the brief stored on-chain — mention, on-camera proof, disclosure, and live status. Nothing else counts.",
  },
  {
    q: "What if the post is deleted?",
    a: "The post reads as not-live, verification fails, and funds return to the brand. The creator can appeal with a new public proof URL (for example an archive link).",
  },
  {
    q: "Fees?",
    a: "StudioNet is a gasless development environment. Any future network will show protocol fees before you sign — never hidden.",
  },
  {
    q: "Appeals?",
    a: "Either side can appeal inside the window with a bond. Validators re-run the check; the bond deters spam and goes to the eventual winner's side per contract rules.",
  },
  {
    q: "Supported platforms?",
    a: "YouTube, TikTok, X, and Instagram at launch. URLs are allow-listed and shorteners that hide the destination are rejected. The adapter list is extensible.",
  },
  {
    q: "Is this real money?",
    a: "No. Vouch runs on GenLayer StudioNet — a development environment with demo funds only. Do not treat any amount shown as real value.",
  },
];

export default function Home() {
  const showcase = MOCK_DEALS[0];
  return (
    <div className="container-vouch" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <section aria-labelledby="hero-h" className="hero-grid">
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-muted)" }}>
            Creator deals, verified on-chain
          </p>
          <h1 id="hero-h" style={{ fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 1.05, margin: "12px 0" }}>
            Pay when the post is live. Not before.
          </h1>
          <p style={{ fontSize: 18, color: "var(--ink-muted)", maxWidth: 560 }}>
            Brands lock funds in a contract. Validators open the real post, check it against your brief, and release payment only if it complies.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <Link href="/deals/new" className="btn btn-accent">Create a deal</Link>
            <Link href="/deals" className="btn btn-ghost">I&apos;m a creator</Link>
          </div>
        </div>
        <aside className="card" aria-label="New deal quick start" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>New deal</h2>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 12 }}>Prefills the full form — nothing is signed here.</p>
          <form action="/deals/new" method="get" style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
              Creator handle
              <input name="creator" placeholder="@creator" autoComplete="off" style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--border)", padding: "0 12px", background: "var(--bg)", color: "var(--ink)" }} />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
              Brief
              <textarea name="brief" rows={3} placeholder="Mention product, show on camera…" style={{ borderRadius: 10, border: "1px solid var(--border)", padding: 12, background: "var(--bg)", color: "var(--ink)" }} />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
              Escrow amount (GEN)
              <input name="amount" inputMode="decimal" placeholder="250" style={{ minHeight: 44, borderRadius: 10, border: "1px solid var(--border)", padding: "0 12px", background: "var(--bg)", color: "var(--ink)" }} />
            </label>
            <button type="submit" className="btn btn-accent">Lock funds</button>
            <p style={{ fontSize: 12, color: "var(--ink-muted)" }}>StudioNet demo — no real funds.</p>
          </form>
        </aside>
      </section>

      <section aria-labelledby="how-h" style={{ marginTop: 48 }}>
        <h2 id="how-h" style={{ fontSize: 28 }}>How it works</h2>
        <div className="steps-grid" style={{ marginTop: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 20 }}>01</div>
            <h3>Write the brief</h3>
            <p style={{ color: "var(--ink-muted)" }}>Plain English: mention, show on camera, disclose #ad, stay live N days.</p>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 20 }}>02</div>
            <h3>Creator posts</h3>
            <p style={{ color: "var(--ink-muted)" }}>Creator publishes and submits the public post URL before the deadline.</p>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 20 }}>03</div>
            <h3>Validators vouch</h3>
            <p style={{ color: "var(--ink-muted)" }}>Independent validators open the live post, reach consensus, and funds move automatically.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-h" style={{ marginTop: 48 }}>
        <h2 id="live-h" style={{ fontSize: 28 }}>Live verification</h2>
        <p style={{ color: "var(--ink-muted)" }}>Sample deal — real deals appear here once the contract is deployed (Milestone 3).</p>
        <div className="card" style={{ padding: 20, marginTop: 16, background: "var(--surface)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <strong>{showcase.id}</strong>
            <StatusBadge status={showcase.status} />
            <span style={{ marginLeft: "auto", fontWeight: 700 }} className="font-display">{showcase.amount}</span>
          </div>
          <ul style={{ marginTop: 12, display: "grid", gap: 8, listStyle: "none", padding: 0 }}>
            {showcase.requirements.map((r) => (
              <li key={r.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: r.met === "pass" ? "var(--accent)" : "var(--pending-bg)", color: r.met === "pass" ? "var(--accent-ink)" : "var(--pending-ink)", fontSize: 13 }}>
                  {r.met === "pass" ? "✓" : "…"}
                </span>
                {r.label} — {r.met === "pass" ? "Pass" : "Pending"}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 12, background: "var(--surface-invert)", color: "var(--bg)", borderRadius: 12, padding: 16 }}>
            <ConsensusMeter agree={showcase.consensus.agree} total={showcase.consensus.total} />
            <p style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>{showcase.verdictReason}</p>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <Link href={`/deals/${showcase.id}`} className="btn btn-ghost">View evidence</Link>
            <button type="button" className="btn btn-ghost" disabled title="Appeals land in Milestone 6">Appeal</button>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-h" style={{ marginTop: 48 }}>
        <h2 id="faq-h" style={{ fontSize: 28 }}>FAQ</h2>
        <div className="faq-grid" style={{ marginTop: 16 }}>
          {FAQS.map((f) => (
            <details key={f.q} className="card" style={{ padding: 16 }}>
              <summary style={{ fontWeight: 600, cursor: "pointer", minHeight: 44 }}>{f.q}</summary>
              <p style={{ color: "var(--ink-muted)", marginTop: 8 }}>{f.a}</p>
            </details>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/deals/new" className="btn btn-accent">Create a deal</Link>
          <Link href="/faq" className="btn btn-ghost">All questions</Link>
        </div>
      </section>
    </div>
  );
}
