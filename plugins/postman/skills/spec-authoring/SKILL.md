---
name: spec-authoring
description: Authors and validates an OpenAPI/AsyncAPI specification tracked in Postman's Spec Hub — a plain spec file, or a git-native multi-file spec directory. Use when the user asks to "write/update this OpenAPI spec," "lint this spec," "check the spec against our governance rules," or "is this spec ready for an AI agent to consume." Covers `postman spec`. Never routes to `postman api` — see bootstrap's Rules on the deprecated API Builder. Depends on bootstrap for the spec path and workspace id (governance rulesets come from the workspace).
---

# Spec Authoring

## Overview

A spec is authored the same way a collection is: by editing the file(s)
directly — standard OpenAPI/AsyncAPI YAML or JSON, or a multi-file Spec Hub
directory with `$ref`s between files. The CLI doesn't generate or scaffold
spec content; it validates, scores, and reads one back. `postman spec` is
the current surface for this — `postman api` targets the deprecated API
Builder (v11-only) and should not be used for a git-native spec, even though
it still runs without warning.

## Process

1. **Author** — edit the spec file(s) directly against the OpenAPI/AsyncAPI
   schema.
2. **Lint against governance, not just syntax** — `spec lint <spec>
   --workspace-id <id>`. Without `--workspace-id`, it only validates the
   spec is well-formed; it doesn't apply the organization's rules. Don't
   report a spec as "linted" from a run that omitted this flag.
3. **Score for agent readiness** — `spec ai-readiness <spec>`, same purpose
   as `collection ai-readiness`: how usable this is for a coding agent to
   consume, not whether it's structurally valid. `--min-score <n>` turns it
   into a CI gate.
4. **Read it back before generating anything downstream** — for a
   multi-file spec, `spec get <spec>` resolves every `$ref`'d file into one
   definition. Use this rather than tracing references by hand, and before
   trusting a downstream tool (SDK generation, mock generation, collection
   creation) that reads the spec as its source.
5. **List to find what exists** — `spec list` with no path lists the
   *workspace's cloud* specs; with a local path/dir it lists local files
   instead. Same ambiguity as `mock list` — state which one ran.

## Critical Rules

1. **`api lint`/`api publish` are the deprecated Builder-era commands.**
   `spec lint` is the correct verb for a git-native spec. See bootstrap's
   Rules for the full reasoning — don't re-derive it here, and don't route
   new spec work to `postman api`.
2. **A lint run without `--workspace-id` proves syntax, not governance.**
   Say explicitly which one was checked before calling a spec "compliant."
3. **Fix the spec, not the generated artifact.** SDK generation, mock
   generation, and collection creation all treat the spec as source of
   truth — a fix applied to what they produced instead of to the spec
   itself gets silently overwritten the next time that generator runs.

## Verification

State the lint severity level checked and whether `--workspace-id` was
passed, plus the ai-readiness score if one was run. For a multi-file spec,
confirm via `spec get` that the resolved definition reflects the edit —
a `$ref` typo can leave a file authored but never actually included.
