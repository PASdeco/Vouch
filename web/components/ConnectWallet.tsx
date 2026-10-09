"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, LogOut, QrCode, Wallet } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { shortAddress } from "@/lib/format";
import { STUDIONET } from "@/lib/chain";

export function ConnectWallet() {
  const { address, connecting, connectingId, error, connectWallet, disconnect, wrongNetwork, switchToStudioNet, chainId, provider, wallets, refreshWallets } = useWallet();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pickerOpen) refreshWallets();
  }, [pickerOpen, refreshWallets]);

  useEffect(() => {
    if (!pickerOpen && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPickerOpen(false);
        setMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t)) setMenuOpen(false);
      if (pickerRef.current && !pickerRef.current.contains(t)) setPickerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [pickerOpen, menuOpen]);

  useEffect(() => {
    if (!menuOpen || !address || !provider) return;
    setBalance(null);
    const p = provider as {
      request?: (r: { method: string; params?: unknown }) => Promise<unknown>;
    };
    if (!p.request) return;
    p.request({ method: "eth_getBalance", params: [address, "latest"] })
      .then((hex) => {
        const wei = BigInt(String(hex));
        setBalance(`${Number(wei / 10n ** 14n) / 10000} GEN`);
      })
      .catch(() => setBalance(null));
  }, [menuOpen, address, provider]);

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  if (address) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }} ref={menuRef}>
        {wrongNetwork ? (
          <button type="button" className="btn btn-accent" onClick={() => { void switchToStudioNet(); }}>
            Switch to StudioNet
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-ghost"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          style={{ fontSize: 13 }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 8, height: 8, borderRadius: 999,
              background: wrongNetwork ? "var(--danger)" : "var(--accent)",
              display: "inline-block", marginRight: 8,
            }}
          />
          {shortAddress(address)}
        </button>
        {menuOpen ? (
          <div role="menu" aria-label="Wallet account" className="card" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 280, padding: 16, zIndex: 60, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", overflowWrap: "anywhere" }}>{address}</div>
            <div style={{ fontSize: 13 }}>
              {STUDIONET.label} (chain {chainId ?? "?"}) — {balance ?? "balance…"}
            </div>
            <button type="button" role="menuitem" className="btn btn-ghost" onClick={() => { void copy(); }}>
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? "Copied" : "Copy address"}
            </button>
            <button
              type="button" role="menuitem" className="btn btn-ghost"
              onClick={() => { disconnect(); setMenuOpen(false); }}
            >
              <LogOut size={16} aria-hidden="true" />
              Disconnect
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={pickerRef} style={{ position: "relative" }}>
      <button type="button" className="btn btn-accent" disabled={connecting} onClick={() => setPickerOpen(true)}>
        <Wallet size={16} aria-hidden="true" style={{ marginRight: 8 }} />
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>
      {pickerOpen ? (
        <div role="dialog" aria-modal="true" aria-label="Connect wallet" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
          <div className="card" style={{ padding: 24, minWidth: 340, maxWidth: 400 }}>
            <h2>Connect wallet</h2>
            <p style={{ color: "var(--ink-muted)", fontSize: 14 }}>Read-only browsing works without a wallet. Connecting switches you to StudioNet (chain 61999).</p>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {wallets.length === 0 ? (
                <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>No injected wallets detected in this browser.</p>
              ) : (
                wallets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    autoFocus={wallets[0]?.id === w.id}
                    className="btn btn-accent"
                    disabled={connecting}
                    onClick={() => {
                      void connectWallet(w.id)
                        .then(() => setPickerOpen(false))
                        .catch(() => { /* error shown below */ });
                    }}
                    style={{ justifyContent: "flex-start", gap: 10 }}
                  >
                    {w.kind === "walletconnect" ? (
                      <QrCode size={20} aria-hidden="true" />
                    ) : w.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={w.icon} alt="" width={20} height={20} style={{ borderRadius: 4 }} />
                    ) : (
                      <Wallet size={20} aria-hidden="true" />
                    )}
                    {connecting && connectingId === w.id ? "Connecting…" : w.name}
                    {w.kind === "walletconnect" ? (
                      <span style={{ fontSize: 11, opacity: 0.8, marginLeft: "auto" }}>QR</span>
                    ) : null}
                  </button>
                ))
              )}
              <button type="button" className="btn btn-ghost" onClick={() => setPickerOpen(false)}>Cancel</button>
            </div>
            {error ? <p role="alert" style={{ color: "var(--danger)", marginTop: 8 }}>{error}</p> : null}
            <p style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 8 }}>
              No wallet? <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">MetaMask</a>, <a href="https://rabby.io/" target="_blank" rel="noreferrer">Rabby</a> or <a href="https://zerion.io/" target="_blank" rel="noreferrer">Zerion</a>.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
