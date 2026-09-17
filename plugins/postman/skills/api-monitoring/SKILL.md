---
name: api-monitoring
description: Triggers and inspects Postman Monitors — scheduled, recurring checks against a live API — and hosts self-hosted execution runners for monitors on a private network. Use when the user asks to "run this monitor now," "check monitor results," or "set up a runner for our internal APIs." The CLI cannot create or schedule a Monitor — only `monitor run` on one that already exists. Covers `postman monitor` and `postman runner`.
---

# API Monitoring

## Overview

A Monitor is a recurring, scheduled check against a live API, created and
scheduled in the Postman app or API — never from this CLI. `postman monitor`
has exactly one subcommand, `run`, and it *invokes* an existing Monitor; it
does not create one. If the task is "set up a new monitor," this skill's
answer is where to create it, not how — the CLI has no verb for it at all.

`postman runner` is a separate, infrastructure-level concern: it starts a
self-hosted execution agent so Monitor runs can reach APIs that live behind
a private network Postman's cloud can't reach directly. It's a one-time
setup step, not something invoked per monitor run.

## Triggering a run

`monitor run <monitorId>` runs an existing Monitor synchronously and prints
the result — useful in CI to get a pass/fail right after a deploy rather
than waiting for the next scheduled tick. `-t/--timeout` (default 15
minutes) caps how long the CLI waits for completion; a timeout hit here is
the CLI giving up on waiting, not the Monitor itself failing — raise it for
a genuinely long collection rather than reporting a false failure.

## Self-hosted runners

`runner start --id <id> --key <key>` (from the Postman app) registers a
runner that executes monitor runs from your own infrastructure instead of
Postman's cloud. This matters only when the monitored API isn't reachable
from the public internet — a public API needs no self-hosted runner; its
Monitor runs on Postman's cloud as scheduled with nothing further to set up.

## Critical Rules

1. **Never present "create a monitor" as a CLI task.** It isn't one. Point
   to the Postman app/API for creation and scheduling, or to
   `postman-mcp-fallback`'s `full` toolset if the user wants it done from an
   agent session — that surface has the create/schedule tools this CLI
   doesn't.
2. **A `monitor run` timeout is a wait cap, not a monitor failure.** Don't
   report "the monitor failed" from a `-t` timeout without checking whether
   the run actually completed (e.g. in the Postman app) after the CLI gave
   up waiting.
3. **`runner start` is a private-network problem's solution, not a default
   step.** Don't suggest setting one up unless the target API genuinely
   isn't reachable from Postman's cloud.

## Verification

State the monitor run's actual pass/fail result and the run id, not just
that the command exited. If a self-hosted runner was started, confirm it
registered (the Postman app shows it as connected) before assuming monitor
runs will route through it.
