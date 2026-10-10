import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { STUDIONET } from "@/lib/chain";
import { DealSchema, type Deal } from "@/lib/deals";

/** Single genlayer-js entrypoint (blueprint §8). Components never touch the SDK. */

export function getReadClient() {
  return createClient({ chain: studionet });
}

export function getBrowserClient(address: `0x${string}`, provider: unknown) {
  return createClient({
    chain: studionet,
    account: address,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: provider as any,
  });
}

export type TxStage = "signing" | "submitted" | "awaiting-consensus" | "finalized" | "failed";

function toDeal(raw: unknown): Deal {
  const d = raw as Record<string, unknown>;
  const reqs = (d.requirements as { id: string; met: boolean | string }[] | undefined) ?? [];
  return DealSchema.parse({
    id: String(d.id),
    brand: String(d.brand),
    creator: String(d.creator),
    brief: String(d.brief),
    platform: String(d.platform),
    postUrl: String(d.post_url ?? ""),
    amount: `${Number(d.amount) / 1e18} GEN`,
    deadline: new Date(Number(d.deadline) * 1000).toISOString(),
    minLiveDays: Number(d.min_live_days ?? 30),
    status: String(d.status),
    requirements: reqs.map((r) => ({
      id: String(r.id),
      label: String(r.id),
      met: r.met === true ? "pass" : r.met === false ? "fail" : r.met === "unclear" ? "unclear" : "pending",
    })),
    consensus: { agree: 0, total: 3 },
    verdictReason: String(d.verdict_reason ?? ""),
    updatedAt: new Date(Number(d.verified_at || d.created_at) * 1000).toISOString(),
  });
}

export async function fetchDeal(dealId: string): Promise<Deal> {
  const raw = await getReadClient().readContract({
    address: STUDIONET.contractAddress as `0x${string}`,
    functionName: "get_deal",
    args: [dealId],
  });
  return toDeal(raw);
}

export async function fetchDealsByBrand(brand: string): Promise<Deal[]> {
  const raws = (await getReadClient().readContract({
    address: STUDIONET.contractAddress as `0x${string}`,
    functionName: "list_deals_by_brand",
    args: [brand],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any as unknown[]) ?? [];
  return raws.map(toDeal);
}

export async function fetchDealsByCreator(creator: string): Promise<Deal[]> {
  const raws = (await getReadClient().readContract({
    address: STUDIONET.contractAddress as `0x${string}`,
    functionName: "list_deals_by_creator",
    args: [creator],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any as unknown[]) ?? [];
  return raws.map(toDeal);
}

export function isConfigured(): boolean {
  return Boolean(STUDIONET.contractAddress);
}

/**
 * EIP-1193 providers (Rabby, Zerion, WalletConnect, …) commonly reject with
 * plain objects like { code, message } instead of Error instances. Serialize
 * those properly so the UI never shows "[object Object]".
 */
export function stringifyError(e: unknown): string {
  if (e instanceof Error) return e.message || String(e);
  if (typeof e === "string") return e;
  if (e !== null && typeof e === "object") {
    const o = e as Record<string, unknown>;
    for (const key of ["message", "reason", "shortMessage", "details"]) {
      if (typeof o[key] === "string" && (o[key] as string).length > 0) {
        const rest = typeof o["code"] !== "undefined" ? ` (code ${String(o["code"])})` : "";
        return `${o[key] as string}${rest}`;
      }
    }
    try {
      const json = JSON.stringify(o);
      if (json !== "{}") return json.slice(0, 300);
    } catch { /* circular — fall through */ }
  }
  return String(e);
}

export function humanTxError(e: unknown): string {
  if (typeof console !== "undefined" && typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    // Keep the raw rejection in devtools — the UI string is lossy by design.
    console.error("[vouch] tx failure:", e);
  }
  const msg = stringifyError(e);
  if (/user rejected|rejected|denied/i.test(msg)) return "Signature rejected in wallet.";
  if (/insufficient/i.test(msg)) return "Insufficient funds for value + fees.";
  if (/FINISHED_WITH_ERROR/i.test(msg)) return "Contract execution failed — see details.";
  if (/UNDETERMINED/i.test(msg)) return "Validators could not agree — retry verification.";
  if (/\[EXPECTED\]/i.test(msg)) return msg.replace(/.*\[EXPECTED\]\s*/i, "");
  return msg.slice(0, 300);
}
