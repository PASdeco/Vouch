const FAQS = [
  ["What do validators check?", "The live post URL against the stored brief only — mention, on-camera proof, disclosure, live status."],
  ["What if the post is deleted?", "It verifies as not-live. Funds return to the brand. Creator may appeal with alternate public proof (archive/embed URL)."],
  ["Fees?", "StudioNet is gasless/dem-only. Future networks will show protocol fees before signing."],
  ["Appeals?", "Brand or creator can appeal in-window with a bond. Validators re-run verification; spam is deterred by the bond."],
  ["Supported platforms?", "YouTube, TikTok, X, Instagram at launch. Shorteners and off-domain redirects are rejected."],
  ["Is this real money?", "No — StudioNet prototype with demo funds. No financial advice."],
  ["Why GenLayer?", "Judgment is subjective and needs live web access — normal oracles can't open and judge a post. Validators + consensus can."],
];

export default function FaqPage() {
  return (
    <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 36 }}>FAQ</h1>
      <p style={{ color: "var(--ink-muted)" }}>StudioNet prototype — no financial advice.</p>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {FAQS.map(([q, a]) => (
          <details key={q} className="card" style={{ padding: 16 }}>
            <summary style={{ fontWeight: 600, minHeight: 44, cursor: "pointer" }}>{q}</summary>
            <p style={{ color: "var(--ink-muted)", marginTop: 8 }}>{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
