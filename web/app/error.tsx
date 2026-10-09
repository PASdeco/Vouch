"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-vouch" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <h1 style={{ fontSize: 32 }}>Something went wrong</h1>
      <p style={{ color: "var(--ink-muted)" }}>{error.message || "Unknown error."}</p>
      <button type="button" className="btn btn-accent" onClick={reset} style={{ marginTop: 16 }}>
        Try again
      </button>
    </div>
  );
}
