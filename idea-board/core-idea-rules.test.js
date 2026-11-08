// Tests for the Core Idea Rules module, through its public operations only.
// Run: npm test  (node --test, no dependencies)
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCoreIdea, applyTransition } from "./core-idea-rules.js";

function validCoreIdea(overrides = {}) {
  return {
    id: "2026-11-09-01",
    batchId: "2026-11-09",
    createdAt: "2026-11-09T01:47:00Z",
    status: "Proposed",
    primaryPillar: "Understand Your Skin & Hair",
    topicTerritory: "Skin Health",
    productLinkage: "NONE",
    contentJob: "Explain",
    funnelStage: "Awareness",
    readerProblem: "ล้างหน้าบ่อยแล้วผิวตึง เกิดจากอะไร",
    hook: "ล้างหน้าวันละ 4 รอบ ผิวสะอาดขึ้นจริงไหม",
    keyMessage: "การล้างบ่อยเกินไปทำให้ผิวเสียความชุ่มชื้น ล้างวันละสองครั้งก็พอสำหรับคนส่วนใหญ่",
    evidenceSources: [{ title: "AAD: Face washing 101", url: "https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101" }],
    caveats: "คำแนะนำทั่วไป ไม่ครอบคลุมโรคผิวหนังเฉพาะ",
    claimStatus: "ผ่าน",
    suggestedFormat: "Short Video",
    targetChannels: ["TikTok", "Instagram Reels"],
    ...overrides,
  };
}

const fields = (result) => result.errors.map((e) => e.field).sort();

// ---------- validateCoreIdea ----------

test("a valid record passes", () => {
  assert.deepEqual(validateCoreIdea(validCoreIdea()), { ok: true, errors: [] });
});

for (const field of [
  "id", "batchId", "createdAt", "status", "primaryPillar", "topicTerritory", "productLinkage",
  "contentJob", "funnelStage", "readerProblem", "hook", "keyMessage", "caveats",
  "claimStatus", "suggestedFormat", "targetChannels",
]) {
  test(`missing ${field} fails with that field named`, () => {
    const idea = validCoreIdea();
    delete idea[field];
    const result = validateCoreIdea(idea);
    assert.equal(result.ok, false);
    assert.ok(fields(result).includes(field), `expected an error on ${field}, got ${fields(result)}`);
    assert.ok(result.errors.every((e) => typeof e.message === "string" && e.message.length > 0));
  });
}

test("blank text fields count as missing", () => {
  const result = validateCoreIdea(validCoreIdea({ hook: "   " }));
  assert.deepEqual(fields(result), ["hook"]);
});

test("values outside the allowed lists fail", () => {
  const result = validateCoreIdea(validCoreIdea({
    primaryPillar: "Lifestyle",
    productLinkage: "STRONG",
    funnelStage: "Loyalty",
    claimStatus: "OK",
    status: "Draft",
  }));
  assert.deepEqual(fields(result), ["claimStatus", "funnelStage", "primaryPillar", "productLinkage", "status"]);
});

test("more than one Primary Pillar fails", () => {
  const result = validateCoreIdea(validCoreIdea({
    primaryPillar: ["Understand Your Skin & Hair", "Proof Before Promises"],
  }));
  assert.deepEqual(fields(result), ["primaryPillar"]);
});

test("DIRECT without SKU fails; DIRECT with SKU passes", () => {
  assert.deepEqual(fields(validateCoreIdea(validCoreIdea({ productLinkage: "DIRECT" }))), ["sku"]);
  assert.equal(validateCoreIdea(validCoreIdea({ productLinkage: "DIRECT", sku: "Castile Soap" })).ok, true);
});

test("NONE or SOFT with a SKU fails (SKU only when DIRECT)", () => {
  assert.deepEqual(fields(validateCoreIdea(validCoreIdea({ productLinkage: "NONE", sku: "Castile Soap" }))), ["sku"]);
  assert.deepEqual(fields(validateCoreIdea(validCoreIdea({ productLinkage: "SOFT", sku: "Castile Soap" }))), ["sku"]);
  assert.equal(validateCoreIdea(validCoreIdea({ productLinkage: "SOFT" })).ok, true);
});

