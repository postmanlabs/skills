---
name: api-builder
description: Guide for building high-quality APIs by leveraging postman cli. Use when documenting an existing API, designing or changing apis, or writing API tests in this repo.
---

# API Development Guide

## Overview

<!--postman:bindings-->
Run `postman init` in a repository to record its spec path, collections
directory and workspace id here.
<!--/postman:bindings-->

---

# Process

## 🚀 High-Level Workflow

Working on an API always involves a three phase process, in order. Idea is code never moves ahead of the contract.

1. **Design the api contract.** Write or update the OpenAPI spec, then lint it. Generate the postman collection for the spec. Write appropriate api tests scripts.
2. **Make code satisfy the contract.** Implement the contract and ensure all api tests are passing by running the collection.
3. **Publish.** Ask the user before pushing artifacts to the cloud workspace.

Before you begin, check that this guide is current: run `postman skills status`. If it reports the skills are behind, run `postman skills update` and re-read this file. It is a single conditional request and usually transfers nothing.

---

### Phase 1: Design the Contract

#### 1.1 Research good API design (new endpoints)

When the work is a new feature, decide the design before writing the spec. Resource naming, the HTTP method, the status codes the operation returns, idempotency, pagination, and the error shape. These decisions are the contract, so they come first. Skip this when you are documenting code that already exists.

#### 1.2 Write or update the spec

Write OpenAPI 3 to the spec path the repo declares. Specs are written in postman/specs

Do not guess. If a method, status code, parameter, or auth scheme is not determinable from the code, record it as a gap and leave the field out. A spec that looks complete but is not poisons every assertion built on it.

**When you are documenting code that already exists, work in this order.** Going straight to a text search over the repo is how endpoints get missed and paths come out wrong.

1. **Read the dependency manifest first, and say what you found.** `package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`, `*.csproj`. Name the framework and its version. If the repo holds several manifests, say which service you are documenting rather than silently picking one.
2. **State the registration idiom before you search for it.** Decide, from the framework you just named, what a route registration looks like in this codebase. If the framework is unfamiliar, read its routing API - its README or its route-registration surface, not the whole library.
3. **Start at the entry point and follow the mounts.** The URL prefix is usually not beside the route. Begin where the app or server is constructed and follow every mount - `use`, `include`, `register`, `Group`, a class-level path annotation - to the file it points at. Never document a path without tracing where it is mounted: a route file read on its own gives you `/:id` when the real path is `/items/:id`.
4. **Enumerate, then reconcile.** State how many route registrations you found and how many operations you are emitting, and account for any difference. They are not the same unit: a mount is one registration and no operations, and a resource macro is one registration and several.
5. **Read the guards, do not assume them.** Auth is where a reverse-engineered spec is most often confidently wrong. Read what the guard actually returns and which header it actually checks; a decorator that aborts 403 on a missing `x-owner` is not 401 on a missing `x-api-key`.
6. **Say what you could not reach.** Routes registered in a loop, built from a variable, or added by a plugin. A stated gap is recoverable; a silent one is not.

Tag the spec with its provenance under `info`. A spec written from the code is `x-postman-provenance: implementation`: it describes the code, so assertions built on it catch regressions but cannot find a bug that is already there. A spec written from intent, before the code exists, is `intent` - the more valuable of the two, because it can fail for a real reason.

#### 1.3 Lint the spec

Lint before anything derives from it. A change to the API is not done until the spec changes and the lint passes.

#### 1.4 Generate the collection and environment

Build the collection from the spec. Add appropriate test scripts for the requests.

The collection is a directory of YAML in the Postman Collection v3 format. Read the schema reference before writing any collection file.


---

### Phase 2: Make Code Satisfy the Contract

#### 2.1 Implement

Write or change the implementation so the running service matches the spec. The spec leads; the code follows it.

#### 2.2 Run the collection and surface the result

Prove the endpoint by running the collection. Surface the collection run result to user exactly as it printed, including failures.


---

### Phase 3: Publish

Publishing is the only step that leaves the machine. By default all the artifacts stay in the repo. Only once you push to cloud other team members will be able to view/collaborate on the api. Push should require user consent.

Precondition: the repo must record a workspace id, which `postman init` writes. If it is missing, say so and stop. Do not invent one. Use the default push strategy, which only creates and updates.

---

# Reference Files

## 📚 Documentation Library

Load these as needed during the work.

### Load during Phase 1

- [Collection Schema v3](reference/collection_schema_v3.md) - The Postman Collection v3 directory and YAML format. Read before writing or editing any collection/environment file so you match the schema instead of inventing structure.
