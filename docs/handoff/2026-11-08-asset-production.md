# Handoff — Asset Production subsystem (2026-11-08)

## Where we are

- Main flow: `/research` → `/grill-with-docs` done for Asset Production. **Next is a `/prototype`, not `/to-spec`** (feasibility is still open).
- Reference product the owner wants to resemble: "N.SHOP Autopilot" (Shopee-affiliate auto-video + auto-post desktop app). We take its production and posting mechanics only, not its affiliate scope.
- Feasibility research: `docs/research/2026-11-08-asset-production-publishing-feasibility.md`.
- New/changed terms are in `GLOSSARY.md`: Asset (per Asset Format, many Posts), Asset Format, Short Video, Production Route, Post Draft, AI Disclosure, Generation Budget, Idea Gate, Asset Gate, Approved Product Images, Asset statuses (Generating, Published + shared Proposed/Revise/Rejected/Approved). Claim Check now covers Assets including visuals.
- No new ADR; nothing decided contradicts ADR 0001 or 0002.

## Decisions (owner-confirmed)

1. Scope is AMOURIQ brand content only. Affiliate selling is out of scope (would be a separate system).
2. One Asset = one Asset Format; the same Short Video becomes up to 4 Posts (TikTok, FB Reels, IG Reels, YouTube Shorts).
3. v1 Asset Format: Short Video only (9:16, 10–30 s). Carousel / LINE / Newsletter later.
4. v1 Production Route: AI-Generated only. Filmed route is a known future route, not built in v1.
5. One Core Idea → one Short Video. Production starts automatically when a Core Idea is Approved.
6. Visuals depend on Product Linkage: DIRECT uses only the SKU's Approved Product Images (no images → do not generate, flag on Idea Board; never let the model invent packaging); SOFT = brand mood with product optional and non-prominent; NONE = no product.
7. No realistic human faces in AI-Generated Assets (hands, product, close-up texture without before/after implication, ambience only). Anything needing a real person goes to the Filmed route.
8. Audio: Thai AI voiceover + burned-in Thai subtitles + music from a licensed library.
9. AI Disclosure: burned-in "สร้างด้วย AI" on every AI-Generated Asset, plus platform AI labels where the API supports them.
10. Asset Production writes Post Drafts (caption + hashtags) for every channel; they pass Claim Check and the Asset Gate together with the Asset. Publishing never writes copy.
11. Claim Check runs on the whole Asset (speech, on-screen text, captions, visuals). HOLD cannot be approved at any Gate.
12. Asset Gate lives on the Idea Board. Actions: Approve / Revise (max 3 regenerations, then Reject or move to Filmed) / Reject (needs Rejection Reason). The Core Idea stays In Production even if its Asset is Rejected.
13. Generation Budget: monthly spend cap; on reaching it, stop generating and push a notification. Number to be set after the prototype measures cost per clip.
14. TikTok-in-app "post the draft" step belongs to Publishing and is not a Human Gate.

## Open feasibility questions (why the prototype)

- ADR 0002 says Asset Production reads Approved Core Ideas from the Idea Board's database, which lives in a Claude Artifact. Unknown whether code outside Claude can read/write it, or whether orchestration must run as a Claude scheduled task that calls repo code.
- Where repo code runs (needs the Gemini API key as a secret).
- Clip quality of Gemini Omni Flash (`gemini-omni-1.2-flash`) from real product photos; Thai TTS quality; cost per clip.
- How a finished video file is stored and previewed on a phone from the Idea Board.

## Next steps

1. Finish Ideation ticket 1 (Idea Board + scheduled task prototype; see `docs/handoff/2026-11-06-ideation.md`). The Asset Production prototype depends on it.
2. `/prototype` one end-to-end thin slice: scheduled task reads one Approved Core Idea → repo code generates one Short Video from Approved Product Images via Gemini Omni Flash → Thai voiceover, burned-in subtitles, AI Disclosure → result shown on the Idea Board. Record cost per clip.
3. `/to-spec` for Asset Production using the decisions above and the prototype's findings, then `/to-tickets`.
4. Grill Publishing after the prototype (research: TikTok = upload-to-draft only; FB/IG/YouTube via official APIs).
5. Owner action meanwhile: apply for Meta developer app, TikTok developer app, and a Google Cloud project (Gemini API + YouTube Data API).
