export default function DocsPage() {
  return (
    <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 36 }}>Docs</h1>
      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <h2>Contract</h2>
        <p><code>contracts/vouch_escrow.py</code> — deal escrow + validator verification (Milestone 3). States: FUNDED → SUBMITTED → VERIFYING → APPROVED|REJECTED → PAID|REFUNDED, plus APPEALED and EXPIRED.</p>
        <h2>Integration</h2>
        <p>One wrapper: <code>lib/genlayer/client.ts</code>. Reads via <code>readContract</code>, writes via <code>writeContract</code> with GEN value, wait with <code>waitForTransactionReceipt</code> to ACCEPTED then FINALIZED. See repo <code>docs/ARCHITECTURE.md</code>.</p>
      </div>
    </div>
  );
}
