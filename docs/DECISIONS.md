# Vouch — Decisions (living log)

> Blueprint rule: if blueprint conflicts with current docs, follow docs and note here.

## 2026-10-06 — Initial verification (Milestone 1 start)
- **Network target: StudioNet** (dev only, not mainnet).
  - RPC: `https://studio.genlayer.com/api` (probed live, `eth_chainId` → `0xf22f` = 61999)
  - Chain ID: `61999`
  - Explorer: `https://explorer-studio.genlayer.com`
  - Source: `genskill_genlayer_list_networks` + `probe_endpoint_capabilities` + `network_status` (live 2026-10-06).
- **Node health at scaffold:** `degraded` — `stuck_finalizations: 3`, one tx exhausted max recovery. `genvm/database/redis/llm_providers` healthy. Implication: UI must tolerate slow/simulated consensus; don't hard-code validator counts or timing (per blueprint §8).
- **Endpoint gaps (probed):** `balance`/`metrics` HTTP 404, `gen_dbg_ping` / `gen_dbg_traceTransaction` not exposed (`Method not found`). Fallback: use `inspect/status/receipt/report` tools, never trace.
- **Contract runner (pinned):** `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }` — from official `storage` example + `genlayer_scaffold_contract` + Roast (`roast_jury.py`). No comments between header and imports.
- **GenVM hard rules (from `CLINE_GENLAYER_NOTES.md` + docs):**
  - One `class X(gl.Contract)`; storage = class-level annotations with `Address/u256/TreeMap/DynArray` only.
  - No `for` loops (use `while`), no `sorted()/.sort()/lambda`, no `os/sys/subprocess/random/requests/urllib`.
  - Sender = `gl.message.sender_address`. Money = `u256` atto-scale (×10¹⁸).
  - Nondet (`gl.nondet.web.*`, `gl.nondet.exec_prompt`) ONLY inside `leader_fn/validator_fn`/`strict_eq`; storage writes / contract calls / emits ONLY after consensus.
- **Value/escrow (docs `value-transfers`):** `@gl.public.write.payable` + `gl.message.value: u256`; send via `gl.get_contract_at(addr).emit_transfer(...)` or `emit(...).method()`; `self.balance` reads ghost-contract balance. Studio balances are simulated (no EVM layer). Decision: implement real payable escrow (works on StudioNet demo) and mark StudioNet/demo-only in UI + README.
- **Equivalence (docs `equivalence-principle`):** custom `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)`; compare stable fields (`overall` + per-requirement `met` booleans), never free-text `reason`. `UNCLEAR` never moves money. Validator must re-run task independently (no leader-output-only checks).
- **SDK:** `genlayer-js` (`createClient/createAccount`, `genlayer-js/chains` `studionet`, `readContract/writeContract({value})/waitForTransactionReceipt`, `TransactionStatus.ACCEPTED`) — pattern copied from Roast `web/src/server/genlayer-service.ts` (verified working on StudioNet).
- **Tests:** `genlayer-test` 0.29.2 installed. Strategy: direct-mode first (`direct_deploy/mock_web/mock_llm/run_validator`), Studio mode last.
- **Frontend stack locked:** Next.js App Router + TS + Tailwind v4 (same majors as Roast: next 16.3.2 / react 19) to avoid version drift. Custom `data-theme` toggle (not `next-themes`) per blueprint §5.

## 2026-10-06 — Milestone 3 deployed + verified on StudioNet
- **Contract:** `contracts/vouch_escrow.py` → `0xab8E0Be92141F7bD267dC88E6904aA15519B9650`
  deploy tx `0xd22d4f932e8ffb1bd37219333dbb6adae52fd73e3ee5a059a15e4d0784cc8b9c` (FINALIZED, 5/5 agree, execution SUCCESS).
- **Lint:** `genlayer_lint_contract` 0 errors, 0 warnings. **Tests:** 11/11 direct-mode pass (`pytest tests/ -v`).
- **Real deal VOUCH-1** (brand=creator=deployer, 0.01 GEN, youtube): create + submit ACCEPTED; first `verify` → UNDETERMINED (YouTube bot-fetch varies by node — known platform risk); retry → consensus **UNCLEAR** stored on-chain ("generic About page, no evidence") with status VERIFYING. Proves fetch→LLM→equivalence→storage pipeline; UNCLEAR correctly moves no money.
- **Deviation:** hosted Studionet lacks `gen_getContractState/Code/Schema` (code -32603); reads/writes via `genlayer-js` `gen_call` work fine (used for all smoke ops).
- **min_live_days choice:** single escrow + `recheck_live` gate before `claim` (no tranches); documented in ARCHITECTURE.
