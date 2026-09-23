# Postman for Agents

Postman's skills for coding agents.

The skill files in this repository are the single source of truth. `postman
init` fetches `manifest.json` over HTTPS, installs the listed files under
`postman/skills/`, and adds a pointer line to the root `AGENTS.md` for agents
that read it.

## Layout

```
plugins/postman/                  Postman's published skill source
  skills/<name>/                  one skill per directory (bootstrap, api-discovery, api-testing, api-mocking, api-monitoring, ci-integration, performance-testing, ai-readiness, collection-schema-v3, ...)
    SKILL.md
manifest.json                     generated index the CLI fetches
scripts/build-manifest.js         regenerates it
```

## Installing

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
frontmatter, where `name` matches the directory. Run the manifest script. The
CLI picks it up with no code change.

## The bindings placeholder

`SKILL.md` may contain `{{POSTMAN_BINDINGS}}`. `postman init` replaces it with a
table of that repository's spec path, collections directory, CLI version, and
workspace id. Anything that consumes a skill without substituting it should leave
the marker alone rather than guess.
