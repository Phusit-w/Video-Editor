# Feasibility: Asset Production (AI video) and Publishing (FB / IG / TikTok / YouTube Shorts) via official APIs

**Date researched:** 2026-11-08
**Status:** Research note, not a decision. No ADR has been changed.

## The question

Can AMOURIQ Content Automation build **Asset Production** (turn an Approved Core Idea into short vertical video Assets from real product photos) and **Publishing** (turn Assets into Posts on Facebook Pages, Instagram, TikTok and YouTube Shorts, on a schedule, labelled as AI-generated) on **official, documented APIs**, the way the reference app "N.SHOP Autopilot" appears to work? And where does an official route not exist, what is the blocker?

Method: primary sources only (vendor developer docs, API references, terms, changelogs, help centres). Where only a secondary source exists, the claim is marked **[UNVERIFIED – secondary only]**. Where a page showed no date, that is stated. Several vendor pages are JavaScript-rendered and could not be read by the fetch tool, and the Chrome extension was not connected, so those claims are marked as unverified rather than guessed.

> Important context change found during research: the Gemini API **shut down Veo 3.1 Preview on 2026-10-22** and points users to **Gemini Omni Flash** (`gemini-omni-1.2-flash`, GA 2026-11-05) or to Veo 3.1 GA on the **Gemini Enterprise Agent Platform** (the Google Cloud docs product that the Veo pages now live under). Any plan, tutorial or reference app built around "Veo via Gemini API" is out of date. ([Gemini API video page](https://aistudio.google.com/docs/video), [Gemini API changelog](https://aistudio.google.com/docs/changelog))

## Summary / verdict

| Platform / tool | Official API exists? | Key blocker | Effort / risk | Recommendation |
|---|---|---|---|---|
| **Google Flow** (flow.google.com, formerly labs.google/flow) | **No** (none found in Flow help centre or product page) | No API; automating the web UI is outside any documented interface and would rely on the Google Terms' general clauses | High risk | **Not viable** for automation. Use for manual exploration only. |
| **Gemini Omni Flash** (Gemini API, same model family Flow now uses) | **Yes** | Paid tier only (no free tier); rate limits not published; "certain recognizable people" images rejected | Low–medium | **Recommended** route for Asset Production. Prototype first. |
| **Veo 3.1 GA** (Gemini Enterprise Agent Platform, ex-Vertex AI) | **Yes** | Clips only 4/6/8 s; `us-central1` only; English prompts only; price not verified | Medium | Fallback / comparison in the prototype. |
| **TikTok Content Posting API** – Direct Post | **Yes** | Unaudited apps: `SELF_ONLY` posts, private accounts only, max 5 users/24 h. Audit guidelines explicitly reject "a utility tool to help upload contents to the account(s) you or your team manages" | **High** (audit likely to fail for an in-house tool) | **Not viable** for public auto-post unless audit passes. |
| **TikTok Content Posting API** – Upload to inbox/draft | **Yes** | Human must open TikTok and finish the post; max 5 pending shares / 24 h | Low | **Recommended**: fits a Human Gate before posting. |
| **TikTok Shop product anchor ("cart pinning")** | **Partial / unverified** | Partner Center docs not readable; only secondary sources describe a "Post shoppable video" operation; region (TH) not confirmed | High | **Needs prototype + owner's TikTok Shop Partner account** to verify. Otherwise pin products manually in app. |
| **Meta – Facebook Page Reels** | **Yes** | 30 API-published Reels / Page / 24 h; Page token with `CREATE_CONTENT` | Low | **Recommended (official API)**. Native scheduling + `is_ai_generated` supported. |
| **Meta – Instagram Reels** | **Yes** | Professional account required; 100 (or 50, docs conflict) API posts / 24 h; no native scheduling; no shopping tags | Low | **Recommended (official API)**. Scheduler must live in our code. |
| **YouTube Shorts** (Data API v3 `videos.insert`) | **Yes** | Uploads in own quota bucket (100/day per the quota page); none blocking for 1 channel | Low | **Recommended (official API)**. `containsSyntheticMedia` + `publishAt` supported. |
| **Shopee Affiliate Open API (TH)** | **Partial** (endpoint exists, docs behind login) | Docs/limits only visible inside affiliate dashboard; may be irrelevant if AMOURIQ sells own products | Medium | Owner decides if affiliate is in scope; then read docs in dashboard. |
| **Thai FDA (อย.) advertising rules** | n/a | Not researched in depth | — | Keep Claim Check as the control; get proper legal read separately. |

---

## 1. Google Flow / Veo / Gemini Omni

### 1.1 Does Google Flow have a public API?

- No API is documented. The Flow help centre lists articles on getting started, creating/editing videos, credits, the Flow Agent, data management, models and availability, with no API or developer-access article. ([Google Flow Help](https://support.google.com/flow/), page undated)
- The product site (`labs.google/fx/tools/flow` now 308-redirects to `flow.google.com`) shows only a sign-in link, no developer or API link. ([flow.google.com](https://flow.google.com/))
- A web search for official Flow programmatic access found nothing on Google domains. Absence of evidence, not proof; but there is no documented interface to build on.

**Conclusion:** there is no official way to drive Flow from code. N.SHOP Autopilot's "sends images to Google Flow" therefore either (a) automates the Flow web UI, or (b) actually calls the Gemini API / Agent Platform and uses "Flow" loosely. **[UNVERIFIED – we have no source on how N.SHOP Autopilot works.]**

### 1.2 What models Flow uses now

- Flow currently offers **Omni Flash 1.2** (3–15 s for text, frames, ingredients and video-to-video) and **Veo 3.1 Lite** (4, 6 or 8 s, 720p); Veo 3.1 Fast, Veo 3.1 Quality and Omni Flash 1.1 "will be retired on December 5, 2026". ([Flow: models & supported features](https://support.google.com/flow/answer/16352836?hl=en), undated)
- So the official programmatic route to "the same models as Flow" is the **Gemini API (Omni Flash)** and/or **Agent Platform (Veo 3.1)**.

### 1.3 Gemini API: Gemini Omni Flash (recommended route)

Source for this subsection unless noted: [Gemini Omni Flash docs](https://aistudio.google.com/docs/omni) (no date on page; content consistent with the 2026-11-05 changelog entry).

| Item | Finding |
|---|---|
| Model ID | `gemini-omni-1.2-flash` (GA). `gemini-omni-1.1-flash` routes to 1.2 from 2026-12-03 ([changelog](https://aistudio.google.com/docs/changelog)). |
| Image input (product photo) | Supported: reference image(s) + prompt (`image_to_video` task); "the model will decide how to use the image" for a single image. Up to **6 reference images** (max 3 per character, 2 characters). Explicit **first-and-last-frame interpolation** with two images (3–10 s only). |
| Duration | Any whole second **3–15 s**, default 10 s. Extensions per turn 3–10 s, extended videos capped at **30 s total**. |
| Aspect ratio | **9:16 supported**; 16:9 is default. |
| Resolution | 360p, 720p (default), 1080p and 4k (1080p/4k are upscaled). |
| Audio | Native audio generated with the video; audio input/reference not supported. |
| Watermark | "All generated videos include SynthID watermarking", invisible but programmatically detectable. |
| People | "Uploading and editing images containing certain recognizable people is not supported." Images with minors not supported in EEA/CH/UK. Safety filters apply to input and output and vary by region. |
| Output retention | Not stated. Large outputs (>4 MB) are delivered as a file URI to poll then download. |
| Rate limits | Not stated on the Omni page; the [rate-limits page](https://aistudio.google.com/docs/rate-limits) lists none for Omni either, and directs users to check limits in AI Studio. Tiers: Tier 1 = linked billing account; Tier 2 = $100 spent + 3 days; Tier 3 = $1,000 + 30 days. |
| Pricing | **No free tier.** Billed on output tokens, 5,792 tokens per second of 720p video, which the page states as about **$0.07/s at 720p (~$0.70 per 10 s, ~$1.04 per 15 s)**; ~$0.023/s at 360p; ~$0.104/s at 1080p; ~$0.209/s at 4K. Audio not priced separately. ([Gemini API pricing](https://aistudio.google.com/docs/pricing), undated) |
| Thailand | Thailand is listed as an available country for the Gemini API and AI Studio. ([Available regions](https://aistudio.google.com/docs/available-regions), undated) |

Terms that matter ([Gemini API Additional Terms](https://aistudio.google.com/docs/terms), effective 2026-03-23):
- Users must be 18+; services are for professional/business use.
- **Unpaid services** may be used to improve Google products and reviewed by humans, so "do not submit sensitive, confidential, or personal information". Paid use (Cloud project with active billing) does not use prompts/responses for product improvement. Since Omni has no free tier this mostly resolves itself, but unreleased product photos should only ever go through a billed project.
- Not for clinical practice or medical advice. Do not bypass safety features.
- Google does not claim ownership of generated content; the user is responsible for its use.

### 1.4 Veo 3.1 GA on Gemini Enterprise Agent Platform (fallback)

Source: [Veo 3.1 on Gemini Enterprise Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/veo/3-1-generate) (no update date on page).

- `veo-3.1-generate-001` and `veo-3.1-fast-generate-001` are **GA** (released 2025-11-17, retirement "May 4, 2027 or later"); `veo-3.1-lite-generate-001` is Preview.
- Text-to-video, **image-to-video**, first+last frame; reference images on standard and Fast (not Lite). Image input max 20 MB.
- Durations **4, 6 or 8 s** only; extension supported. **9:16 and 16:9**. 720p/1080p (4K on standard). Audio generation supported. Up to 4 outputs per prompt, 24 fps, MP4.
- Provenance: page lists Content Credentials (C2PA); SynthID is not mentioned on that page.
- Quota shown: 50 regional online prediction requests per minute per base model. Region: **`us-central1` only**. **English prompts only**.
- Pricing: **[NOT VERIFIED]** – the Agent Platform pricing page could not be read by the fetch tool.
- Gemini API no longer serves Veo: Veo 2.0/3.0 shut down 2026-06-30 and Veo 3.1 Preview on 2026-10-22. ([changelog](https://aistudio.google.com/docs/changelog), [video page](https://aistudio.google.com/docs/video))

### 1.5 Flow watermarks and Thailand availability

- Flow: all Veo/Omni/Nano Banana outputs carry invisible SynthID. A **visible watermark** can be toggled; it is forced on for users in India, South Korea and Vietnam not on the top Ultra plan. ([Get started with Google Flow](https://support.google.com/flow/answer/16353333?hl=en), undated)
- Thailand is a supported Flow country. ([Where you can use Google Flow](https://support.google.com/flow/answer/16353544))

### 1.6 Usage policy for advertising real products / people

- [Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy) (last updated 2024-12-17), which Flow says applies alongside the Google Terms ([Flow get started](https://support.google.com/flow/answer/16353333?hl=en)): bans fraud and deceptive actions; impersonating a person without explicit disclosure in order to deceive; misrepresenting AI content as solely human-made in order to deceive; misleading claims of expertise in sensitive areas such as health; circumventing safety filters; spam and disrupting Google's services.
- Relevance: advertising a real AMOURIQ product with AI video is not prohibited in itself. The risks are **deceptive efficacy claims** (e.g. AI "before/after" skin results) and **realistic AI people presented as real customers/testimonials** – both fall on the deceptive side. This is exactly what Claim Check should catch.

### 1.7 Do Google's terms prohibit automating the Flow web UI?

- The [Google Terms of Service](https://policies.google.com/terms?hl=en-US) (effective 2026-07-30) prohibit "using automated means to access content from any of our services in violation of the machine-readable instructions" on Google pages, and abusing, interfering with or disrupting services. Flow is governed by these terms ([Flow get started](https://support.google.com/flow/answer/16353333?hl=en)).
- Flow help also says Google "may rate-limit the number of generations" and mentions an "unusual activity" message (VPN/proxy). ([same page](https://support.google.com/flow/answer/16353333?hl=en))
- **Assessment (not a legal opinion):** the terms do not contain a sentence saying "do not script Flow", so a flat "prohibited" cannot be cited. But there is no documented interface, the clause on automated access and on disrupting services gives Google grounds to block or suspend, and the account at risk would be the owner's Google account. Treat UI automation as **not viable for a production system**.

---

## 2. TikTok

### 2.1 Content Posting API: Direct Post vs Upload (draft)

| | Direct Post | Upload (inbox / draft) |
|---|---|---|
| Endpoint / scope | `/v2/post/publish/video/init/`, scope `video.publish` ([Get started – Direct Post](https://developers.tiktok.com/doc/content-posting-api-get-started), updated 2026-08-04) | `/v2/post/publish/inbox/video/init/`, scope `video.upload` ([Upload reference](https://developers.tiktok.com/doc/content-posting-api-reference-upload-video), updated 2026-08-04) |
| Who presses "post" | The app | The user, after tapping the TikTok inbox notification and finishing the edit in TikTok |
| Audit | Required to post anything non-private | The Upload page does not mention an audit. Whether scope approval for `video.upload` needs app review is **[NOT VERIFIED]** |
| Caps | Rate limit 6 requests/min per user token ([Direct Post reference](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)); ~15 posts/day/creator shared across all Direct Post clients ([Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines), updated 2026-08-04) | 6 requests/min per user token; **max 5 pending shares per 24 h** (403 `spam_risk_too_many_pending_share`) |

### 2.2 What unaudited apps are restricted to

From the [Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines) (updated 2026-08-04) and [Get started](https://developers.tiktok.com/doc/content-posting-api-get-started):
- "All content posted by unaudited clients will be restricted to private viewing mode" – `SELF_ONLY` only.
- Up to **5 users** may post in a 24-hour window, and posting accounts **must be private** at posting time.
- To go public later you must make the account public and change each post to "Everyone" by hand.

### 2.3 Why an audit is a real blocker for AMOURIQ

The same guidelines require apps to target a wide audience and list as **not acceptable** "a utility tool to help upload contents to the account(s) you or your team manages". They also require: creator info shown at post time, a privacy dropdown with **no default**, interaction toggles off by default, explicit user consent before upload, a preview, and no added brand logos/watermarks to the content. ([Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines))

An in-house AMOURIQ auto-poster is, by definition, the excluded case. Direct Post with public visibility is therefore **unlikely to be obtainable**. The Upload (draft) flow does not have this problem and naturally puts a person at the last step.

### 2.4 Video specs

[Media Transfer Guide](https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide) (updated 2026-08-04): MP4 (recommended)/WebM/MOV; H.264 (recommended)/H.265/VP8/VP9; 23–60 fps; 360–4096 px each side; max 4 GB; up to 10 min via API (creator-specific `max_video_post_duration_sec` applies). `PULL_FROM_URL` requires HTTPS, no redirects, and a **verified domain or URL prefix** in the developer portal; otherwise use chunked `FILE_UPLOAD` (5–64 MB chunks).

### 2.5 AI-generated label and commercial disclosure via API

- Direct Post `post_info.is_aigc` (bool): "Set to true if the video is AI-generated", which applies TikTok's AI-generated label. Also `brand_organic_toggle` (promoting own business) and `brand_content_toggle` (paid partnership). ([Direct Post reference](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post))
- For the **Upload/draft** flow, these fields are set by the user in the TikTok app when finishing the post (the Upload reference does not list `post_info` fields). **[Inference from the reference page; not stated explicitly.]**
- No scheduling field exists in the Direct Post reference.

### 2.6 TikTok Shop product anchors ("cart pinning")

- TikTok Shop is available in Thailand. ([TikTok Ads Help: About TikTok Commerce](https://ads.tiktok.com/help/article?aid=10005129), updated July 2025)
- TikTok announced general release of **TikTok Shop Affiliate APIs** (affiliate campaigns, creator/product search, generating affiliate product promotion links, affiliate orders). The post does not mention posting shoppable videos or anchors, and lists no markets. ([TikTok for Developers blog](https://developers.tiktok.com/blog/2024-tiktok-shop-affiliate-apis-launch-developer-opportunity), undated)
- The Content Posting API reference has **no product link/anchor field**. ([Direct Post reference](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post))
- The TikTok Shop Partner Center docs ([affiliate integration guide](https://partner.tiktokshop.com/docv2/page/affiliate-integration)) are JavaScript-rendered and could not be read. Third-party integrators describe "Upload shoppable video file", "Precheck video content" and "Post shoppable video" operations and "Check Anchor" endpoints. **[UNVERIFIED – secondary only: e.g. Celigo connector docs, Postly.]** Whether these are open to a brand's own seller app, and whether they are enabled for **TH**, is **not verified**.
- **Conclusion:** cart pinning via API may exist under TikTok Shop Partner Center, not under the Content Posting API. Needs the owner's TikTok Shop seller account and a Partner Center developer login to verify.

### 2.7 TikTok terms on automated posting

[TikTok Terms of Service (ROW)](https://www.tiktok.com/legal/page/row/terms-of-service/en) (last updated 2025-12-01), section 5: users may not "use automated scripts to collect information from or otherwise interact with the Services", nor "bypass any measures we may use to prevent or restrict access". Browser-scripted posting to TikTok falls under "otherwise interact with the Services" – **not acceptable**.

---

## 3. Meta (Facebook Page + Instagram)

### 3.1 Facebook Page Reels

Source: [Reels Publishing API](https://developers.facebook.com/docs/video-api/guides/reels-publishing) (no date on page).
- Flow: `POST /{page-id}/video_reels` `upload_phase=start` → upload to `rupload.facebook.com` (local file or `file_url`) → `upload_phase=finish` with `video_state` = DRAFT / SCHEDULED / PUBLISHED.
- Permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`; Page token from a user who can do `CREATE_CONTENT`.
- Specs: MP4, **9:16**, 1080×1920 recommended (min 540×960), 24–60 fps, **3–90 s**, H.264/H.265 (VP9, AV1), AAC 48 kHz stereo.
- Limit: **30 API-published Reels per Page per rolling 24 h**.
- **Scheduling: yes**, `scheduled_publish_time` 10 min to 29 days ahead.
- **AI label: yes**, `is_ai_generated=true`.
- First comment with a link: `POST /{object-id}/comments` with `pages_manage_engagement` and a Page token from someone with the `MODERATE` task. ([Object comments reference](https://developers.facebook.com/docs/graph-api/reference/object/comments))

### 3.2 Instagram Reels

Sources: [Content Publishing guide](https://developers.facebook.com/docs/instagram-platform/content-publishing), [IG User media reference](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media) (no dates on pages).
- **Account type:** Instagram **professional** account only. If linked to a Page that requires Page Publishing Authorization, that must be completed first.
- Permissions: Instagram Login → `instagram_business_basic`, `instagram_business_content_publish`; Facebook Login → `instagram_basic`, `instagram_content_publish`, `pages_read_engagement` (+ `ads_management`/`ads_read` if the user has a Business Manager role on the Page).
- Flow: create container `media_type=REELS` with public `video_url` or resumable upload → publish. Containers expire after 24 h; 400 containers per 24 h.
- Limit: "100 API-published posts within a 24-hour moving period" – but the carousel section of the same guide says 50. Check live usage with `GET /{ig-id}/content_publishing_limit`. **Docs are internally inconsistent; plan for 50.**
- Specs: MOV/MP4, H.264/HEVC, AAC ≤48 kHz, 23–60 fps, max width 1920, 9:16 recommended, **3 s – 15 min**, ≤300 MB, ≤25 Mbps.
- **Scheduling: not supported** natively – the guide only tells apps that offer scheduling to enforce the rate limit themselves. Our code must hold the schedule.
- **AI label: yes**, `is_ai_generated` (optional self-disclosure; not for carousel children).
- Shopping tags and filters are **not supported** via API. Paid-partnership labels available only with Facebook Login.
- First comment: `POST /{ig-media-id}/comments` with `message`; needs `instagram_manage_comments` (or `instagram_business_manage_comments`). ([IG Media comments reference](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-media/comments)). Note that links in Instagram comments are generally not clickable **[UNVERIFIED – no primary source checked]**.

### 3.3 App Review / Business Verification

[Access levels](https://developers.facebook.com/docs/graph-api/overview/access-levels):
- **Standard Access** is granted automatically and works for people who **have a role on the app**. If only role-holders use the app, Standard Access is all that is needed.
- **Advanced Access** (for other people's accounts) needs App Review per permission and **Business Verification** (since 2023-02-01).
- For AMOURIQ publishing only to its **own** Page and IG account, with the owner/admin added as an app role, **App Review should not be required**. This is the key reason Meta is the easiest platform.

### 3.4 Meta terms on automated access

[Facebook Terms](https://www.facebook.com/legal/terms) (effective 2025-01-01; Meta states an update is planned for 2027-01-20), §3.2.3: you may not access or collect data from Meta Products using automated means without prior permission. Using the Graph API is that permission; browser automation is not.

---

## 4. YouTube Shorts (Data API v3)

- **What counts as a Short:** square or vertical video up to **3 minutes**. ([YouTube Help: three-minute Shorts](https://support.google.com/youtube/answer/15424877)). There is no "Short" flag in the API; a 9:16 clip ≤3 min uploaded via `videos.insert` becomes a Short.
- **Quota:** since 2026-06-01 `videos.insert` and `search.list` are charged to **their own quota buckets** ([revision history](https://developers.google.com/youtube/v3/revision_history)). The [quota cost page](https://developers.google.com/youtube/v3/determine_quota_cost) says videos.insert has "100 quota per day. Each call costs 1 quota", i.e. ~**100 uploads/day** per project by default; the [videos.insert page](https://developers.google.com/youtube/v3/docs/videos/insert) agrees (1 unit, "100 calls per day"). Other endpoints share 10,000 units/day. (Older docs said ~1,600 then ~100 units per upload from the shared 10,000 – revision history 2025-12-04 – so tutorials are outdated.) `commentThreads.insert` costs 50 units.
- **Unverified projects:** as of **2026-11-02**, uploads from unverified API projects "are no longer restricted to private viewing mode" – reversing the 2020 rule. ([revision history](https://developers.google.com/youtube/v3/revision_history), [videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert)). The OAuth consent screen may still need Google verification for sensitive scopes if used by non-test users **[NOT VERIFIED here]**.
- **Synthetic content disclosure:** `status.containsSyntheticMedia` (bool) – "allows the channel owner to disclose that a video contains realistic Altered or Synthetic (A/S) content", settable on insert/update since 2024-10-30. ([videos resource](https://developers.google.com/youtube/v3/docs/videos), [revision history](https://developers.google.com/youtube/v3/revision_history)). YouTube requires disclosure for realistic AI content, e.g. a realistic scene that did not happen or a real person made to appear to do something; YouTube may also auto-label content carrying C2PA metadata; persistent non-disclosure can lead to penalties. ([YouTube Help: disclosing altered or synthetic content](https://support.google.com/youtube/answer/14328491))
- **Scheduling:** `status.publishAt`, which can only be set when `privacyStatus` is `private` and the video has never been published. ([videos resource](https://developers.google.com/youtube/v3/docs/videos))
- **Custom thumbnails for Shorts** via `thumbnails.set` since 2026-11-03. ([revision history](https://developers.google.com/youtube/v3/revision_history))
- **Terms:** YouTube Terms forbid accessing the Service by automated means (robots, botnets, scrapers) except public search engines or with prior written permission. ([YouTube Terms](https://www.youtube.com/static?template=terms), effective 2022-01-05)

---

## 5. Shopee Affiliate (Thailand)

- The Thai affiliate site exists at `affiliate.shopee.co.th`, but the page served to the fetch tool contained only a title; the Open API documentation appears to be inside the logged-in affiliate dashboard. ([Shopee Affiliate TH](https://affiliate.shopee.co.th/open_api))
- The GraphQL endpoint `https://open-api.affiliate.shopee.co.th/graphql` **exists**: an unauthenticated request returns `error [10020]: Invalid Authorization Header` (observed 2026-11-08). That proves an authenticated API is live for TH, not what it offers.
- Query names (`productOfferV2`, `shopOfferV2`, `generateShortLink`, conversion reports), AppId + secret with SHA256 signature, page limits and rate-limit error codes are described only by third-party SDKs, mostly for Brazil. **[UNVERIFIED – secondary only.]** Whether `productOfferV2` returns product image URLs usable as video input is unverified; and **using another seller's product photos to generate ads raises an IP/permission question** separate from API access.
- Shopee Open Platform for sellers (`open.shopee.com`) could not be fetched. **[NOT RESEARCHED]** This is the relevant API if AMOURIQ sells its own products on Shopee.

---

## 6. Thai regulatory note (brief)

**Mostly not researched.** One primary document was located: a Thai FDA (อย.) citizen's manual PDF on requesting an opinion on cosmetic advertising, which references the Cosmetic Act B.E. 2558 (พ.ร.บ.เครื่องสำอาง พ.ศ. 2558) ([Thai FDA PDF](https://cms-media.fda.moph.go.th/461117737616416768/2023/03/5BE7vSiP09ihs53mk4vmOYez.pdf)); its text could not be extracted here. Secondary sources mention a 2024 ministerial regulation (กฎกระทรวง) listing prohibited advertising statements **[UNVERIFIED – secondary only: ChemLinked, InfoQuest]**. No official Thai source on mandatory disclosure of AI-generated advertising was found. Recommendation: a Thai regulatory read by someone with legal access, feeding the Claim Guardrail.

---

## Implications for the AMOURIQ plan

1. **ADR 0001 holds.** Every viable route found is an authenticated HTTP API (Gemini API, Meta Graph, TikTok Content Posting, YouTube Data API). These are exactly the "steps that must talk to external APIs" that ADR 0001 reserves for custom code. Nothing here pushes Ideation or writing steps into code.
2. **Browser automation (the possible N.SHOP approach) conflicts with ADR 0001's spirit and with all four platforms' terms** (Google automated-access clause, TikTok "automated scripts … interact with the Services", Meta "automated means without prior permission", YouTube "automated means"). It is not an API call; it would be a fragile scraper using the owner's personal accounts. **Recommend not adopting it.** If the owner still wants it, that is a new decision and should be recorded as its own ADR, not slipped in.
3. **Asset Production** = code calling `gemini-omni-1.2-flash` with the SKU's official product photos as reference images, 9:16, 10–15 s, audio on. Cost is roughly $0.70–1.04 per 720p clip (list price). Each generated video carries SynthID, so the "AI-generated" label on every Post is not optional in practice – platforms (YouTube via C2PA, possibly others) may detect it anyway.
4. **Claim Check must run on the Asset, not just the Core Idea.** The video model invents visuals and speech; it can produce implied efficacy (skin transformation, "results") or a realistic person looking like a customer. These are the deceptive-use cases in Google's policy and the core of Thai cosmetic-ad risk. The glossary already defines Claim Check over "Core Idea/Asset" – this research confirms the Asset-level check is necessary.
5. **A second Human Gate before Publishing is effectively forced by TikTok.** The glossary defines the Human Gate only at Core Idea approval. TikTok's realistic route (Upload to draft) requires a person to finish each post in the app; TikTok's audit rules effectively rule out a fully automatic in-house poster. Proposal for the owner (not decided here): add an **Asset approval** gate on the Idea Board, after which Meta/YouTube Posts publish automatically and TikTok Posts land as drafts. This **extends** the glossary's Human Gate definition and should be recorded in GLOSSARY.md / a new ADR if accepted.
6. **Post scheduling lives in our code** for Instagram (no native scheduling) and TikTok (none), and can use native scheduling on Facebook (`scheduled_publish_time`) and YouTube (`publishAt`). A Post therefore has a state before it is live (scheduled / draft-in-TikTok) – the glossary currently defines Post only as "published". Consider whether a Post-level status is needed.
7. **"Up to 3 accounts"**: Meta Standard Access only covers accounts whose users have a role on the app; fine for AMOURIQ's own accounts, not for third parties.
8. **TikTok cart pinning** should not be assumed. Until verified, product linking on TikTok is a manual step done by the person finishing the draft.
9. **ADR 0002 (Idea Board is source of truth)** is unaffected; Asset Production would read Approved Core Ideas from the Idea Board DB as planned. If an Asset approval gate is added, its state would naturally live on the Idea Board as well.

## Open questions for the owner

1. **Accounts to create / apply for** (owner must do these, not the agent):
   - Google Cloud project with **billing enabled** (Gemini API paid tier; optionally Agent Platform for Veo 3.1).
   - **Meta developer app** (Business type), with the owner's Facebook user as admin; Facebook Page + Instagram **professional** account linked; check whether the Page needs Page Publishing Authorization.
   - **TikTok for Developers** app with Content Posting API (`video.upload` at minimum); decide whether to attempt an audit for `video.publish`.
   - **Google Cloud OAuth client** for YouTube Data API on the brand channel.
   - Optional: **TikTok Shop seller + Partner Center** developer access to verify shoppable-video/anchor APIs for TH.
   - Optional: Shopee affiliate (TH) Open API credentials, or Shopee Open Platform seller access.
2. Does AMOURIQ act as a **seller of its own products** or as an **affiliate**? This decides whether Shopee Affiliate API matters at all.
3. Will the brand accept **realistic AI people** in videos? If yes, how is that disclosed beyond the platform AI label, and how does it pass Claim Check?
4. Accept a **second Human Gate (Asset approval)** before publishing? And accept that TikTok posts are finished by a person in the TikTok app?
5. Which channels in v1? Suggest Meta + YouTube first (fully automatable), TikTok as drafts.
6. Budget per month for video generation (at ~$0.70–1.04 per 720p clip list price).
7. Who does the Thai FDA advertising-rules read for the Claim Guardrail?

## Sources

Google / Gemini / Flow
- Gemini API – Video generation (Veo shutdown notice): https://aistudio.google.com/docs/video
- Gemini API – Gemini Omni Flash: https://aistudio.google.com/docs/omni
- Gemini API – Changelog: https://aistudio.google.com/docs/changelog
- Gemini API – Pricing: https://aistudio.google.com/docs/pricing
- Gemini API – Rate limits: https://aistudio.google.com/docs/rate-limits
- Gemini API – Available regions: https://aistudio.google.com/docs/available-regions
- Gemini API Additional Terms of Service (effective 2026-03-23): https://aistudio.google.com/docs/terms
- Veo 3.1 on Gemini Enterprise Agent Platform: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/veo/3-1-generate
- Google Flow Help Center: https://support.google.com/flow/
- Google Flow – Models & supported features: https://support.google.com/flow/answer/16352836?hl=en
- Google Flow – Get started: https://support.google.com/flow/answer/16353333?hl=en
- Google Flow – Where you can use Flow: https://support.google.com/flow/answer/16353544
- Google Flow product site: https://flow.google.com/
- Google Terms of Service (effective 2026-07-30): https://policies.google.com/terms?hl=en-US
- Generative AI Prohibited Use Policy (updated 2024-12-17): https://policies.google.com/terms/generative-ai/use-policy

TikTok
- Content Posting API – Get started (Direct Post): https://developers.tiktok.com/doc/content-posting-api-get-started
- Content Posting API – Direct Post reference: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
- Content Posting API – Upload reference: https://developers.tiktok.com/doc/content-posting-api-reference-upload-video
- Content Posting API – Media Transfer Guide: https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide
- Content Sharing Guidelines: https://developers.tiktok.com/doc/content-sharing-guidelines
- TikTok Shop Affiliate APIs blog: https://developers.tiktok.com/blog/2024-tiktok-shop-affiliate-apis-launch-developer-opportunity
- TikTok Shop Partner Center – Affiliate integration (not readable by tool): https://partner.tiktokshop.com/docv2/page/affiliate-integration
- TikTok Ads Help – About TikTok Commerce: https://ads.tiktok.com/help/article?aid=10005129
- TikTok Terms of Service (ROW, updated 2025-12-01): https://www.tiktok.com/legal/page/row/terms-of-service/en
- Secondary only (unverified): Celigo TikTok Shop connector https://docs.celigo.com/hc/en-us/articles/18704697472667 ; Postly https://postly.ai/tiktok-shop

Meta
- Facebook Reels Publishing API: https://developers.facebook.com/docs/video-api/guides/reels-publishing
- Instagram Content Publishing: https://developers.facebook.com/docs/instagram-platform/content-publishing
- IG User media reference: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media
- IG Media comments reference: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-media/comments
- Instagram comment moderation: https://developers.facebook.com/docs/instagram-platform/comment-moderation
- Page feed reference: https://developers.facebook.com/docs/graph-api/reference/page/feed
- Object comments reference: https://developers.facebook.com/docs/graph-api/reference/object/comments
- Access levels: https://developers.facebook.com/docs/graph-api/overview/access-levels
- Facebook Terms (effective 2025-01-01): https://www.facebook.com/legal/terms

YouTube
- videos.insert: https://developers.google.com/youtube/v3/docs/videos/insert
- videos resource: https://developers.google.com/youtube/v3/docs/videos
- Quota costs: https://developers.google.com/youtube/v3/determine_quota_cost
- Revision history: https://developers.google.com/youtube/v3/revision_history
- Three-minute Shorts: https://support.google.com/youtube/answer/15424877
- Disclosing altered or synthetic content: https://support.google.com/youtube/answer/14328491
- YouTube Terms of Service: https://www.youtube.com/static?template=terms

Shopee
- Shopee Affiliate TH: https://affiliate.shopee.co.th/open_api
- Shopee Affiliate TH GraphQL endpoint (unauthenticated probe): https://open-api.affiliate.shopee.co.th/graphql

Thai FDA
- Thai FDA citizen's manual PDF (cosmetic advertising opinion; text not extracted): https://cms-media.fda.moph.go.th/461117737616416768/2023/03/5BE7vSiP09ihs53mk4vmOYez.pdf
