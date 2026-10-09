"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STUDIONET } from "@/lib/chain";

/** Minimal EIP-1193 surface we rely on. */
export type EIP1193Provider = {
  request: (r: { method: string; params?: unknown }) => Promise<unknown>;
  on?: (ev: string, fn: (...args: never[]) => void) => void;
  removeListener?: (ev: string, fn: (...args: never[]) => void) => void;
};

type EIP6963Info = { uuid: string; name: string; icon: string; rdns: string };
type EIP6963Announce = CustomEvent<{ info: EIP6963Info; provider: EIP1193Provider }>;

export type DiscoveredWallet = {
  /** Stable id: EIP-6963 rdns, "walletconnect", or "legacy:<name>". */
  id: string;
  name: string;
  icon?: string;
  provider: EIP1193Provider | null;
  kind: "eip6963" | "legacy" | "walletconnect";
};

type WalletState = {
  address: `0x${string}` | null;
  chainId: number | null;
  connecting: boolean;
  connectingId: string | null;
  error: string | null;
  provider: unknown;
  wallets: DiscoveredWallet[];
  refreshWallets: () => void;
  connectWallet: (id: string) => Promise<void>;
  disconnect: () => void;
  switchToStudioNet: () => Promise<void>;
  wrongNetwork: boolean;
};

const Ctx = createContext<WalletState | null>(null);
const STORAGE_KEY = "vouch-wallet";

// ---------------------------------------------------------------------------
// EIP-6963 discovery (Rabby, Zerion, MetaMask, Coinbase, …)
// ---------------------------------------------------------------------------

const announced = new Map<string, { info: EIP6963Info; provider: EIP1193Provider }>();
let listenerOn = false;

function ensure6963Listener() {
  if (listenerOn || typeof window === "undefined") return;
  listenerOn = true;
  window.addEventListener("eip6963:announceProvider", ((e: EIP6963Announce) => {
    announced.set(e.detail.info.rdns, { info: e.detail.info, provider: e.detail.provider });
  }) as EventListener);
}

function request6963() {
  try {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  } catch { /* ignore */ }
}

function legacyName(p: Record<string, unknown>): string {
  if (p.isRabby) return "Rabby";
  if (p.isZerion) return "Zerion";
  if (p.isMetaMask) return "MetaMask";
  if (p.isCoinbaseWallet) return "Coinbase Wallet";
  if (p.isBraveWallet) return "Brave Wallet";
  if (p.isTrust) return "Trust Wallet";
  if (p.isPhantom) return "Phantom";
  return "Browser wallet";
}

