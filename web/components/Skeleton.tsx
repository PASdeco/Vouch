export function Skeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} style={{ display: "grid", gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ height: 56, borderRadius: 14, background: "var(--border)", opacity: 0.6 }}
        />
      ))}
      <span style={{ position: "absolute", left: -9999 }}>Loading {label}…</span>
    </div>
  );
}
