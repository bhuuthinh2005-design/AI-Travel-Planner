import { createHash } from "node:crypto";
import { problem } from "./problem";
import { getStore } from "./store";
import { validatePlan } from "./validator";

const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * POST /api/plans/{planId}/save. Behaviour is specified in docs/contract/save-plan.md;
 * change the contract first, then this file.
 */
export async function handleSavePlan(request: Request, planId: string): Promise<Response> {
  const store = getStore();
  const instance = `/api/plans/${planId}/save`;

  // 1. Authentication
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const userId = store.tokens[token];
  if (!userId) {
    return problem({
      slug: "unauthenticated",
      title: "Authentication required",
      status: 401,
      detail: "A valid bearer token is required.",
      instance,
      headers: { "WWW-Authenticate": "Bearer" },
    });
  }

  // 2. Visibility: a plan outside the caller's groups looks like it does not exist.
  const plan = store.plans[planId];
  const group = plan ? store.groups[plan.groupId] : undefined;
  if (!plan || !group || !group.members.some((m) => m.userId === userId)) {
    return problem({
      slug: "plan-not-found",
      title: "Plan not found",
      status: 404,
      detail: `No plan ${planId} is visible to you.`,
      instance,
    });
  }

  // 3. Ownership: only the member who created the plan may save it.
  if (plan.ownerId !== userId) {
    return problem({
      slug: "plan-not-found",
      title: "Only the plan owner can save",
      status: 404,
      detail: "This plan was created by another member of your group.",
      instance,
    });
  }

  // 4. Request shape
  const key = request.headers.get("idempotency-key");
  if (!key) {
    return problem({
      slug: "idempotency-key-missing",
      title: "Idempotency-Key header is required",
      status: 400,
      detail: "Send a unique Idempotency-Key header (8-64 characters: letters, digits, _ or -).",
      instance,
    });
  }
  const rawBody = await request.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    parsed = undefined;
  }
  const reviewedVersion = (parsed as { reviewedVersion?: unknown } | undefined)?.reviewedVersion;
  const errors: { field: string; message: string }[] = [];
  if (!IDEMPOTENCY_KEY.test(key)) {
    errors.push({
      field: "Idempotency-Key",
      message: "Must be 8-64 characters: letters, digits, _ or -.",
    });
  }
  if (!Number.isInteger(reviewedVersion) || (reviewedVersion as number) < 1) {
    errors.push({ field: "reviewedVersion", message: "Required positive integer." });
  }
  if (errors.length > 0) {
    return problem({
      slug: "invalid-request",
      title: "Invalid request",
      status: 400,
      detail: "The request header or body failed validation.",
      instance,
      extensions: { errors },
    });
  }

  // 5. Idempotency replay
  const bodyHash = createHash("sha256").update(JSON.stringify({ reviewedVersion })).digest("hex");
  const recordKey = `${userId}:${planId}:${key}`;
  const previous = store.idempotency.get(recordKey);
  if (previous) {
    if (previous.bodyHash !== bodyHash) {
      return problem({
        slug: "idempotency-key-reuse",
        title: "Idempotency-Key was already used with a different body",
        status: 422,
        detail: "Use a new Idempotency-Key for a different request.",
        instance,
      });
    }
    return Response.json(previous.body, {
      status: previous.status,
      headers: { "Idempotent-Replayed": "true" },
    });
  }

  // 6. Version check (the user must have reviewed the version being saved)
  if (reviewedVersion !== plan.version) {
    return problem({
      slug: "plan-version-conflict",
      title: "The plan changed after you reviewed it",
      status: 409,
      detail: `You reviewed version ${reviewedVersion}; the current version is ${plan.version}.`,
      instance,
      extensions: { currentVersion: plan.version },
    });
  }

  // 7. Validator gate (runs again in the backend, always)
  if (plan.status !== "saved") {
    const violations = validatePlan(plan, store);
    if (violations.length > 0) {
      return problem({
        slug: "plan-validation-failed",
        title: "The plan breaks a validator rule",
        status: 422,
        detail: `${violations.length} violation(s). Nothing was saved or shared.`,
        instance,
        extensions: { violations },
      });
    }
    plan.status = "saved";
    plan.savedAt = new Date().toISOString();
  }

  const body = {
    planId: plan.id,
    status: plan.status,
    version: plan.version,
    savedAt: plan.savedAt,
    sharedWith: group.members.map((m) => m.userId),
  };
  store.idempotency.set(recordKey, { bodyHash, status: 200, body });
  return Response.json(body, { status: 200 });
}
