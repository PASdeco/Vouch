# Vouch.

> Pay when the post is live. Not before.

**Vouch** is a creator-deal enforcer built on [GenLayer](https://genlayer.com). A brand locks GEN escrow in an Intelligent Contract against a plain-English brief ("mention the product, show it on camera, keep the post live 30 days"). The creator submits the post URL. GenLayer validators independently open the live post, an LLM judges it strictly against the brief, and validators must reach consensus on the verdict. Compliant → the creator is paid. Non-compliant → the brand is refunded. Either side can appeal with a bond.

Why GenLayer: the judgment is subjective and needs live web access — something normal oracles cannot do.

## How it works

1. **Brand creates a deal** (`/deals/new`) — names the creator wallet, writes the brief, picks a platform, sets escrow, deadline and live-days. Funds lock on-chain → `FUNDED`.
2. **Creator participates** — opens the deal link (or finds it by ID on `/deals`), connects the designated creator wallet, publishes the post, and submits the public URL → `SUBMITTED`.
3. **Anyone triggers verification** — validators fetch the live URL and the LLM returns strict JSON (`live`, per-requirement pass/fail, `overall`, reason). Validators re-run the check independently and vote on the stable fields only → `APPROVED` / `REJECTED` (or `UNCLEAR`, which moves no money).
4. **Appeals** — brand or creator can appeal within 3 days with a 0.05 GEN bond; verification re-runs from scratch.
5. **Claim** — after the `min_live_days` window, the winner claims: creator on approval (`PAID`), brand on rejection/expiry (`REFUNDED`).

## Live deployment (StudioNet)

| Item | Value |
|---|---|
| Contract | `0x2Ec9C7C883b9B13eCAD5D7Ea16A5c7070Bf2dd27` |
| Network | StudioNet — RPC `https://studio.genlayer.com/api`, chain `61999` |
| Explorer | `https://explorer-studio.genlayer.com` |
| Funds | Demo GEN only — no real value |

Verified on-chain behavior includes honest non-approval verdicts: when validators fetch a page with no readable evidence (e.g. an X link serving an empty shell), consensus stores `UNCLEAR` with its reason rather than inventing a verdict, and escrow stays locked.

## Platform support

Verification judges the page content validators can actually fetch anonymously:

| Platform | Status |
|---|---|
| YouTube, static pages | Verifiable — title/description text is present in fetched HTML |
| `web.archive.org` snapshots | Supported fallback as alternate proof URL (allow-listed for any deal) |
| X / TikTok / Instagram | Handled gracefully — bot-walled pages yield `UNCLEAR`, funds never move on unreadable evidence |

Text-checkable requirements (mentions, links, disclosures in titles/descriptions) verify reliably. Visually-only proof (e.g. "appeared on camera") cannot be confirmed from a walled platform's fetch shell — the contract refuses to approve rather than guess.

## Run it in 10 minutes

```bash
git clone https://github.com/PASdeco/Vouch.git && cd Vouch
cd web && npm install
cp .env.example .env.local   # StudioNet RPC + contract address included
npm run dev                  # http://localhost:3000
```

- Contract tests (no network): `python -m pytest tests/ -v` — 11 direct-mode tests covering the lifecycle, appeals, auth, malformed LLM output and injection pages.
- Production build: `npm run build`.
- E2E specs: `web/e2e/flows.spec.ts` (Playwright).
- Connect any EVM wallet (MetaMask, Rabby, Zerion via EIP-6963, or WalletConnect QR) — the app switches it to StudioNet automatically. Set `NEXT_PUBLIC_MOCK_MODE=true` for the offline seeded demo.

## Repository layout

```
contracts/            vouch_escrow.py — escrow + validator verification
tests/                direct-mode suite (conftest + 11 tests)
web/                  Next.js App Router + TypeScript + Tailwind frontend
  app/                routes: / · /deals · /deals/new · /deals/[id] · docs pages
  components/         wallet, deal cards, consensus, tx lifecycle UI
  lib/                single genlayer-js entrypoint, wallet layer, zod models
  e2e/                Playwright flows
docs/                 ARCHITECTURE.md · DECISIONS.md · DEPLOY.md
scripts/              StudioNet deploy + smoke scripts
```

## Known limitations

- Walled social platforms may block validator fetching (observed live); the system returns `UNCLEAR` and never pays on missing evidence.
- StudioNet escrow uses simulated balances and a small validator set — demo only.
- Claim unlocks after the `min_live_days` window by design (enforced on-chain), so same-session payout demos are not possible.
- Hosted StudioNet does not expose contract-state RPCs; the app uses `genlayer-js` reads/writes only.

Details and every deviation from the original blueprint are logged in `docs/DECISIONS.md`.
