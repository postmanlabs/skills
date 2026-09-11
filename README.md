# Postman for Agents

Postman's skills for coding agents.

The skill files in this repository are the single source of truth. They reach a
developer two ways, and both read the same bytes:

| Route | How it gets the files | Lands at |
| --- | --- | --- |
| Claude Code plugin | `/plugin marketplace add postmanlabs/skills` clones this repo | Claude's plugin dir |
| Postman CLI | `postman init` fetches `manifest.json` over HTTPS | `postman/skills/` in the repo |

Codex and other agents that read `AGENTS.md` are served by the CLI route:
`postman init` writes the skills into the repository and adds a pointer line to
the root `AGENTS.md`.

## Layout

```
.claude-plugin/marketplace.json   the marketplace Claude Code adds
plugins/postman/                  the plugin
  .claude-plugin/plugin.json
  skills/api-builder/
    SKILL.md
    reference/collection_schema_v3.md
manifest.json                     generated index the CLI fetches
scripts/build-manifest.js         regenerates it
```

## Installing

**As a Claude Code plugin:**

```
/plugin marketplace add postmanlabs/skills
/plugin install postman@postman
```

**Into a repository, via the CLI:**

```
postman init
```

## Changing a skill

1. Edit the file under `plugins/<plugin>/skills/<skill>/`.
2. Run `node scripts/build-manifest.js`.
3. Commit both. CI runs `--check` and fails if you forget step 2.

Step 2 is not optional. `manifest.json` carries a `sha256` per file and the CLI
rejects a file whose bytes do not match, falling back to the copy compiled into
the CLI binary. A stale manifest therefore does not break loudly — it quietly
serves an old skill.

Pushing to `main` deploys the whole repository to GitHub Pages, so the CLI picks
up an edited skill as soon as it lands. That is the point of keeping the content
here rather than in the CLI: a skill fix ships in minutes instead of waiting for
a CLI release.

## Adding a skill

Create `plugins/postman/skills/<name>/SKILL.md` with `name` and `description`
frontmatter, where `name` matches the directory. Run the manifest script. Both
routes pick it up with no code change on either side.

## The bindings placeholder

`SKILL.md` may contain `{{POSTMAN_BINDINGS}}`. `postman init` replaces it with a
table of that repository's spec path, collections directory, CLI version, and
workspace id. Anything that consumes a skill without substituting it should leave
the marker alone rather than guess.
