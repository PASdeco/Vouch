import Link from "next/link";
import type { Deal } from "@/lib/deals";
import { countdown } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

export function DealCard({ deal }: { deal: Deal }) {
  return (
    <Link href={`/deals/${deal.id}`} className="card" style={{ padding: 16, display: "block" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <strong>{deal.id}</strong>
        <StatusBadge status={deal.status} />
        <span style={{ marginLeft: "auto", fontWeight: 700 }} className="font-display">
          {deal.amount}
        </span>
      </div>
      <p style={{ color: "var(--ink-muted)", fontSize: 14, marginTop: 8 }}>{deal.brief.slice(0, 120)}</p>
      <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 8 }}>
        {deal.platform} — {countdown(deal.deadline)}
      </div>
    </Link>
  );
}
