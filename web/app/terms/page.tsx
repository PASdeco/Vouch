export default function TermsPage() {
  return (
    <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 36 }}>Terms</h1>
      <p style={{ color: "var(--ink-muted)" }}>StudioNet prototype — placeholder, no financial advice, demo funds only.</p>
      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <h2>Demo use</h2>
        <p>Vouch escrows demo GEN on a development network. Do not treat amounts as real value.</p>
        <h2>Briefs</h2>
        <p>Brands must only require lawful, public content. Prohibited briefs may be refused by validators.</p>
        <h2>Appeals</h2>
        <p>Appeal bonds and windows are set by the contract and shown before you sign.</p>
      </div>
    </div>
  );
}
