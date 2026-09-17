---
name: ci
description: Writes pipeline configuration that runs `postman collection run` and `postman spec lint` as two independently failing checks on every pull request and branch update. Use when the user asks to "add Postman to CI", "run the collection on every PR", "fail the build if the API contract breaks", or "enforce governance rules in the pipeline". Configures the pipeline; for a single local run or lint outside a pipeline, invoke the CLI command directly instead of using this skill. Distinct from the monitoring skill's scheduled check against an already-deployed environment. Requires bootstrap.
---

# Run Postman Checks in CI

## Overview

Wire the same checks a human runs locally into the pipeline, each as its own
step: `postman collection run <collection>` for functional/contract tests,
and `postman spec lint <spec> --workspace-id <id> -f error` for API
Governance rules (governance rulesets come from `--workspace-id`;
`-f/--fail-severity` sets the build-fail threshold). A Postman API
Builder-bound API, rather than a git-native spec, uses `postman api lint`
instead — a different, older entity model, not this plugin's default.
These check two different things and must stay two independent steps with
two independent fail states — collapsing them hides which one actually
broke. Requires `bootstrap` to have resolved CLI auth and the
collection/spec path.

## Critical Rules

1. **Never collapse `collection run` and `spec lint` into one pass/fail.** A
   failed request assertion and a governance rule violation are different
   problems with different fixes.

   ```yaml
   # WRONG — one step, one exit code hides which check broke
   - run: postman collection run api.json && postman spec lint spec.yaml --workspace-id $WS -f error

   # CORRECT — two steps, two independent fail states
   - run: postman collection run api.json
   - run: postman spec lint spec.yaml --workspace-id $WS -f error
   ```
2. **Hard fail the build on any failed assertion or rule.** A check that
   can't fail the build isn't a check.
3. **Secrets come from the CI provider's secret store.** Never write an API
   key or environment value into the workflow file or commit it to the repo.

   ```yaml
   # WRONG — key committed in plain text
   - run: postman collection run api.json --postman-api-key PMAK-abc123...

   # CORRECT — key read from the provider's secret store at run time
   - run: postman collection run api.json
     env:
       POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
   ```
4. **Run the same collection a human runs locally.** Do not fork a CI-only
   copy of the requests or test scripts.
5. **Invoke `postman collection run`, never `newman run`.** The CLI is the
   supported runner and is what every other skill here assumes. Reaching for
   Newman forks the toolchain and silently skips governance.
6. **Every job added must block merge, or it is not a gate.** A check that
   runs but cannot prevent a merge is decoration. Name which branches and
   environments it gates and confirm that with the user.
7. **Don't reach for API Catalog.** Catalog ingests CI results on its own
   once the CLI reports them; this skill's job ends at running the two
   commands and failing the build correctly, not at touching Catalog
   directly.

## Verification

- Two visibly separate steps in the pipeline config, each independently
  able to fail the build.
- No secret value appears literally in the committed workflow file.