function discoverNow(): DiscoveredWallet[] {
  if (typeof window === "undefined") return [];
  const out: DiscoveredWallet[] = [];
  const seenProviders = new Set<EIP1193Provider>();

  for (const { info, provider } of announced.values()) {
    seenProviders.add(provider);
    out.push({ id: info.rdns, name: info.name, icon: info.icon, provider, kind: "eip6963" });
  }

  const eth = (window as unknown as { ethereum?: EIP1193Provider & { providers?: EIP1193Provider[] } }).ethereum;
  const list = eth?.providers && eth.providers.length > 0 ? eth.providers : eth ? [eth] : [];
  for (const p of list) {
    if (seenProviders.has(p)) continue;
    const name = legacyName(p as unknown as Record<string, unknown>);
    out.push({ id: `legacy:${name}`, name, provider: p, kind: "legacy" });
  }

  if (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    out.push({ id: "walletconnect", name: "WalletConnect", provider: null, kind: "walletconnect" });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<unknown>(null);
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);

  const refreshWallets = useCallback(() => {
    ensure6963Listener();
    request6963();
    // Announcements arrive async; snapshot now + once more shortly after.
    setWallets(discoverNow());
    setTimeout(() => setWallets(discoverNow()), 500);
  }, []);

  useEffect(() => {
    refreshWallets();
    // Silent restore: previously used injected wallet, if still authorized.
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (!last || last === "walletconnect") return;
      setTimeout(() => {
        const found = discoverNow().find((w) => w.id === last && w.provider);
        if (!found?.provider) return;
        found.provider
          .request({ method: "eth_accounts" })
          .then((accs) => {
            const list = accs as string[];
            if (list.length === 0) return;
            setAddress(list[0] as `0x${string}`);
            setProvider(found.provider);
            return found.provider!.request({ method: "eth_chainId" }).then((cid) => {
              setChainId(parseInt(String(cid), 16));
            });
          })
          .catch(() => { /* locked or unavailable — user connects manually */ });
      }, 600);
    } catch { /* ignore */ }
  }, [refreshWallets]);

  // Subscribe to account/chain changes on the active provider.
  useEffect(() => {
    const p = provider as EIP1193Provider | null;
    if (!p?.on) return;
    const onAccounts = (accs: never[]) => {
      const list = accs as unknown as string[];
      if (list.length === 0) {
        setAddress(null);
        setProvider(null);
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      } else {
        setAddress(list[0] as `0x${string}`);
      }
    };
    const onChain = (id: never) => setChainId(parseInt(String(id as unknown as string), 16));
    const onDisconnect = () => {
      setAddress(null);
      setProvider(null);
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    };
    p.on("accountsChanged", onAccounts);
    p.on("chainChanged", onChain);
    p.on("disconnect", onDisconnect);
    return () => {
      p.removeListener?.("accountsChanged", onAccounts);
      p.removeListener?.("chainChanged", onChain);
      p.removeListener?.("disconnect", onDisconnect);
    };
  }, [provider]);

  const switchToStudioNet = useCallback(async () => {
    const p = provider as EIP1193Provider | null;
    if (!p) throw new Error("No wallet connected.");
    const hexId = `0x${STUDIONET.chainId.toString(16)}`;
    try {
      await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
    } catch (e) {
      const err = e as { code?: number };
      if (err?.code === 4902) {
        await p.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: hexId,
            chainName: STUDIONET.label,
            rpcUrls: [STUDIONET.rpcUrl],
            blockExplorerUrls: [STUDIONET.explorerUrl],
            nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
          }],
        });
      } else throw e;
    }
    const cid = await p.request({ method: "eth_chainId" });
    setChainId(parseInt(String(cid), 16));
  }, [provider]);

  const connectInjected = useCallback(async (w: DiscoveredWallet) => {
    const p = w.provider;
    if (!p) throw new Error(`${w.name} provider unavailable. Is the extension unlocked?`);
    const accs = (await p.request({ method: "eth_requestAccounts" })) as string[];
    if (accs.length === 0) throw new Error("No accounts returned. Unlock the wallet and try again.");
    setAddress(accs[0] as `0x${string}`);
    setProvider(p);
    const cid = await p.request({ method: "eth_chainId" });
    const nextChain = parseInt(String(cid), 16);
    setChainId(nextChain);
    try { localStorage.setItem(STORAGE_KEY, w.id); } catch { /* ignore */ }
    if (nextChain !== STUDIONET.chainId) {
      setProvider(p);
      const hexId = `0x${STUDIONET.chainId.toString(16)}`;
      try {
        await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
      } catch (e) {
        const err = e as { code?: number };
        if (err?.code === 4902) {
          await p.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: hexId,
              chainName: STUDIONET.label,
              rpcUrls: [STUDIONET.rpcUrl],
              blockExplorerUrls: [STUDIONET.explorerUrl],
              nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
            }],
          });
        } else throw e;
      }
      const cid2 = await p.request({ method: "eth_chainId" });
      setChainId(parseInt(String(cid2), 16));
    }
  }, []);

  const connectWalletConnect = useCallback(async () => {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    if (!projectId) throw new Error("WalletConnect is not configured.");
    const { default: EthereumProvider } = await import("@walletconnect/ethereum-provider");
    const wc = await EthereumProvider.init({
      projectId,
      chains: [STUDIONET.chainId],
      rpcMap: { [STUDIONET.chainId]: STUDIONET.rpcUrl },
      showQrModal: true,
      metadata: {
        name: "Vouch",
        description: "Creator deals, verified on-chain.",
        url: typeof window !== "undefined" ? window.location.origin : "https://vouch.example.com",
        icons: [],
      },
    });
    const accs = (await wc.enable()) as string[];
    if (accs.length === 0) throw new Error("WalletConnect session returned no accounts.");
    setAddress(accs[0] as `0x${string}`);
    setProvider(wc);
    const cid = await (wc as unknown as EIP1193Provider).request({ method: "eth_chainId" });
    setChainId(parseInt(String(cid), 16));
    try { localStorage.setItem(STORAGE_KEY, "walletconnect"); } catch { /* ignore */ }
  }, []);

  const connectWallet = useCallback(async (id: string) => {
    setConnecting(true);
    setConnectingId(id);
    setError(null);
    try {
      if (id === "walletconnect") {
        await connectWalletConnect();
      } else {
        const found = discoverNow().find((w) => w.id === id);
        if (!found) throw new Error("Wallet not found. Is the extension installed and unlocked?");
        await connectInjected(found);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed.");
      throw e;
    } finally {
      setConnecting(false);
      setConnectingId(null);
    }
  }, [connectInjected, connectWalletConnect]);

  const disconnect = useCallback(() => {
    const p = provider as (EIP1193Provider & { disconnect?: () => Promise<void> }) | null;
    try {
      void p?.disconnect?.();
    } catch { /* ignore */ }
    setAddress(null);
    setProvider(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, [provider]);

  const value = useMemo<WalletState>(
    () => ({
      address, chainId, connecting, connectingId, error, provider, wallets,
      refreshWallets, connectWallet, disconnect, switchToStudioNet,
      wrongNetwork: address !== null && chainId !== null && chainId !== STUDIONET.chainId,
    }),
    [address, chainId, connecting, connectingId, error, provider, wallets, refreshWallets, connectWallet, disconnect, switchToStudioNet],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet(): WalletState {
  const w = useContext(Ctx);
  if (!w) throw new Error("useWallet outside provider");
  return w;
}
