---
name: xlayer-gas-tracker
description: Read-only gas-price and fee-history monitoring for OKX X Layer (chain 196). Use when an agent needs to time a transaction based on current network congestion.
---

# X Layer Gas Tracker

Three read-only commands against `https://rpc.xlayer.tech` for gas-aware scheduling on X Layer (chain 196). No wallet ops, no signing, no broadcasting.

## Data trust boundary

| Source | Trusted for |
|---|---|
| `rpc.xlayer.tech` | Current block height, gas price, fee history |

All output is JSON on stdout; errors on stderr. Agents should always prefer `--dry-run` when composing a gas-aware transaction plan.

## Commands

### `current-gas`

```
xlayer-gas-tracker current-gas [--json]
```

Returns the current `eth_gasPrice` split into three tiers:

- `safe` — 90% of base fee (cheapest inclusion, likely within 2-3 blocks)
- `standard` — 110% of base fee (next-block inclusion)
- `fast` — 140% of base fee (priority inclusion)

All values in gwei. Use `safe` when scheduling non-urgent transfers.

### `fee-history`

```
xlayer-gas-tracker fee-history [--blocks N]
```

Calls `eth_feeHistory(N, "latest", [25, 50, 75])` and returns reward percentiles for the last N blocks (default 20, max 20). Useful for detecting fee spikes before submitting sensitive transactions (e.g. large swaps on PancakeSwap V3 on X Layer).

### `block-height`

```
xlayer-gas-tracker block-height
```

Returns latest block number + approximate age (3-second block time × blocks-since-now). Use before polling for inclusion.

## Pre-flight dependencies

Before first use:
1. Verify `onchainos` CLI is installed (`onchainos --version`)
2. Verify a wallet exists on chain 196: `onchainos wallet addresses --chain 196`
3. No other configuration required (read-only plugin)

## Non-goals

- Does **not** submit transactions (see `onchainos wallet transfer` for that)
- Does **not** estimate gas for a specific calldata (agents should use `eth_estimateGas` via `onchainos wallet contract-call --dry-run`)
- Does **not** support chains other than 196

## Notes

X Layer uses a 3-second block time and EIP-1559 fees. Reward percentiles from `fee-history` are priority-fee only; add base fee for total gas cost.
