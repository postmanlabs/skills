---
name: bootstrap
description: Resolves the Postman CLI, authenticates, links the workspace, and records this repo's spec path, collections directory and workspace id. Use when the user asks to "set up Postman here", "connect this repo to Postman", "link this workspace", or "run postman init" — and before the mocking, ci, monitoring or api-documentation skills only when the CLI, the linked workspace or the spec path has not already been confirmed in this session. Those skills stop and point back here if it has not completed; they never re-derive these values themselves.
---

# Bootstrap Postman for This Repo

## Overview

A one-time, idempotent setup every other Postman skill in this plugin depends
on. Authenticate with `postman login`, then run this repo's `postman init`
(see the root README) to fetch `manifest.json` and write the skill bindings —
the values behind `{{POSTMAN_BINDINGS}}`: spec path, collections directory,
workspace id. Nothing downstream re-derives or guesses these — they read
what this skill recorded.

There's no single CLI verb for "confirm the workspace is linked and synced."
Check `postman workspace -h` rather than assume one — `create`,
`connect-git`, `pull`, `push`, `prepare`, and `lint` are the real
subcommands, each a different direction (new workspace, bind an existing
one, cloud→local, local→cloud, validate before push, validate in place).

## Resolving the invocation

Work down this ladder and stop at the first rung that answers. Record the
absolute path you settled on so later sessions skip straight to rung 1.

1. `$CLAUDE_PLUGIN_DATA/postman-bin`, if it exists and holds an absolute path —
   verify it with `--version` and use it. This is the normal case after the
   first session.
2. `postman --version`. If a global install answers, record its path with
   `command -v postman > "$CLAUDE_PLUGIN_DATA/postman-bin"` and use it.
3. Install once into the plugin's own data directory, then record it:

   ```
   npm install --prefix "$CLAUDE_PLUGIN_DATA" --no-save postman-cli
   printf '%s\n' "$CLAUDE_PLUGIN_DATA/node_modules/.bin/postman" \
     > "$CLAUDE_PLUGIN_DATA/postman-bin"
   ```

   This happens once per machine, not once per session. Tell the user it is
   happening and that it will not recur.
4. Only if rung 3 fails — no Node, no network, no write access — fall back to
   `npx --yes --package=postman-cli postman` for this session alone, and say
   that every call will re-resolve the package from the registry.
5. If rung 4 also fails, the CLI is genuinely unavailable. Say which rung
   failed and why before considering `postman-mcp-fallback`.

See [reference/cli_installation.md](reference/cli_installation.md) for the
per-platform install/update/uninstall commands behind rungs 2-4 (npm,
curl, PowerShell).

## Critical Rules

1. **A missing `postman` binary is never a reason to switch to the MCP
   fallback.** Rung 3 installs the real CLI into the plugin's own data
   directory. Routing to `postman-mcp-fallback` because the binary is not on
   `PATH` defeats the entire point of this plugin. Only no shell, no Node, or a
   hosted session that cannot install qualifies.
2. **Never record an `npx` invocation as the resolved answer.** `npx`
   re-resolves the package from the registry on every call, so persisting it
   makes every later session pay a network fetch. Only an absolute path gets
   recorded.
3. **Never fabricate a workspace id, spec path, or collections directory.**
   If the CLI can't resolve one, report the gap and stop. A guessed value
   here corrupts every skill that trusts it downstream.
4. **Check existing state before setting anything up.** Detect what's already
   true — CLI installed? already logged in? workspace already linked? — and
   skip finished steps. Don't assume a blank slate, and don't assume nothing
   needs to happen just because the CLI is present.
5. **Wire up an existing repo only. Never scaffold a new API.** If there's no
   spec or collection yet, that's a design decision for the user to make.
   Report the gap; do not generate a starter spec to fill it.

## Verification

Bootstrap is done only when the resolved invocation has answered a real
`--version`, and workspace id, spec path, and collections directory are all
non-empty and stated back to the user. "The CLI is installed" is not the bar —
those three resolved values are. Never report that Postman is "set up" because
a skill loaded; loading a skill configures nothing.

## Reference

- [Collection Schema v3](reference/collection_schema_v3.md) — the schema for
  the collection files this skill resolves the directory for.
- [CLI Installation](reference/cli_installation.md) — install/update/
  uninstall commands per platform.
