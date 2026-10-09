"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MOCK_DEALS } from "@/lib/mock";
import { DealCard } from "@/components/DealCard";
import { Skeleton } from "@/components/Skeleton";
import { useWallet } from "@/lib/wallet";
import { fetchDealsByBrand, fetchDealsByCreator, isConfigured } from "@/lib/genlayer/client";
import type { Deal, DealStatus } from "@/lib/deals";

const TABS = ["brand", "creator"] as const;
const FILTERS: ("all" | DealStatus)[] = ["all", "FUNDED", "SUBMITTED", "VERIFYING", "APPROVED", "REJECTED", "PAID", "REFUNDED"];

export default function DealsPage() {
  const { address } = useWallet();
  const [tab, setTab] = useState<(typeof TABS)[number]>("brand");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [chainDeals, setChainDeals] = useState<Deal[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);

  const live = Boolean(address && isConfigured() && process.env.NEXT_PUBLIC_MOCK_MODE !== "true");

  useEffect(() => {
    if (!live || !address) {
      setChainDeals(null);
      return;
    }
    setLoading(true);
    setChainError(null);
    (tab === "brand" ? fetchDealsByBrand(address) : fetchDealsByCreator(address))
      .then(setChainDeals)
      .catch((e) => setChainError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [live, address, tab]);

  const source = chainDeals ?? MOCK_DEALS;
  const deals = useMemo(
    () => source.filter((d) => (filter === "all" ? true : d.status === filter)),
    [source, filter],
  );

  return (
    <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <h1 style={{ fontSize: 32 }}>Deals</h1>
      <p style={{ color: "var(--ink-muted)" }}>
        {live ? "Live StudioNet deals for your wallet." : "Mock mode — connect a wallet to read live StudioNet deals."}
      </p>
      <div role="tablist" aria-label="Deal perspective" style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className="btn"
            style={{ background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "var(--accent-ink)" : "var(--ink)", border: "1px solid var(--border)" }}
          >
            As {t}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }} aria-label="Status filter">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className="badge"
            style={{ border: "1px solid var(--border)", background: filter === f ? "var(--surface-invert)" : "transparent", color: filter === f ? "var(--bg)" : "var(--ink)", minHeight: 44, cursor: "pointer" }}
          >
            {f}
          </button>
        ))}
      </div>
      {loading ? <div style={{ marginTop: 16 }}><Skeleton label="deals" /></div> : null}
      {chainError ? <p role="alert" style={{ color: "var(--danger)" }}>{chainError}</p> : null}
      {!loading && deals.length === 0 ? (
        <div className="card" style={{ padding: 24, marginTop: 16, textAlign: "center" }}>
          <p>No deals here yet.</p>
          <Link href="/deals/new" className="btn btn-accent" style={{ marginTop: 12 }}>Create a deal</Link>
        </div>
      ) : !loading ? (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
