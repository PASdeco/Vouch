# Vouch — Deploy

## Contract (StudioNet)
1. `pip install genlayer-test`
2. `pytest tests/ -v` (direct mode)
3. Deploy via GenLayer Studio (contract file `contracts/vouch_escrow.py`, no constructor args — owner = deployer) or CLI:
   ```bash
   genlayer network set studionet
   genlayer network info
   genlayer deploy --contract contracts/vouch_escrow.py
   ```
4. Wait for FINALIZED **and** verify `receipt.consensus_data.leader_receipt[0].execution_result` is success (finalized ≠ executed).
5. Record address in `web/.env.local` as `NEXT_PUBLIC_CONTRACT_ADDRESS`.

Network (verified 2026-10-06):
- RPC `https://studio.genlayer.com/api`, chain 61999, explorer `https://explorer-studio.genlayer.com`.

## Frontend (Vercel)
1. `cd web && npm install`
2. `cp .env.example .env.local` (fill RPC/chain/contract/explorer)
3. `npm run dev` → http://localhost:3000
4. `npm run build` then deploy `web/` to Vercel with same env vars.
