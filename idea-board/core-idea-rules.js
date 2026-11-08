// Core Idea Rules — the single owner of the Core Idea record shape and its status rules
// (spec issue #1, "Core Idea Rules module"). Every writer and reader goes through it:
// the Ideation scheduled task before writing, the Idea Board before applying an Idea Gate
// action, and Asset Production before setting In Production.
//
// Plain ES module with no dependencies: the Idea Board imports it as a published file next
// to index.html, and `npm test` runs its tests under Node.

export const PRIMARY_PILLARS = [
  "Understand Your Skin & Hair",
  "Choose With Confidence",
  "Care That Fits Real Life",
  "Proof Before Promises",
];
export const PRODUCT_LINKAGES = ["NONE", "SOFT", "DIRECT"];
export const FUNNEL_STAGES = ["Awareness", "Consideration", "Conversion", "Retention"];
export const CLAIM_STATUSES = ["ผ่าน", "ต้องระวัง", "HOLD"];
export const STATUSES = ["Proposed", "Revise", "Rejected", "Approved", "In Production"];

// The three SKUs of AMOURIQ_PRODUCT_REFERENCE_MASTER.md §2 Product Registry, exact names.
// Other shop products have no Product Profile, so a DIRECT Core Idea cannot name them.
export const SKUS = [
  "AMOURIQ Organic Olive Castile Soap Lavender",   // Thai FDA 10-1-6800022354
  "AMOURIQ Organic Virgin Castor Nourishing Oil",  // Thai FDA 10-1-6900029015
  "AMOURIQ Organic Virgin Rosehip Nourishing Oil", // Thai FDA 10-1-6900030285
];

// A Topic Territory about science, skin, hair or regulation needs at least one evidence source.
// Matched by keyword, not exact name, so "Skin health" or "Regulation" cannot slip past
// (glossary examples: Skin Health, Hair & Scalp, Cosmetic Literacy, Claims/Regulation).
const EVIDENCE_TERRITORY = /skin|hair|scalp|cosmetic|ingredient|scien|claim|regulat|ผิว|ผม|หนังศีรษะ|เครื่องสำอาง|ส่วนผสม|วิทยาศาสตร์|กฎหมาย|ข้อกำหนด|อย\./i;
export const needsEvidence = (topicTerritory) => isText(topicTerritory) && EVIDENCE_TERRITORY.test(topicTerritory);

const REQUIRED_TEXT = [
  ["id", "id"],
  ["batchId", "Idea Batch"],
  ["createdAt", "วันที่สร้าง"],
  ["topicTerritory", "Topic Territory"],
  ["contentJob", "Content Job"],
  ["readerProblem", "ปัญหาของผู้อ่าน"],
  ["hook", "Hook"],
  ["keyMessage", "สารหลัก"],
  ["caveats", "ข้อจำกัดของหลักฐาน (caveats)"],
  ["suggestedFormat", "Format ที่แนะนำ"],
];

const isText = (v) => typeof v === "string" && v.trim() !== "";
const isHttpUrl = (v) => isText(v) && /^https?:\/\/\S+$/i.test(v.trim());

/**
 * Check a Core Idea record (the database document with its id as `id`).
 * @returns {{ok: boolean, errors: {field: string, message: string}[]}}
 */
