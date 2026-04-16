#!/usr/bin/env bun
// xlayer-gas-tracker — read-only X Layer (chain 196) gas + fee utilities

const RPC = "https://rpc.xlayer.tech";
const BLOCK_TIME_SEC = 3;

async function rpc<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

function hexToGwei(hex: string): number {
  return Number(BigInt(hex)) / 1e9;
}

async function currentGas() {
  const gas = await rpc<string>("eth_gasPrice");
  const gw = hexToGwei(gas);
  return {
    safe: +(gw * 0.9).toFixed(4),
    standard: +(gw * 1.1).toFixed(4),
    fast: +(gw * 1.4).toFixed(4),
    unit: "gwei",
  };
}

async function feeHistory(blocks = 20) {
  if (blocks > 20) blocks = 20;
  const hist = await rpc<{ reward?: string[][] }>("eth_feeHistory", [
    blocks,
    "latest",
    [25, 50, 75],
  ]);
  const rows = (hist.reward ?? []).map((r) => ({
    p25: hexToGwei(r[0]),
    p50: hexToGwei(r[1]),
    p75: hexToGwei(r[2]),
  }));
  return { blocks, rows };
}

async function blockHeight() {
  const hex = await rpc<string>("eth_blockNumber");
  return { height: Number(BigInt(hex)), blockTimeSec: BLOCK_TIME_SEC };
}

const [cmd, ...args] = process.argv.slice(2);
try {
  let out: unknown;
  if (cmd === "current-gas") out = await currentGas();
  else if (cmd === "fee-history") {
    const i = args.indexOf("--blocks");
    out = await feeHistory(i >= 0 ? Number(args[i + 1]) : 20);
  } else if (cmd === "block-height") out = await blockHeight();
  else {
    console.error("usage: xlayer-gas-tracker <current-gas|fee-history|block-height>");
    process.exit(2);
  }
  console.log(JSON.stringify(out, null, 2));
} catch (e) {
  console.error(String(e));
  process.exit(1);
}
