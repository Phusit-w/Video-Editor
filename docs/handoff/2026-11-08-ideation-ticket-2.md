# Handoff — Ideation ticket 2: Core Idea Rules + Idea Gate buttons (2026-11-08)

Ticket: **Core Idea Rules + Human Gate buttons** (draft ticket 2 in `2026-11-06-ideation.md`; not yet published as an issue).

## Result: done, verified on the live board by the owner

- `idea-board/core-idea-rules.js`: record validation + status state machine (see `idea-board/README.md`). 47 tests, `npm test`.
- Idea Board (https://claude.ai/artifact/5dV7v7iXxFq8oc3r82ayBS, version 3) has อนุมัติ / ขอแก้ / ไม่อนุมัติ on Proposed cards, with the Rules module published next to the page.
- ADR 0003: the Rules module is repo code, an exception to ADR 0001.

## Owner test on the live board (test Core Ideas seeded by Claude, then deleted)

| Case | Stored result |
|---|---|
| ผ่าน → อนุมัติ | Approved, `decidedAt` set |
| ต้องระวัง → tick acknowledgement → อนุมัติ | Approved, `riskAcknowledged: true` |
| HOLD → อนุมัติ | Not possible; stayed Proposed |
| HOLD → ไม่อนุมัติ with reason | Rejected, `rejectionReason` stored |
| ผ่าน → ขอแก้ with comment | Revise, `reviseComment` stored |

The board's database is empty again.

## SKU allow-list (closed)

`SKUS` in the Rules holds the exact names from §2 Product Registry of `AMOURIQ_PRODUCT_REFERENCE_MASTER.md`; a DIRECT Core Idea must name one of them:

| SKU | Thai FDA |
|---|---|
| AMOURIQ Organic Olive Castile Soap Lavender | 10-1-6800022354 |
| AMOURIQ Organic Virgin Castor Nourishing Oil | 10-1-6900029015 |
| AMOURIQ Organic Virgin Rosehip Nourishing Oil | 10-1-6900030285 |

The Master has no shop SKU codes. Other shop products (Rosemary / Rose Geranium Castile Soap, essential oils, other carrier oils) have no Product Profile, so they can only appear as NONE or SOFT.

## Where the 5 brand documents are

A local copy (exported 2026-11-08) is at `D:\Claude\AutoClipAMQ\Data\Info for AI Automated Content Project-20261108T103533Z-1-001\Info for AI Automated Content Project\`: `brand.md`, `AMOURIQ_PRODUCT_REFERENCE_MASTER.md`, `AMOURIQ_CONTENT_PILLAR_FRAMEWORK_v1.0.md`, `08_Consumer_Psychology_Insights_Strategy.md`, `AMOURIQ_AI_Assisted_Content_Operating_System_Executive_Requirement_Framework.md`. Not copied into this repo. The source of truth stays the claude.ai Project "capcut video editer". `D:\Claude\AutoClipAMQ\Data\wc-product-export-*.csv` is the full WooCommerce catalogue (59 products, 201 variations), not the Master.

## Notes for ticket 3

- **Known limit:** the board cannot pin a document version when writing (last-writer-wins). Low risk with a sole approver, because Ideation is not allowed to rewrite a Proposed Core Idea.
- Ticket 3 writer: create a Core Idea by calling `applyTransition` on a record **without** `status` (`{actor: "Ideation", to: "Proposed"}`); a cloud task can fetch the module with the Artifact tool (`action: "read"`, `path: "core-idea-rules.js"`).
