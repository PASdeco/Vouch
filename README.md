# Vouch.

> Pay when the post is live. Not before.

**Vouch** is a creator-deal enforcer on GenLayer. Brands lock GEN escrow against a plain-English brief. Creators submit the post URL. Validators open the live post, judge it vs the brief, and reach consensus. Compliant → creator paid. Not compliant → brand refunded. Appeals with a 0.05 GEN bond.

- **Contract (StudioNet):** `0xab8E0Be92141F7bD267dC88E6904aA15519B9650` — explorer: https://explorer-studio.genlayer.com
- **Network:** StudioNet RPC `https://studio.genlayer.com/api`, chain `61999` (demo only, no real funds).
- **Frontend:** `web/` (Next.js App Router + TS + Tailwind). Mock mode by default; connect a wallet for live reads/writes.
- **Live URL:** — NOTE: Vercel Deployment Protection (login wall) is currently ON. Make it public in dashboard: Project `web` → Settings → Deployment Protection → disable Vercel Authentication.

## Run in 10 minutes
```bash
cd web
npm install
cp .env.example .env.local   # already contains StudioNet RPC + contract address
npm run dev                  # http://localhost:3000
```
Contract tests: `cd .. && python -m pytest tests/ -v` (11 direct-mode tests, no network).
Production build: `cd web && npm run build`.

## Flows
1. Brand: `/deals/new` → review → sign (payable escrow) → deal FUNDED.
2. Creator: `/deals/[id]` → submit post link → SUBMITTED.
3. Anyone: Run verification → validators fetch live URL → APPROVED/REJECTED (UNCLEAR retries, never pays).
4. After `min_live_days`: `recheck_live`, then winner `claim`s. Loser side appeals with bond inside 3-day window.

## Known limitations
- Some social platforms block automated fetching (observed: YouTube varying by node → UNDETERMINED/UNCLEAR). Fallback: creator submits archive/embed proof URL (allow-listed).
- StudioNet-only escrow (simulated balances), fast/simulated consensus — do not treat amounts as real.
- Hosted Studionet lacks `gen_getContractState/Code/Schema`; app uses `genlayer-js` reads/writes only.
- Validator set small on StudioNet; production needs larger sets + fee profile (v0.6).

See `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/DEPLOY.md`.