export function validateCoreIdea(record) {
  if (record === null || typeof record !== "object" || Array.isArray(record)) {
    return { ok: false, errors: [{ field: "record", message: "Core Idea ต้องเป็น object" }] };
  }
  const errors = [];
  const fail = (field, message) => errors.push({ field, message });

  for (const [field, label] of REQUIRED_TEXT) {
    if (!isText(record[field])) fail(field, `ไม่มี ${label}`);
  }

  const oneOf = (field, label, allowed) => {
    const v = record[field];
    if (v === undefined || v === null || v === "") fail(field, `ไม่มี ${label}`);
    else if (!allowed.includes(v)) fail(field, `${label} "${Array.isArray(v) ? v.join(", ") : v}" ไม่อยู่ในค่าที่อนุญาต: ${allowed.join(" / ")}`);
  };
  oneOf("status", "สถานะ", STATUSES);
  if (Array.isArray(record.primaryPillar)) fail("primaryPillar", "Primary Pillar ต้องมีเพียงหนึ่งเดียว");
  else oneOf("primaryPillar", "Primary Pillar", PRIMARY_PILLARS);
  oneOf("productLinkage", "Product Linkage", PRODUCT_LINKAGES);
  oneOf("funnelStage", "Funnel Stage", FUNNEL_STAGES);
  oneOf("claimStatus", "Claim Status", CLAIM_STATUSES);

  // SKU is set only when Product Linkage is DIRECT (handoff 2026-11-06 decision).
  if (record.productLinkage === "DIRECT" && !isText(record.sku)) {
    fail("sku", "Product Linkage เป็น DIRECT ต้องระบุ SKU");
  } else if (record.productLinkage === "DIRECT" && !SKUS.includes(record.sku)) {
    fail("sku", `SKU "${record.sku}" ไม่อยู่ใน Product Reference Master — ใช้ได้เฉพาะ: ${SKUS.join(" / ")}`);
  } else if (PRODUCT_LINKAGES.includes(record.productLinkage) && record.productLinkage !== "DIRECT"
    && record.sku !== undefined && record.sku !== null && record.sku !== "") {
    fail("sku", "ระบุ SKU ได้เฉพาะเมื่อ Product Linkage เป็น DIRECT");
  }

  const sources = record.evidenceSources;
  if (!Array.isArray(sources)) {
    fail("evidenceSources", "ไม่มีรายการแหล่งหลักฐาน (ใส่ [] ถ้าไม่มี)");
  } else if (sources.some((s) => !s || !isText(s.title) || !isHttpUrl(s.url))) {
    fail("evidenceSources", "แหล่งหลักฐานทุกรายการต้องมีชื่อและลิงก์ http(s)");
  } else if (sources.length === 0 && needsEvidence(record.topicTerritory)) {
    fail("evidenceSources", `Topic Territory "${record.topicTerritory}" ต้องมีแหล่งหลักฐานอย่างน้อยหนึ่งแหล่ง`);
  }

  if ((record.claimStatus === "ต้องระวัง" || record.claimStatus === "HOLD") && !isText(record.claimReason)) {
    fail("claimReason", `Claim Status ${record.claimStatus} ต้องระบุเหตุผล`);
  }

  if (!Array.isArray(record.targetChannels) || record.targetChannels.length === 0 || !record.targetChannels.every(isText)) {
    fail("targetChannels", "ต้องระบุช่องทางเป้าหมายอย่างน้อยหนึ่งช่องทาง");
  }

  if (record.status === "Rejected" && !isText(record.rejectionReason)) {
    fail("rejectionReason", "Core Idea ที่ Rejected ต้องมี Rejection Reason");
  }
  if (record.status === "Revise" && !isText(record.reviseComment)) {
    fail("reviseComment", "Core Idea ที่ Revise ต้องมีคอมเมนต์");
  }

  return { ok: errors.length === 0, errors };
}

// Allowed moves: actor → from-status → to-statuses. `undefined` from-status = a new Core Idea.
const MOVES = {
  Ideation: { undefined: ["Proposed"], Revise: ["Proposed"] },
  Human: { Proposed: ["Approved", "Revise", "Rejected"] },
  "Asset Production": { Approved: ["In Production"] },
};

const refuse = (code, reason) => ({ ok: false, code, reason });

/**
 * Apply a status change by an actor. Never mutates `record`.
 * @param {object} record  the current Core Idea (with `id`)
 * @param {{actor: string, to: string, comment?: string, reason?: string, riskAcknowledged?: boolean}} action
 * @returns {{ok: true, record: object} | {ok: false, code: string, reason: string}}
 *   codes: transition-not-allowed, invalid-record, claim-hold, risk-not-acknowledged,
 *   missing-revise-comment, missing-rejection-reason
 */
export function applyTransition(record, action) {
  const { actor, to } = action || {};
  const from = record && record.status;
  const allowed = MOVES[actor] && MOVES[actor][from];
  if (!allowed || !allowed.includes(to)) {
    return refuse("transition-not-allowed", `${actor || "ผู้ไม่ระบุ"} เปลี่ยนสถานะจาก ${from || "(ใหม่)"} เป็น ${to} ไม่ได้`);
  }

  const next = { ...record, status: to };

  if (to === "Revise") {
    if (!isText(action.comment)) return refuse("missing-revise-comment", "ขอแก้ต้องมีคอมเมนต์ว่าให้แก้อะไร");
    next.reviseComment = action.comment.trim();
    return { ok: true, record: next };
  }
  if (to === "Rejected") {
    if (!isText(action.reason)) return refuse("missing-rejection-reason", "ไม่อนุมัติต้องมี Rejection Reason");
    next.rejectionReason = action.reason.trim();
    return { ok: true, record: next };
  }

  if (to === "Approved" && record.claimStatus === "HOLD") {
    return refuse("claim-hold", "Claim Status เป็น HOLD — อนุมัติไม่ได้");
  }

  // Proposed (by Ideation), Approved and In Production all need a complete, valid record.
  if (to === "Proposed") next.riskAcknowledged = false; // new content needs a fresh acknowledgement
  const check = validateCoreIdea(next);
  if (!check.ok) {
    return refuse("invalid-record", "Core Idea ยังไม่ครบตามกฎ: " + check.errors.map((e) => e.message).join("; "));
  }

  if (to === "Approved") {
    if (record.claimStatus === "ต้องระวัง") {
      if (action.riskAcknowledged !== true) {
        return refuse("risk-not-acknowledged", "Claim Status เป็น ต้องระวัง — ต้องกดรับทราบความเสี่ยงก่อนอนุมัติ");
      }
      next.riskAcknowledged = true;
    }
  }
  return { ok: true, record: next };
}
