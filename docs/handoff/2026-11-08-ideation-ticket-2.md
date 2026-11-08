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

## Open before ticket 3

- **SKU allow-list:** any non-empty SKU passes. The owner will copy the exact 3 SKUs (names, and codes if present) from `AMOURIQ_PRODUCT_REFERENCE_MASTER.md` in the claude.ai Project. `Data/wc-product-export-*.csv` (in `D:\Claude\AutoClipAMQ`) is the full WooCommerce catalogue (59 products, 201 variations), not the Master; its Castile Soap category has 3 products: Organic Olive Castile Soap - Lavender / - Rosemary / - Rose Geranium.
- **Known limit:** the board cannot pin a document version when writing (last-writer-wins). Low risk with a sole approver, because Ideation is not allowed to rewrite a Proposed Core Idea.
- Ticket 3 writer: create a Core Idea by calling `applyTransition` on a record **without** `status` (`{actor: "Ideation", to: "Proposed"}`); a cloud task can fetch the module with the Artifact tool (`action: "read"`, `path: "core-idea-rules.js"`).
