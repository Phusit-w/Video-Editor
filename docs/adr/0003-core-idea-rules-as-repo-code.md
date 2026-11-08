# Core Idea Rules are repo code, an exception to ADR 0001

The Core Idea record shape and status rules live in one tested JavaScript module, `idea-board/core-idea-rules.js`, even though it calls no external API. ADR 0001 reserves repo code for steps that talk to external APIs, but these rules are not judgement: they are hard checks (HOLD can never be approved, ต้องระวัง needs acknowledgement, SKU only when DIRECT, evidence for science/skin/hair/regulatory topics, which actor may set which status). Hard checks must behave the same for every writer (the Ideation scheduled task, the Idea Board's Idea Gate buttons, Asset Production) and must be testable, which prose rules inside a prompt are not. The module is published next to the Idea Board page, so a cloud scheduled task without this repo reads the same copy the board runs.

ADR 0001 still holds for everything that needs judgement: writing Core Ideas, research and Claim Check stay with Claude, the skills and the brand documents.

## Considered Options

- **Rules written into the scheduled task's prompt:** rejected; untestable, and the board would need its own copy, which would drift.
- **Rules enforced only by the board:** rejected; the scheduled task and Asset Production write to the same database and would bypass them.
