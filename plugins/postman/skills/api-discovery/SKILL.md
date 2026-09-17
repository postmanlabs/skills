---
name: api-discovery
description: Finds what APIs, collections, specs, or requests already exist before building something new, and answers questions about how they relate. Use when the user asks "does an API for X already exist," "what depends on this service," "what does this API do," or before scaffolding anything that might already have a Postman equivalent. Covers `postman search`, `postman context-graph`, and `postman context instructions discovery`. Reach for `search` when you know roughly what you're looking for by name; reach for the Context Graph when the question is about relationships, not names.
---

# API Discovery

## Overview

Two different questions, two different tools:

- **"Does something named/shaped like X exist?"** → `search` — keyword and
  filter lookup across concrete elements (requests, collections, specs,
  mocks, workspaces, environments, flows, documents). It matches text; it
  doesn't reason.
- **"How do things relate, or what does this actually do?"** → `context-graph
  ask` — natural-language Q&A over the organization's Context Graph, a
  system built on the relationships between APIs (dependencies, ownership,
  behavior), not on name matching. "What depends on billing-api" or "what
  does postman-app do" are Context Graph questions `search` structurally
  cannot answer — there's no keyword to search for a dependency edge.

Don't default to one for everything. A search that comes back empty answers
"nothing matches that name," not "nothing like this exists" — that second
claim is a Context Graph question, or a broader-`--ownership` search.

## `search`

`search <type> <query>` where type is `requests`, `collections`,
`workspaces`, `flows`, `specs`, `mocks`, `environments`, or `documents`.
Default `--ownership organization` only searches inside your org — pass
`external` or `all` before concluding "no API for this exists," since a
partner or public API published outside the org is invisible at the
default scope. `--filter "method=POST AND workspaceId=ws-123"` narrows
further; see [reference/search_filters.md](reference/search_filters.md) for
the full filter field and operator syntax per element type.

## `context-graph`

`context-graph ask "<question>" --wait` is the one to reach for
interactively — it blocks and prints the answer. Without `--wait`, `ask`
returns an id immediately and `status <askId>` checks on it later (exit
code 3 while still running) — useful for a question expected to take a
while, or from a script polling on its own cadence. The query runs against
the team derived from the API key; there's no workspace/team selection.
`--max-steps` caps how much reasoning the service does per question.

The answer is generated, not retrieved verbatim — treat it as a lead to
verify against a concrete source (`search`, `context collection get`)
before acting on it for anything consequential, the same way any AI-
generated claim gets checked before it drives a decision.

## `context instructions discovery`

Postman ships its own prescribed discovery workflow for AI coding agents —
`postman context instructions discovery` prints it. Read this before
building a custom discovery flow out of `search`/`context-graph` primitives;
it's Postman's own recommended sequence, not a blank slate to reinvent.

## After discovery: reusing what was found

`dependency add <type> <nameOrId>` formally adds a collection, environment,
or mock found in another workspace as a dependency of the current one —
the step after discovery finds something worth reusing (e.g., feeding
`application test`'s contract matching), rather than copying it in by hand.

## Critical Rules

1. **An empty default-scope `search` is not proof nothing exists.** Retry
   with `--ownership all` before reporting "no API for this" to the user.
2. **A Context Graph answer is generated reasoning, not a database read.**
   Verify it against a concrete source before treating it as fact,
   especially for anything the user will act on.
3. **`search`, `context-graph`, and `context` are Beta or recently added
   surfaces.** Re-run `-h` before trusting a flag name here if the installed
   CLI is newer than this file assumes — these are the commands most likely
   to have changed since this was written.

## Verification

State which tool actually answered the question (search vs. Context Graph)
and at what `--ownership` scope or with what `--max-steps`/query — a
discovery answer is only as trustworthy as the scope it ran at.

## Reference

- [Search filter syntax](reference/search_filters.md) — filter fields and
  operators per element type, and `--filter-json` shape.
