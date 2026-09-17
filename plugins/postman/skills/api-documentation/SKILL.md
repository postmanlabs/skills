---
name: api-documentation
description: Publishes Postman's auto-generated API documentation, rendered from an OpenAPI 3.0 definition or a collection rather than hand-written. Use when the user asks to "publish API docs", "generate documentation for this API", "put this on the API Network", or "share a docs link for this collection or spec". Distinct from Documents (freeform collaborative notes) and Spec Hub (the design and authoring surface). Requires bootstrap.
disable-model-invocation: true
---

# Publish API Documentation

## Overview

Postman auto-generates browsable API documentation from an OpenAPI 3.0
definition or from a collection — it is not hand-written prose. This is a
different feature from Documents (freeform notes alongside a workspace) and
Spec Hub (where the spec itself is authored); don't conflate them. Requires
`bootstrap`'s resolved spec/collection path.

## Critical Rules

1. **Docs are generated from the spec or collection, never hand-written in
   parallel.** A field with no description is a gap to fix at the source,
   not in a doc written around it — a hand-maintained page drifts from the
   contract that actually ships; generation is what keeps them equal.
   Publish the source and Postman renders the docs from it automatically —
   `postman workspace push` for a git-native spec/collection, or `postman
   api publish <apiId>` for a Postman API Builder-bound API (US region
   only). There is no CLI command literally named "generate docs."
2. **Publishing externally requires explicit consent; regenerating a
   local/private preview does not.** External means the Postman API Network
   or a public domain — either makes the docs reachable outside the team.
3. **State which source rendered the docs when both a spec and a collection
   exist.** They can disagree; say which one the reader is looking at.

## Verification

- The published content traces back to the spec/collection, not to prose
  written specifically for the doc page.
- External publish only happened after explicit consent was given.
- The published URL was returned and confirmed to resolve. A successful
  publish call is not the same as a reachable page.
