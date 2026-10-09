export const STUDIONET = {
  label: "GenLayer StudioNet",
  rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC ?? "https://studio.genlayer.com/api",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 61999),
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://explorer-studio.genlayer.com",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "",
  isDemo: true,
} as const;

export function explorerTxUrl(hash: string): string {
  return `${STUDIONET.explorerUrl}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${STUDIONET.explorerUrl}/address/${address}`;
}
