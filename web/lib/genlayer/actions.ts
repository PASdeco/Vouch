import { getBrowserClient, humanTxError, isConfigured } from "./client";
import { TransactionStatus } from "genlayer-js/types";
import type { Hash } from "genlayer-js/types";
import { STUDIONET, explorerTxUrl } from "@/lib/chain";
import type { TxStage } from "./client";

export type ActionResult = { tx: string; url: string };

async function write(
  address: `0x${string}`,
  provider: unknown,
  functionName: string,
  args: unknown[],
  value: bigint,
  onStage: (s: TxStage, tx?: string) => void,
): Promise<ActionResult> {
  if (!isConfigured()) throw new Error("Contract not configured.");
  const client = getBrowserClient(address, provider);
  onStage("signing");
  let tx: string;
  try {
    // NOTE: deliberately NOT calling client.connect(). The SDK's connect is
    // MetaMask-coupled: it talks to window.ethereum instead of the configured
    // provider and requires a GenLayer Snap (wallet_getSnaps), so it fails on
    // Rabby, Zerion and WalletConnect. Our wallet layer already guarantees an
    // authorized account on the StudioNet chain before any write.
    tx = (await client.writeContract({
      address: STUDIONET.contractAddress as `0x${string}`,
      functionName,
      args: args as never[],
      value,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as unknown as string;
  } catch (e) {
    onStage("failed");
    throw new Error(humanTxError(e));
  }
  onStage("submitted", tx);
  onStage("awaiting-consensus", tx);
  let receipt: unknown;
  try {
    receipt = await client.waitForTransactionReceipt({ hash: tx as Hash, status: TransactionStatus.ACCEPTED, interval: 5_000, retries: 120 });
  } catch (e) {
    onStage("failed", tx);
    throw new Error(humanTxError(e));
  }
  // Consensus ACCEPTED does not mean execution succeeded: a reverted call
  // (e.g. past deadline) still reaches consensus with status "rollback".
  // Surface the contract's own error message instead of reporting success.
  const execError = findExecutionError(receipt);
  if (execError) {
    onStage("failed", tx);
    throw new Error(humanTxError(execError));
  }
  onStage("finalized", tx);
  return { tx, url: explorerTxUrl(tx) };
}

/** Extracts a contract execution failure from a transaction receipt, if any. */
function findExecutionError(receipt: unknown): unknown {
  if (!receipt || typeof receipt !== "object") return null;
  const r = receipt as Record<string, unknown>;
  const cd = r.consensus_data as Record<string, unknown> | undefined;
  const lr = cd?.leader_receipt as unknown;
  const entries = Array.isArray(lr) ? lr : lr ? [lr] : [];
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const result = (entry as Record<string, unknown>).result as Record<string, unknown> | undefined;
    if (result && (result.status === "rollback" || result.status === "error")) {
      return result.payload ?? result;
    }
  }
  const name = r.txExecutionResultName;
  if (name === "FINISHED_WITH_ERROR") return name;
  if (typeof name === "string" && /ERROR|FAIL|REVERT|ROLLBACK/.test(name) && !/SUCCESS/.test(name)) {
    return name;
  }
  return null;
}

export const dealActions = {
  createDeal: (w: { address: `0x${string}`; provider: unknown }, a: { creator: string; brief: string; platform: string; deadline: number; liveDays: number; amountWei: bigint }, onStage: (s: TxStage, tx?: string) => void) =>
    write(w.address, w.provider, "create_deal", [a.creator, a.brief, a.platform, a.deadline, a.liveDays], a.amountWei, onStage),
  submitPost: (w: { address: `0x${string}`; provider: unknown }, dealId: string, url: string, onStage: (s: TxStage, tx?: string) => void) =>
    write(w.address, w.provider, "submit_post", [dealId, url], 0n, onStage),
  verify: (w: { address: `0x${string}`; provider: unknown }, dealId: string, onStage: (s: TxStage, tx?: string) => void) =>
    write(w.address, w.provider, "verify", [dealId], 0n, onStage),
  recheck: (w: { address: `0x${string}`; provider: unknown }, dealId: string, onStage: (s: TxStage, tx?: string) => void) =>
    write(w.address, w.provider, "recheck_live", [dealId], 0n, onStage),
  appeal: (w: { address: `0x${string}`; provider: unknown }, dealId: string, bondWei: bigint, onStage: (s: TxStage, tx?: string) => void) =>
    write(w.address, w.provider, "appeal", [dealId], bondWei, onStage),
  claim: (w: { address: `0x${string}`; provider: unknown }, dealId: string, onStage: (s: TxStage, tx?: string) => void) =>
    write(w.address, w.provider, "claim", [dealId], 0n, onStage),
  refundExpired: (w: { address: `0x${string}`; provider: unknown }, dealId: string, onStage: (s: TxStage, tx?: string) => void) =>
    write(w.address, w.provider, "refund_expired", [dealId], 0n, onStage),
};
