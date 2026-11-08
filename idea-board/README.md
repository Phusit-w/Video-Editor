# Idea Board

The Idea Board is a published Claude Artifact with its own shared database (ADR 0002).

- Live page: https://claude.ai/artifact/5dV7v7iXxFq8oc3r82ayBS (private to the owner until shared)
- Source: `index.html` — republish with the Artifact tool, passing the URL above as `url` from any other conversation so the link stays the same.
- Capabilities: `db` with rule `coreIdeas` read: view, write: admin; `user`.

## Database

| Collection | Doc id | Written by |
|---|---|---|
| `coreIdeas` | Core Idea id | Ideation (scheduled task, via `ArtifactData`), later the board's Human Gate buttons (ticket 2) |

Field names follow the Core Idea record in spec #1 (camelCase): `batchId`, `createdAt` (ISO 8601 UTC), `status`, `primaryPillar`, `topicTerritory`, `productLinkage`, `sku`, `contentJob`, `funnelStage`, `readerProblem`, `hook`, `keyMessage`, `evidenceSources` (`[{title, url}]`), `caveats`, `claimStatus`, `claimReason`, `suggestedFormat`, `targetChannels`, `topicInboxId`, `reviseComment`, `rejectionReason`, `riskAcknowledged`.

The board currently lists Core Ideas newest first (status, Pillar, linkage, Claim Status, Hook, key message). No actions yet — those come in ticket 2.

## Prototype (ticket 1)

`ideation/prototype-task-prompt.md` is the prompt of the one-shot scheduled task that wrote the test Core Idea `coreIdeas/proto-test-001`. Result: see `docs/handoff/` entry for 2026-11-08.