test("science, skin, hair and regulatory Topic Territories need an evidence source", () => {
  for (const topicTerritory of [
    "Skin Health", "Hair & Scalp", "Cosmetic Literacy", "Claims/Regulation",
    "skin health", "Regulation", "Ingredient Science", "สุขภาพผิว",
  ]) {
    const result = validateCoreIdea(validCoreIdea({ topicTerritory, evidenceSources: [] }));
    assert.deepEqual(fields(result), ["evidenceSources"], topicTerritory);
  }
});

test("other Topic Territories may have no evidence source", () => {
  assert.equal(validateCoreIdea(validCoreIdea({ topicTerritory: "Brand Story", evidenceSources: [] })).ok, true);
});

test("an evidence source needs a title and an http(s) link", () => {
  for (const source of [{ title: "", url: "https://example.org" }, { title: "AAD", url: "" }, { title: "AAD", url: "javascript:alert(1)" }]) {
    assert.deepEqual(fields(validateCoreIdea(validCoreIdea({ evidenceSources: [source] }))), ["evidenceSources"]);
  }
});

test("Claim Status ต้องระวัง or HOLD needs a reason; ผ่าน does not", () => {
  assert.deepEqual(fields(validateCoreIdea(validCoreIdea({ claimStatus: "ต้องระวัง" }))), ["claimReason"]);
  assert.deepEqual(fields(validateCoreIdea(validCoreIdea({ claimStatus: "HOLD" }))), ["claimReason"]);
  assert.equal(validateCoreIdea(validCoreIdea({ claimStatus: "ต้องระวัง", claimReason: "อ้างผลลัพธ์ต่อผิว" })).ok, true);
});

test("a Rejected record needs its Rejection Reason; a Revise record needs its comment", () => {
  assert.deepEqual(fields(validateCoreIdea(validCoreIdea({ status: "Rejected" }))), ["rejectionReason"]);
  assert.deepEqual(fields(validateCoreIdea(validCoreIdea({ status: "Revise" }))), ["reviseComment"]);
});

test("target channels must be a non-empty list", () => {
  assert.deepEqual(fields(validateCoreIdea(validCoreIdea({ targetChannels: [] }))), ["targetChannels"]);
});

test("the ticket-1 prototype record is invalid (Skin Health with no evidence)", () => {
  const proto = validCoreIdea({ evidenceSources: [], targetChannels: [] });
  assert.equal(validateCoreIdea(proto).ok, false);
});

test("validate does not throw on garbage", () => {
  assert.equal(validateCoreIdea(null).ok, false);
  assert.equal(validateCoreIdea("idea").ok, false);
});

// ---------- applyTransition ----------

const human = (to, extra = {}) => ({ actor: "Human", to, ...extra });

test("Human approves a Proposed Core Idea with Claim Status ผ่าน", () => {
  const result = applyTransition(validCoreIdea(), human("Approved"));
  assert.equal(result.ok, true);
  assert.equal(result.record.status, "Approved");
});

test("HOLD cannot be approved, even with acknowledgement", () => {
  const idea = validCoreIdea({ claimStatus: "HOLD", claimReason: "ไม่มีหลักฐานรองรับ" });
  const result = applyTransition(idea, human("Approved", { riskAcknowledged: true }));
  assert.equal(result.ok, false);
  assert.equal(result.code, "claim-hold");
});

test("ต้องระวัง is refused without acknowledgement and allowed with it", () => {
  const idea = validCoreIdea({ claimStatus: "ต้องระวัง", claimReason: "อ้างผลลัพธ์ต่อผิว" });
  const refused = applyTransition(idea, human("Approved"));
  assert.equal(refused.ok, false);
  assert.equal(refused.code, "risk-not-acknowledged");

  const allowed = applyTransition(idea, human("Approved", { riskAcknowledged: true }));
  assert.equal(allowed.ok, true);
  assert.equal(allowed.record.status, "Approved");
  assert.equal(allowed.record.riskAcknowledged, true);
});

test("an invalid Core Idea cannot be approved", () => {
  const result = applyTransition(validCoreIdea({ evidenceSources: [] }), human("Approved"));
  assert.equal(result.ok, false);
  assert.equal(result.code, "invalid-record");
});

test("Revise needs a comment, and records it", () => {
  assert.equal(applyTransition(validCoreIdea(), human("Revise")).code, "missing-revise-comment");
  assert.equal(applyTransition(validCoreIdea(), human("Revise", { comment: "  " })).code, "missing-revise-comment");
  const result = applyTransition(validCoreIdea(), human("Revise", { comment: "Hook ยาวไป" }));
  assert.equal(result.ok, true);
  assert.equal(result.record.status, "Revise");
  assert.equal(result.record.reviseComment, "Hook ยาวไป");
});

