#!/usr/bin/env node
/**
 * Generates `manifest.json` — the index `postman init` fetches.
 *
 * The Claude Code plugin and the Postman CLI install the same skill files. The
 * plugin gets them by cloning this repository; the CLI has no clone, so it needs
 * an index telling it which files exist, where they land in a user's repo, and
 * what they should hash to. This script derives that index from the files
 * themselves so the two can never disagree.
 *
 * Run `node scripts/build-manifest.js` after changing any skill. CI re-runs it
 * with `--check` and fails if the committed manifest is stale — a wrong sha256
 * makes the CLI reject a legitimate skill, which is a confusing way to find out.
 */
'use strict';

const fs = require('fs'),
    path = require('path'),
    crypto = require('crypto');

const ROOT = path.join(__dirname, '..'),
    PLUGIN_DIR = path.join(ROOT, 'plugins'),
    MANIFEST = path.join(ROOT, 'manifest.json'),
    SCHEMA_VERSION = 1;

/**
 * Lists every file under a directory, depth first, as POSIX-relative paths.
 *
 * @param {string} dir - Directory to walk.
 * @param {string} [prefix] - Accumulated relative prefix.
 * @returns {string[]} Sorted relative paths.
 */
function walk (dir, prefix = '') {
    const out = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            out.push(...walk(path.join(dir, entry.name), rel));
        }
        else if (entry.isFile()) {
            out.push(rel);
        }
    }

    // Sorted so the manifest is stable across filesystems.
    return out.sort();
}

/**
 * @param {string} file - Absolute path.
 * @returns {string} Lowercase hex sha256 of the file's bytes.
 */
function sha256 (file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/**
 * Reads `name` and `description` out of a SKILL.md YAML frontmatter block.
 *
 * Deliberately not a YAML parse: the frontmatter is two scalar fields written by
 * hand, and adding a dependency to this repository to read them would be the
 * only dependency it has.
 *
 * @param {string} file - Path to SKILL.md.
 * @returns {{name: string|null, description: string|null}} Parsed fields.
 */
function frontmatter (file) {
    const text = fs.readFileSync(file, 'utf8'),
        match = /^---\n([\s\S]*?)\n---/.exec(text);

    if (!match) {
        return { name: null, description: null };
    }

    const read = (key) => {
        const found = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(match[1]);

        return found ? found[1].trim() : null;
    };

    return { name: read('name'), description: read('description') };
}

/**
 * Builds the manifest object from the files on disk.
 *
 * @returns {object} Manifest.
 */
function build () {
    const skills = [];

    for (const plugin of fs.readdirSync(PLUGIN_DIR).sort()) {
        const skillsDir = path.join(PLUGIN_DIR, plugin, 'skills');

        if (!fs.existsSync(skillsDir)) {
            continue;
        }

        for (const skill of fs.readdirSync(skillsDir).sort()) {
            const dir = path.join(skillsDir, skill),
                entry = path.join(dir, 'SKILL.md');

            if (!fs.statSync(dir).isDirectory()) {
                continue;
            }

            if (!fs.existsSync(entry)) {
                throw new Error(`${plugin}/${skill}: no SKILL.md`);
            }

            const meta = frontmatter(entry);

            if (meta.name && meta.name !== skill) {
                throw new Error(
                    `${plugin}/${skill}: frontmatter name "${meta.name}" does not match its directory`
                );
            }

            skills.push({
                name: skill,
                plugin,
                description: meta.description,

                // Files are listed with both ends of the copy: `source` is where
                // to fetch from (relative to this manifest, which is also the
                // Pages root), `target` is where it lands under the consuming
                // repo's `postman/skills/<name>/`.
                files: walk(dir).map((rel) => {
                    const abs = path.join(dir, rel);

                    return {
                        target: rel,
                        source: `plugins/${plugin}/skills/${skill}/${rel}`,
                        bytes: fs.statSync(abs).size,
                        sha256: sha256(abs)
                    };
                })
            });
        }
    }

    return { schemaVersion: SCHEMA_VERSION, skills };
}

const manifest = JSON.stringify(build(), null, 2) + '\n';

if (process.argv.includes('--check')) {
    const current = fs.existsSync(MANIFEST) ? fs.readFileSync(MANIFEST, 'utf8') : '';

    if (current !== manifest) {
        console.error('manifest.json is stale. Run `node scripts/build-manifest.js` and commit the result.');
        process.exit(1);
    }

    console.log('manifest.json is up to date.');
}
else {
    fs.writeFileSync(MANIFEST, manifest);
    console.log(`Wrote ${path.relative(ROOT, MANIFEST)}`);
}
