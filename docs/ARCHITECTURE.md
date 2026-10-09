# Vouch — Architecture

## Contract states
`FUNDED → SUBMITTED → VERIFYING → APPROVED | REJECTED → (APPEALED → APPROVED | REJECTED) → PAID | REFUNDED`, plus `EXPIRED`.

- `create_deal` (brand, payable) → `FUNDED`
- `submit_post` (creator, before deadline) → `SUBMITTED`
- `verify` (anyone) → `VERIFYING` → `APPROVED`/`REJECTED` (or stays on `UNCLEAR`)
- `appeal` (brand/creator + bond, in window) → `APPEALED` → re-verify → `APPROVED`/`REJECTED`
- `claim` (winner) → `PAID` (creator) / `REFUNDED` (brand)
- `refund_expired` (deadline passed, no post) → `EXPIRED` → `REFUNDED`

See `contracts/vouch_escrow.py` (Milestone 3).

## Verification flow
1. `verify(deal_id)` enters nondet block.
2. Leader: `gl.nondet.web.get(post_url)` (or `render` for JS pages, capped size, allow-listed platforms) → `gl.nondet.exec_prompt` strict-JSON eval vs stored brief → `{live, requirements[], overall, reason}`.
3. Page text wrapped in delimiters; model told to ignore instructions inside; only strict JSON accepted.
4. Consensus: `gl.vm.run_nondet_unsafe` — validators re-run independently, compare `overall` + per-requirement `met` (stable fields). Free-text `reason` stored but never compared.
5. `UNCLEAR` → retry window / appeal, never moves money.
6. `min_live_days` enforced via re-check call after N days (documented in contract).

## Trust assumptions
- Validators honestly fetch live URL + judge vs brief; majority honest.
- Social platforms may block automated fetch → fallback: creator submits alternate public proof URL (archive/embed); adapter list extensible.
- StudioNet is demo-only: escrow simulated, fast/simulated consensus, no real funds.
- Appeal bond anti-spam; double-claim guarded; state updated before transfers.