test("Reject needs a Rejection Reason, and records it", () => {
  assert.equal(applyTransition(validCoreIdea(), human("Rejected")).code, "missing-rejection-reason");
  const result = applyTransition(validCoreIdea(), human("Rejected", { reason: "ซ้ำกับคลิปเดือนที่แล้ว" }));
  assert.equal(result.ok, true);
  assert.equal(result.record.status, "Rejected");
  assert.equal(result.record.rejectionReason, "ซ้ำกับคลิปเดือนที่แล้ว");
});

test("an invalid or HOLD Core Idea can still be sent back or rejected", () => {
  const broken = validCoreIdea({ claimStatus: "HOLD", evidenceSources: [] });
  assert.equal(applyTransition(broken, human("Revise", { comment: "ใส่แหล่งอ้างอิง" })).ok, true);
  assert.equal(applyTransition(broken, human("Rejected", { reason: "ไม่มีหลักฐาน" })).ok, true);
});

test("Human can only decide on Proposed Core Ideas", () => {
  for (const status of ["Approved", "Rejected", "In Production"]) {
    const idea = validCoreIdea({ status, rejectionReason: "x" });
    const result = applyTransition(idea, human("Approved"));
    assert.equal(result.ok, false, status);
    assert.equal(result.code, "transition-not-allowed", status);
  }
});

test("Human cannot set In Production", () => {
  const result = applyTransition(validCoreIdea({ status: "Approved" }), human("In Production"));
  assert.equal(result.ok, false);
  assert.equal(result.code, "transition-not-allowed");
});

test("Asset Production cannot approve; Ideation cannot approve", () => {
  for (const actor of ["Asset Production", "Ideation"]) {
    const result = applyTransition(validCoreIdea(), { actor, to: "Approved" });
    assert.equal(result.ok, false, actor);
    assert.equal(result.code, "transition-not-allowed", actor);
  }
});

test("Asset Production moves Approved to In Production", () => {
  const result = applyTransition(validCoreIdea({ status: "Approved" }), { actor: "Asset Production", to: "In Production" });
  assert.equal(result.ok, true);
  assert.equal(result.record.status, "In Production");
});

test("Asset Production cannot pick up a Proposed Core Idea", () => {
  const result = applyTransition(validCoreIdea(), { actor: "Asset Production", to: "In Production" });
  assert.equal(result.code, "transition-not-allowed");
});

test("Ideation proposes a new Core Idea and re-proposes a Revise one", () => {
  const fresh = validCoreIdea();
  delete fresh.status;
  const created = applyTransition(fresh, { actor: "Ideation", to: "Proposed" });
  assert.equal(created.ok, true);
  assert.equal(created.record.status, "Proposed");

  const revised = validCoreIdea({ status: "Revise", reviseComment: "Hook ยาวไป", riskAcknowledged: true });
  const back = applyTransition(revised, { actor: "Ideation", to: "Proposed" });
  assert.equal(back.ok, true);
  assert.equal(back.record.status, "Proposed");
  assert.equal(back.record.riskAcknowledged, false, "new content needs a fresh acknowledgement");
});

test("Ideation cannot propose an invalid Core Idea", () => {
  const fresh = validCoreIdea({ productLinkage: "DIRECT" });
  delete fresh.status;
  assert.equal(applyTransition(fresh, { actor: "Ideation", to: "Proposed" }).code, "invalid-record");
});

test("an unknown actor is refused", () => {
  assert.equal(applyTransition(validCoreIdea(), { actor: "Someone", to: "Approved" }).code, "transition-not-allowed");
});

test("applyTransition does not modify the record it is given", () => {
  const idea = validCoreIdea();
  const snapshot = structuredClone(idea);
  applyTransition(idea, human("Rejected", { reason: "ไม่ตรงแบรนด์" }));
  assert.deepEqual(idea, snapshot);
});

test("every refusal carries a readable reason", () => {
  const result = applyTransition(validCoreIdea({ claimStatus: "HOLD", claimReason: "x" }), human("Approved"));
  assert.equal(typeof result.reason, "string");
  assert.ok(result.reason.length > 0);
});
