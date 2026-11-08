# Handoff — Ideation ticket 3: weekly run (2026-11-08)

Ticket: **Weekly run end-to-end (first real Idea Batch)** (draft ticket 3 in `2026-11-06-ideation.md`; not yet published as an issue).

## Result: test run PASSED; owner review and weekly schedule still pending

- Prompt: `ideation/weekly-run-prompt.md`. It reads brand knowledge + `core-idea-rules.js` from the Idea Board, researches the web, writes 8–10 Core Ideas, runs Claim Check, validates the batch with the Rules in Node (`.mjs`), writes with one `ArtifactData` batch, and sends a push notification.
- Brand knowledge lives on the **private** Idea Board under `knowledge/` (5 docs + `MANIFEST.md`, exported 2026-11-08), **not** in this repo. The repo is **public**, so never commit brand docs here. Re-upload all five files (publish with `files`, contentType exactly `text/markdown`) when the claude.ai Project changes.
- The scheduled task must be created **from the Claude app inside the claude.ai Project "capcut video editer"** (Cowork task, permission mode auto). Those tasks get ArtifactData, the Artifact tool and push. A routine created from the CLI with `RemoteTrigger create` has not been verified to get these tools.
- Test routine: `trig_01FAZ93SxbHLbJrjRj17Afxt` "AMOURIQ Ideation (one-off test)", run session `cse_01WFVk3L7LTUySzhoJCbjDJv`. It ran 10:49–10:54 UTC on 2026-11-08 and succeeded. Debug runs from the CLI with `RemoteTrigger list_runs` / `get_run_log`.

## First Idea Batch: `2026-11-08` (10 Core Ideas, all Proposed)

- All 10 pass the Rules, re-checked locally. They cover all 4 Pillars (Understand 2, Choose 3, Care 2, Proof 3). Claim: ผ่าน 2, ต้องระวัง 7, HOLD 1. One DIRECT (`-10`, Castile Soap Lavender, explaining the "สบู่เหลวแท้ 100%*" asterisk).
- Review notes:
  - `-04`, `-08` and `-09` mention Fragrance-free, "อย. รับรอง" and Hypoallergenic, but only to explain or debunk them. That's a valid Proof Before Promises use, but the owner should still look.
  - `-03` is HOLD because no soap-vs-syndet source could be opened.
  - `-08` and `-10` cite the 2021 Thai FDA notification criteria. The run reports a 2022 revision, so check before production.
  - 7 of 10 are ต้องระวัง. If the owner finds this too cautious, tune step 5 of the prompt.

## Next

1. The owner reviews batch `2026-11-08` on the board. Record the approval rate here (target ≥ 50%).
2. The owner tells the same Claude app chat to run the task every Monday 08:47 Asia/Bangkok. Verify with `RemoteTrigger list` that the cron is `47 1 * * 1` (UTC).
3. Then tickets 4–6, which unblock once 3 closes. Ticket 7 (board filters, approval rate, brand design) can start any time.

## Owner's bigger goal: idea → image/video → post (like N.SHOP Autopilot)

The owner asked whether the system can go all the way from idea to image/video to a published post. Reference: https://claude.ai/artifact/XzPySCjMfHHfV7gfab6Be5, the N.SHOP Autopilot desktop app. It uses Google Flow on real product photos and posts by driving a logged-in Chrome window, so the computer must stay on. It has no mandatory approval gate.

Our design, already decided in `2026-11-08-asset-production.md`, keeps its production and posting mechanics but differs on purpose:
- an Asset Gate before anything is posted
- official platform APIs, not browser automation (TikTok can only upload to draft)
- runs in the cloud

Next step there is the Asset Production `/prototype`. The owner needs to provide:
- a **Gemini API key**, kept out of chat and out of the repo
- the **Approved Product Images** for the 3 SKUs

In parallel, the owner should start applying for **Meta developer** and **TikTok developer** access for Publishing.

Open question: the owner asked "ต้องใช้ rea ไหม". The meaning is unclear (React? a real person?) and it was not yet answered. Ask the owner.
