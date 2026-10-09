/**
 * Smoke: create + submit + verify one real deal on StudioNet.
 * Brand = creator = backend wallet (owner-approved demo).
 * Run: node scripts/smoke.mjs (from web/)
 */
import { readFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

function loadDotEnv(path) {
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
    }
  } catch { /* ignore */ }
}
loadDotEnv("../.env");
try { loadDotEnv("C:\\Vibecode\\Vouch\\.env"); } catch {}
if (!process.env.BACKEND_PRIVATE_KEY) loadDotEnv("C:\\Vibecode\\Roast\\.env");

const address = process.env.VOUCH_CONTRACT_ADDRESS || "0xab8E0Be92141F7bD267dC88E6904aA15519B9650";
const account = createAccount(process.env.BACKEND_PRIVATE_KEY);
const client = createClient({ chain: studionet, account });
console.log(`deployer/brand/creator: ${account.address}`);

const deadline = Math.floor(Date.now() / 1000) + 30 * 86400;
const brief = "Mention the Vouch demo product by name in the first minute, show the bottle on camera, disclose #ad, keep the post live 30 days.";
console.log("creating deal…");
const createTx = await client.writeContract({
  address, functionName: "create_deal",
  args: [account.address, brief, "youtube", deadline, 30],
  value: 10n ** 16n,
});
console.log(`create tx: ${createTx}`);
await client.waitForTransactionReceipt({ hash: createTx, status: "ACCEPTED", interval: 5_000, retries: 120 });
const deal = await client.readContract({ address, functionName: "get_deal", args: ["VOUCH-1"] });
console.log("deal:", JSON.stringify(deal, null, 2).slice(0, 800));

console.log("submitting post…");
const submitTx = await client.writeContract({
  address, functionName: "submit_post",
  args: ["VOUCH-1", "https://www.youtube.com/about/"], value: 0n,
});
console.log(`submit tx: ${submitTx}`);
await client.waitForTransactionReceipt({ hash: submitTx, status: "ACCEPTED", interval: 5_000, retries: 120 });

console.log("verifying (validators fetch live page — minutes)…");
const verifyTx = await client.writeContract({
  address, functionName: "verify", args: ["VOUCH-1"], value: 0n,
});
console.log(`verify tx: ${verifyTx}`);
const receipt = await client.waitForTransactionReceipt({ hash: verifyTx, status: "ACCEPTED", interval: 10_000, retries: 120, fullTransaction: true });
console.log(`verify status: ${receipt?.statusName ?? receipt?.status}`);
const final = await client.readContract({ address, functionName: "get_deal", args: ["VOUCH-1"] });
console.log("final:", JSON.stringify(final, null, 2).slice(0, 1200));
