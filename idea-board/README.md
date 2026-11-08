# Idea Board

The Idea Board is a published Claude Artifact with its own shared database (ADR 0002).

- Live page: https://claude.ai/artifact/5dV7v7iXxFq8oc3r82ayBS (private to the owner until shared)
- Source: `index.html` plus `core-idea-rules.js`, published as a supporting file next to it (`files: {"core-idea-rules.js": ...}`). Republish both with the Artifact tool, passing the URL above as `url` from any other conversation so the link stays the same. The tool only reads files under its working directory or scratchpad, so copy them there first if this repo is elsewhere.
- Capabilities: `db` with rule `coreIdeas` read: view, write: admin; `user`. Only viewers at admin level (the owner in Phase 1) see the Idea Gate buttons.

## Database

| Collection | Doc id | Written by |
|---|---|---|
| `coreIdeas` | Core Idea id | Ideation (scheduled task, via `ArtifactData`) and the board's Idea Gate buttons |

Field names follow the Core Idea record in spec issue #1 (camelCase); `core-idea-rules.js` owns the shape: `batchId`, `createdAt` (ISO 8601 UTC), `status`, `primaryPillar`, `topicTerritory`, `productLinkage`, `sku`, `contentJob`, `funnelStage`, `readerProblem`, `hook`, `keyMessage`, `evidenceSources` (`[{title, url}]`), `caveats`, `claimStatus`, `claimReason`, `suggestedFormat`, `targetChannels`, `topicInboxId`, `reviseComment`, `rejectionReason`, `riskAcknowledged`. Writers may add `createdBy` (e.g. `scheduled-task`). The board adds `decidedAt` (ISO 8601 UTC) on each Idea Gate action.

The board lists Core Ideas newest first (status, Pillar, linkage, Claim Status and reason, Hook, key message, any rule violations). Proposed cards carry อนุมัติ / ขอแก้ / ไม่อนุมัติ: Approve is disabled for HOLD and for records that break the Rules, and for ต้องระวัง until the owner ticks the acknowledgement box; ขอแก้ and ไม่อนุมัติ open a text box that must be filled before sending.

## Core Idea Rules

`core-idea-rules.js` owns the Core Idea record shape and every status rule (spec issue #1). It exports:

- `validateCoreIdea(record)` → `{ok, errors: [{field, message}]}`: required fields, allowed values, one Primary Pillar, SKU only and always when DIRECT and then exactly one of the three `SKUS` from the Product Reference Master's Product Registry, an evidence source when the Topic Territory is about science, skin, hair or regulation (`needsEvidence`, keyword match in English and Thai), a Claim reason unless ผ่าน, and a Revise comment / Rejection Reason matching the status.
- `applyTransition(record, {actor, to, comment?, reason?, riskAcknowledged?})` → `{ok, record}` or `{ok: false, code, reason}`. Actors: `Ideation` (new → Proposed, Revise → Proposed), `Human` (Proposed → Approved | Revise | Rejected), `Asset Production` (Approved → In Production). HOLD is never approved; ต้องระวัง needs `riskAcknowledged: true`; Approved, Proposed and In Production need a valid record, while Revise and Rejected work on any Proposed record so a broken Core Idea can still be sent back or turned down. Ideation creates a Core Idea by passing the record *without* a `status`; it then comes back with `status: "Proposed"`. A re-proposed Revise Core Idea keeps its `reviseComment` and loses any earlier `riskAcknowledged`.

Every writer goes through it: the board before each Idea Gate action (re-applied to the freshly read document), the weekly Ideation run before writing, Asset Production before claiming. A cloud scheduled task without this repo can fetch the published copy with the Artifact tool (`action: "read"`, `path: "core-idea-rules.js"`).

Not yet enforced: Idea Batch validation (tickets 3–4). When the Product Registry gains a SKU, add its exact name to `SKUS` with a test.

Tests: `npm test` (Node's built-in runner, no dependencies).

## Prototype (ticket 1)

`ideation/prototype-task-prompt.md` is the prompt of the one-shot scheduled task that wrote the test Core Idea `coreIdeas/proto-test-001` (since deleted). Result: see `docs/handoff/` entry for 2026-11-08.
