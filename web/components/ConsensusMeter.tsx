export function ConsensusMeter({ agree, total }: { agree: number; total: number }) {
  const pct = total > 0 ? Math.round((agree / total) * 100) : 0;
  return (
    <div>
      <div style={{ fontWeight: 600 }}>
        {agree} of {total} agree
      </div>
      <div
        role="progressbar"
        aria-valuenow={agree}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Validator consensus"
        style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden", marginTop: 6 }}
      >
        <div style={{ width: `${pct}%`, background: "var(--accent)", height: "100%" }} />
      </div>
    </div>
  );
}
