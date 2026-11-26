import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "../../app/api/plans/[planId]/save/route";
import { PROBLEM_BASE } from "../../lib/problem";
import { getStore, resetStore } from "../../lib/store";

// These tests follow docs/contract/save-plan.md. Change the contract first, then the code, then the tests.

interface Options {
  token?: string | null;
  key?: string | null;
  body?: unknown;
  rawBody?: string;
}

async function save(planId: string, opts: Options = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = opts.token === undefined ? "tok-linh" : opts.token;
  const key = opts.key === undefined ? "key-12345678" : opts.key;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (key) headers["Idempotency-Key"] = key;
  const body = opts.rawBody ?? JSON.stringify(opts.body ?? { reviewedVersion: 3 });
  const res = await POST(
    new Request(`http://localhost/api/plans/${planId}/save`, { method: "POST", headers, body }),
    { params: Promise.resolve({ planId }) },
  );
  const text = await res.text();
  return { res, json: text ? JSON.parse(text) : undefined };
}

function expectProblem(
  r: Awaited<ReturnType<typeof save>>,
  status: number,
  slug: string,
  planId = "p-1",
) {
  expect(r.res.status).toBe(status);
  expect(r.res.headers.get("content-type")).toContain("application/problem+json");
  expect(r.json.type).toBe(`${PROBLEM_BASE}${slug}`);
  expect(r.json.status).toBe(status);
  expect(typeof r.json.title).toBe("string");
  expect(typeof r.json.detail).toBe("string");
  expect(r.json.instance).toBe(`/api/plans/${planId}/save`);
}

beforeEach(() => {
  resetStore();
});

describe("success", () => {
  it("saves a valid plan and shares it with every group member", async () => {
    const r = await save("p-1");
    expect(r.res.status).toBe(200);
    expect(r.res.headers.get("content-type")).toContain("application/json");
    expect(r.json).toMatchObject({
      planId: "p-1",
      status: "saved",
      version: 3,
      sharedWith: ["u-linh", "u-minh"],
    });
    expect(Number.isNaN(Date.parse(r.json.savedAt))).toBe(false);
    expect(getStore().plans["p-1"].status).toBe("saved");
  });
});

describe("who may call it", () => {
  it("401 unauthenticated without a token, with WWW-Authenticate", async () => {
    const r = await save("p-1", { token: null });
    expectProblem(r, 401, "unauthenticated");
    expect(r.res.headers.get("www-authenticate")).toBe("Bearer");
  });

  it("401 unauthenticated with an unknown token", async () => {
    expectProblem(await save("p-1", { token: "nope" }), 401, "unauthenticated");
  });

  it("404 plan-not-found for a plan of a group the caller is not in", async () => {
    const r = await save("p-3", { body: { reviewedVersion: 1 } });
    expectProblem(r, 404, "plan-not-found", "p-3");
    expect(getStore().plans["p-3"].status).toBe("draft");
  });

  it("404 plan-not-found for an unknown plan id", async () => {
    expectProblem(await save("p-missing"), 404, "plan-not-found", "p-missing");
  });

  it("403 plan-not-owner for a group member who did not create the plan", async () => {
    const r = await save("p-2", { body: { reviewedVersion: 1 } });
    expectProblem(r, 403, "plan-not-owner", "p-2");
    expect(getStore().plans["p-2"].status).toBe("draft");
  });

  it("checks identity before request shape: missing key on someone else's plan is still 404", async () => {
    expectProblem(await save("p-3", { key: null }), 404, "plan-not-found", "p-3");
  });
});

describe("request shape", () => {
  it("400 idempotency-key-missing without the header", async () => {
    expectProblem(await save("p-1", { key: null }), 400, "idempotency-key-missing");
  });

  it("400 invalid-request for a malformed key, listing the field", async () => {
    const r = await save("p-1", { key: "short" });
    expectProblem(r, 400, "invalid-request");
    expect(r.json.errors).toEqual([expect.objectContaining({ field: "Idempotency-Key" })]);
  });

  it.each([
    ["missing", {}],
    ["a string", { reviewedVersion: "3" }],
    ["zero", { reviewedVersion: 0 }],
    ["a fraction", { reviewedVersion: 1.5 }],
  ])("400 invalid-request when reviewedVersion is %s", async (_label, body) => {
    const r = await save("p-1", { body });
    expectProblem(r, 400, "invalid-request");
    expect(r.json.errors).toEqual([expect.objectContaining({ field: "reviewedVersion" })]);
  });

  it("400 invalid-request when the body is not JSON", async () => {
    expectProblem(await save("p-1", { rawBody: "not json" }), 400, "invalid-request");
  });
});

