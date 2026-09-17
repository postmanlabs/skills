---
name: monitoring
description: Runs and reports an existing Postman Monitor — a scheduled check against an already-deployed environment. Use when the user asks to "monitor this API in production", "set up a scheduled check against the live endpoint", "alert us if the deployed API breaks", or "catch contract regressions between deploys". Distinct from the ci skill's per-push check against a freshly built environment. `postman monitor run` only invokes a Monitor that already exists; no CLI command creates or schedules one. Requires bootstrap.
disable-model-invocation: true
---

# Monitor the Live Endpoint

## Overview

A scheduled check against a deployed environment, using the same collection
a human runs locally and CI runs on push. Monitors catch regressions that
appear between deploys — a dependency changing behavior, a cert expiring,
data drift — not at deploy time. Requires `bootstrap`'s resolved collection
and environment.

## Critical Rules

1. **The CLI cannot create or schedule a Monitor — it can only run one that
   already exists.** The only monitor verb is `postman monitor run <monitorId>`
   (`-t/--timeout`, default 15 min). If no Monitor exists yet, say so plainly,
   then route onward instead of stopping: creation and scheduling happen in the
   Postman app, or through Postman's API — which is reachable as MCP tools via
   `postman-mcp-fallback` when that skill's own preconditions are met. Never
   imply the CLI can create one.
2. **Reuse the existing collection and environment.** Never duplicate
   requests or assertions into monitor-only config.
3. **Never point a monitor at production without explicit consent.** A
   Monitor runs on Postman's infrastructure on a recurring schedule and can
   alert real people — confirm the target environment and alert destination
   with the user first.
4. **Don't invent an alert destination.** Email, Slack channel, webhook —
   whatever the user gives. If they haven't said, ask; don't default to
   nothing meaningful or guess an address.
5. **State the frequency tradeoff instead of picking a number silently.**
   More frequent checks catch regressions faster and spend more monitor
   runs — say what's being chosen and why.

## Verification

- The monitor references the same collection id used locally and in CI —
  not a copy.
- Target environment and alert destination were both explicitly confirmed,
  not assumed.
