/**
 * Deploys VouchEscrow to StudioNet using the backend wallet.
 * Key source (never logged): Vouch/.env BACKEND_PRIVATE_KEY,
 * else Roast/.env BACKEND_PRIVATE_KEY (owner-approved reuse).
 * Run: node scripts/deploy.mjs  (from C:\\Vibecode\\Vouch)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

function loadDotEnv(path) {
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
    }
  } catch { /* missing file is fine */ }
}

loadDotEnv("C:\\Vibecode\\Vouch\\.env");
if (!process.env.BACKEND_PRIVATE_KEY) loadDotEnv("C:\\Vibecode\\Roast\\.env");

const key = process.env.BACKEND_PRIVATE_KEY;
if (!key) throw new Error("Missing BACKEND_PRIVATE_KEY (Vouch/.env or Roast/.env).");

const account = createAccount(key);
const client = createClient({ chain: studionet, account });
console.log(`network: studionet`);
console.log(`deployer: ${account.address}`);

const codePath = existsSync("contracts/vouch_escrow.py")
  ? "contracts/vouch_escrow.py"
  : "../contracts/vouch_escrow.py";
const code = readFileSync(codePath, "utf8");
console.log("deploying VouchEscrow…");
const txHash = await client.deployContract({ code });
console.log(`tx: ${txHash}`);
const receipt = await client.waitForTransactionReceipt({
  hash: txHash,
  status: "ACCEPTED",
  interval: 5_000,
  retries: 120,
  fullTransaction: true,
});
const address = receipt?.contract_address ?? receipt?.contractAddress ?? receipt?.data?.contract_address ?? receipt?.address;
console.log(`status: ${receipt?.statusName ?? receipt?.status}`);
console.log(`contract: ${address}`);
console.log(`exec: ${receipt?.txExecutionResultName ?? receipt?.data?.execution_result ?? ""}`);
if (!address) {
  console.error(JSON.stringify(receipt, null, 2).slice(0, 2000));
  throw new Error("Deploy returned no address");
}
console.log(`\nADD TO Vouch/web/.env.local:\nNEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
