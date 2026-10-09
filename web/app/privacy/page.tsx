export default function PrivacyPage() {
  return (
    <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 36 }}>Privacy</h1>
      <p style={{ color: "var(--ink-muted)" }}>StudioNet prototype — placeholder.</p>
      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <p>We store only what you submit (briefs, URLs) plus wallet addresses for deals. No keys are stored — wallets stay in your browser. Analytics, if enabled, is privacy-friendly and optional via env.</p>
      </div>
    </div>
  );
}
