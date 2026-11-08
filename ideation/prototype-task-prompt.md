You are running a one-time prototype check for the AMOURIQ Idea Board (ticket 1 under the Ideation spec, which is GitHub Phusit-w/Video-Editor issue #1).

Goal: prove that a Claude scheduled task can write a Core Idea into the Idea Board's shared database. Do nothing else — no research, no other files, no messages to anyone.

Steps:
1. Load the `ArtifactData` tool (via ToolSearch with query "select:ArtifactData" if it is deferred).
2. Write exactly one document with ArtifactData:
   - action: "set"
   - url: https://claude.ai/artifact/5dV7v7iXxFq8oc3r82ayBS
   - collection: "coreIdeas"
   - doc_id: "proto-test-001"
   - data:
     {
       "batchId": "proto-2026-11-08",
       "createdAt": "<the current UTC time as ISO 8601, e.g. 2026-11-08T09:54:00Z>",
       "createdBy": "scheduled-task",
       "status": "Proposed",
       "primaryPillar": "Understand Your Skin & Hair",
       "topicTerritory": "Skin Health",
       "contentJob": "Explain",
       "funnelStage": "Awareness",
       "productLinkage": "NONE",
       "readerProblem": "TEST — ข้อมูลทดสอบจากงานตั้งเวลา ไม่ใช่ไอเดียจริง",
       "hook": "[ทดสอบ] Core Idea นี้เขียนโดยงานตั้งเวลา",
       "keyMessage": "ถ้าเห็นการ์ดนี้บน Idea Board แปลว่างานตั้งเวลาเขียนลงฐานข้อมูลได้จริง (ADR 0002 ใช้ได้)",
       "evidenceSources": [],
       "caveats": "ข้อมูลทดสอบ ลบได้",
       "claimStatus": "ผ่าน",
       "suggestedFormat": "Short Video",
       "targetChannels": []
     }
   If a document with that id already exists, the write will be refused for lack of if_version; in that case read it with action "get" and report that it already exists — do not overwrite.
3. Read it back with action "get" (same url, collection, doc_id) to confirm.
4. Finish with one line: "PROTOTYPE OK — wrote coreIdeas/proto-test-001" or "PROTOTYPE FAILED — <exact reason, including any tool error text and whether ArtifactData was available at all>".
