"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { ConnectWallet } from "./ConnectWallet";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="container-vouch" style={{ display: "flex", alignItems: "center", gap: 16, height: 64 }}>
        <Link href="/" aria-label="Vouch home" style={{ fontWeight: 700, fontSize: 22 }} className="font-display">
          Vouch<span style={{ color: "var(--accent)" }}>.</span>
        </Link>
        <nav aria-label="Primary" className="hidden md:flex" style={{ display: "none" }}>
          <span />
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div className="hidden md:flex" style={{ gap: 8 }}>
            <Link className="btn btn-ghost" href="/deals">Deals</Link>
            <Link className="btn btn-ghost" href="/how-it-works">How it works</Link>
            <Link className="btn btn-ghost" href="/faq">FAQ</Link>
          </div>
          <ThemeToggle />
          <ConnectWallet />
          <button
            type="button"
            className="btn btn-ghost md:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            style={{ padding: "0 12px" }}
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <div className="container-vouch md:hidden" style={{ paddingBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <Link className="btn btn-ghost" href="/deals" onClick={() => setOpen(false)}>Deals</Link>
          <Link className="btn btn-ghost" href="/how-it-works" onClick={() => setOpen(false)}>How it works</Link>
          <Link className="btn btn-ghost" href="/faq" onClick={() => setOpen(false)}>FAQ</Link>
        </div>
      ) : null}
    </header>
  );
}
