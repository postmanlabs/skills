---
name: mocking
description: Stands up a Postman mock server generated from the repo's spec examples or a collection's saved responses, so a consumer can build against the contract before the implementation exists. Use when the user asks to "mock this API", "stand up a mock server", or "let the frontend build against this before it is implemented". Defaults to a local mock; a cloud mock is publicly reachable and spends mock-call quota. Requires bootstrap.
---

# Mock the Contract, Not the Implementation

## Overview

Stand up a mock server sourced from the spec's examples or the collection's
saved responses, so a consumer can build against the contract before the
real service exists. Requires `bootstrap` to have already resolved a spec
path or collections directory — stop and point back to it if that hasn't
happened.

## Critical Rules

1. **Mock responses come from the spec or collection, never hand-authored
   directly into the mock config.** If examples don't exist yet, add them to
   the spec/collection first. A response written straight into a mock's
   config is a fixture nobody else can see or update, and it silently
   drifts from the contract it's supposed to represent.

   ```bash
   # WRONG — a response is hand-typed straight into the generated handler
   $EDITOR postman/mocks/orders/handler.js   # added: return a fabricated 200 body

   # CORRECT — the response lives as a saved example on the source request;
   # generation reads it instead of anyone typing a response by hand
   postman mock generate collections/orders.json
   ```
2. **Default to local.** `postman mock generate` (no `--workspace`) followed
   by `postman mock run` costs nothing extra and stays private. A cloud
   mock (`mock generate --workspace <id>`, or `mock deploy --public`) gets a
   public URL and spends mock-call quota — get explicit consent first.
3. **Check staleness before trusting an existing mock.** Record a hash of
   the source spec/collection file at generation time. Before reusing a
   mock, recompute the hash and compare; a mismatch means it's stale, and
   that has to be said before handing the mock to anyone.

## Verification

- Every mocked response traces back to a named example in the spec or
  collection — say which one.
- If reusing an existing mock, the staleness check ran; state the result
  even when it passed.
