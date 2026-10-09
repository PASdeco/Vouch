import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: 48 }}>
      <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <span className="font-display" style={{ fontWeight: 700 }}>
          Vouch<span style={{ color: "var(--accent)" }}>.</span>
        </span>
        <nav aria-label="Footer" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/docs">Docs</Link>
        </nav>
        <span style={{ marginLeft: "auto", color: "var(--ink-muted)", fontSize: 13 }}>Built on GenLayer StudioNet</span>
      </div>
    </footer>
  );
}