describe("idempotency", () => {
  it("replays the stored response for the same key and body, without saving twice", async () => {
    const first = await save("p-1");
    const savedAt = getStore().plans["p-1"].savedAt;
    const again = await save("p-1");
    expect(again.res.status).toBe(200);
    expect(again.res.headers.get("idempotent-replayed")).toBe("true");
    expect(again.json).toEqual(first.json);
    expect(getStore().plans["p-1"].savedAt).toBe(savedAt);
  });

  it("422 idempotency-key-reuse for the same key with a different body", async () => {
    await save("p-1");
    expectProblem(
      await save("p-1", { body: { reviewedVersion: 2 } }),
      422,
      "idempotency-key-reuse",
    );
  });

  it("a new key on an already saved plan returns 200 with the original savedAt", async () => {
    const first = await save("p-1", { key: "key-aaaaaaaa" });
    const second = await save("p-1", { key: "key-bbbbbbbb" });
    expect(second.res.status).toBe(200);
    expect(second.res.headers.get("idempotent-replayed")).toBeNull();
    expect(second.json.savedAt).toBe(first.json.savedAt);
  });

  it("does not store failed attempts: a retry is judged against the current plan", async () => {
    getStore().plans["p-1"].stops[0].spendVnd["u-minh"] = 700_000;
    expectProblem(await save("p-1"), 422, "plan-validation-failed");
    getStore().plans["p-1"].stops[0].spendVnd["u-minh"] = 100_000;
    expect((await save("p-1")).res.status).toBe(200);
  });
});

describe("version conflict", () => {
  it("409 plan-version-conflict with currentVersion when the plan changed after review", async () => {
    const r = await save("p-1", { body: { reviewedVersion: 2 } });
    expectProblem(r, 409, "plan-version-conflict");
    expect(r.json.currentVersion).toBe(3);
    expect(getStore().plans["p-1"].status).toBe("draft");
  });
});

describe("validator gate: 422 plan-validation-failed and nothing is saved", () => {
  async function expectViolation(code: string, userId?: string) {
    const r = await save("p-1");
    expectProblem(r, 422, "plan-validation-failed");
    const hit = r.json.violations.find((v: { code: string }) => v.code === code);
    expect(hit).toBeDefined();
    if (userId) expect(hit.userId).toBe(userId);
    expect(getStore().plans["p-1"].status).toBe("draft");
    expect(getStore().plans["p-1"].savedAt).toBeUndefined();
  }

  it("member over their own cap", async () => {
    getStore().plans["p-1"].stops[0].spendVnd["u-minh"] = 700_000;
    await expectViolation("member-cap-exceeded", "u-minh");
  });

  it("group total exceeded", async () => {
    getStore().plans["p-1"].groupTotalVnd = 100_000;
    await expectViolation("group-total-exceeded");
  });

  it("stop outside opening hours", async () => {
    getStore().plans["p-1"].stops[0].start = "05:00";
    await expectViolation("closed-at-stop-time");
  });

  it("travel time longer than the gap between stops", async () => {
    getStore().plans["p-1"].stops[1].start = "10:35";
    await expectViolation("travel-time-too-short");
  });

  it("outdoor stop when rain chance is above 60%", async () => {
    getStore().plans["p-1"].stops.push({
      placeId: "saigon-zoo",
      start: "14:00",
      end: "15:30",
      spendVnd: { "u-linh": 10_000, "u-minh": 10_000 },
    });
    await expectViolation("outdoor-rain-risk");
  });

  it("place that does not exist", async () => {
    getStore().plans["p-1"].stops[0].placeId = "made-up-place";
    await expectViolation("place-not-found");
  });
});
