import type { DealStatus } from "@/lib/deals";

const COLORS: Record<DealStatus, { bg: string; ink: string; label: string }> = {
  FUNDED: { bg: "var(--border)", ink: "var(--ink)", label: "Funded" },
  SUBMITTED: { bg: "var(--pending-bg)", ink: "var(--pending-ink)", label: "Submitted" },
  VERIFYING: { bg: "var(--pending-bg)", ink: "var(--pending-ink)", label: "Verifying" },
  APPROVED: { bg: "var(--accent)", ink: "var(--accent-ink)", label: "Approved" },
  REJECTED: { bg: "var(--danger)", ink: "#fff", label: "Rejected" },
  APPEALED: { bg: "var(--pending-bg)", ink: "var(--pending-ink)", label: "Appealed" },
  PAID: { bg: "var(--accent)", ink: "var(--accent-ink)", label: "Paid" },
  REFUNDED: { bg: "var(--border)", ink: "var(--ink)", label: "Refunded" },
  EXPIRED: { bg: "var(--border)", ink: "var(--ink)", label: "Expired" },
};

export function StatusBadge({ status }: { status: DealStatus }) {
  const c = COLORS[status];
  return (
    <span className="badge" style={{ background: c.bg, color: c.ink }}>
      {c.label}
    </span>
  );
}
