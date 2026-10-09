import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 36 }}>How it works</h1>
      <p style={{ color: "var(--ink-muted)", fontSize: 18 }}>Creator deals, verified on-chain. No chasing screenshots — validators open the real post.</p>
      <ol style={{ display: "grid", gap: 16, marginTop: 24, padding: 0, listStyle: "none" }}>
        <li className="card" style={{ padding: 20 }}>
          <h2>01 — Write the brief</h2>
          <p>Brand locks GEN escrow against a plain-English brief: mention the product, show it on camera, disclose #ad, keep the post live N days. Deadline and live-days are enforced on-chain.</p>
        </li>
        <li className="card" style={{ padding: 20 }}>
          <h2>02 — Creator posts</h2>
          <p>Creator publishes on the allow-listed platform and submits the public URL before the deadline. Missed deadline → brand refunds via the expiry path.</p>
        </li>
        <li className="card" style={{ padding: 20 }}>
          <h2>03 — Validators vouch</h2>
          <p>Anyone can trigger verification. Validators fetch the live URL, an LLM judges it strictly against the brief, and consensus forms on the stable outcome (approve/reject + per-requirement booleans). Unclear never moves money — it retries or goes to appeal.</p>
        </li>
      </ol>
      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <Link href="/deals/new" className="btn btn-accent">Create a deal</Link>
        <Link href="/faq" className="btn btn-ghost">FAQ</Link>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 16 }}>Built on GenLayer StudioNet — demo funds only.</p>
    </div>
  );
}
