# Contract: `POST /api/plans/{planId}/save`

Status: v1 · Owner: team 23127001 / 23127121 · Tests: `tests/contract/save-plan.test.ts`

Saving is the step that **shares a schedule with the whole group**. A wrong save reaches all
members and cannot be recalled (brief, section 3), so this endpoint is strict: it only saves a plan
the validator accepts, it is safe to repeat, and only the plan's creator may call it.

## 1. Purpose

The plan owner presses **Save** after reviewing the schedule and the spending. The backend
re-validates the plan (the validator always runs one last time), marks it `saved`, and makes it
visible to every member of the plan's group. Nothing reaches the group before this call succeeds.

## 2. Who may call it

| Rule      | Value                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------ |
| Auth      | `Authorization: Bearer <token>`; the token identifies one user. No token or unknown token: `401`.      |
| Role      | The user must be a **current member** of the plan's group **and** the plan's creator (`ownerId`).      |
| Ownership | A plan of a group the caller is not in answers `404` (existence is not revealed).                      |
| Non-owner | A member of the group who did not create the plan gets `403`. Group size or role does not change this. |

Check order is fixed: 401, 404, 403, 400, idempotent replay, 409, 422.

## 3. Request

```
POST /api/plans/{planId}/save
Authorization: Bearer <token>
Idempotency-Key: <8-64 chars: letters, digits, _ or ->
Content-Type: application/json

{ "reviewedVersion": 3 }
```

| Field             | Where  | Rules                                                                                                  |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `planId`          | path   | Plan id, string.                                                                                       |
| `Idempotency-Key` | header | Required. 8-64 characters, `[A-Za-z0-9_-]`. Generate one per user action and reuse it for every retry. |
| `reviewedVersion` | body   | Required positive integer: the plan `version` the user reviewed. Unknown extra fields are ignored.     |

## 4. Success response

`200 OK`, `Content-Type: application/json`

```json
{
  "planId": "p-1",
  "status": "saved",
  "version": 3,
  "savedAt": "2026-12-05T08:00:00.000Z",
  "sharedWith": ["u-linh", "u-minh"]
}
```

| Field        | Type                  | Rules                                                           |
| ------------ | --------------------- | --------------------------------------------------------------- |
| `planId`     | string                | Echo of the path id.                                            |
| `status`     | `"saved"`             | Always `saved` on success.                                      |
| `version`    | integer               | The saved version (equals `reviewedVersion`).                   |
| `savedAt`    | string (ISO 8601 UTC) | Time of the first successful save. Never changes on repeats.    |
| `sharedWith` | string[]              | User ids of every member of the group who can now see the plan. |

## 5. Errors (RFC 9457 problem details)

All errors use `Content-Type: application/problem+json` with the members `type`, `title`, `status`,
`detail` and `instance` (the request path). `type` is `https://atp.example/problems/<slug>`; it is a
stable identifier and is not required to resolve. Clients must switch on `type`, not on `detail`.

| `type` slug               | Status | When                                                                                                 | Extra members                    |
| ------------------------- | ------ | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| `unauthenticated`         | 401    | Missing or unknown bearer token. Response has `WWW-Authenticate: Bearer`.                            | none                             |
| `plan-not-found`          | 404    | No such plan, or the plan belongs to a group the caller is not in.                                   | none                             |
| `plan-not-owner`          | 403    | Caller is in the group but did not create the plan.                                                  | none                             |
| `idempotency-key-missing` | 400    | `Idempotency-Key` header absent.                                                                     | none                             |
| `invalid-request`         | 400    | Key has a bad format, or `reviewedVersion` is missing, not an integer, or below 1; body is not JSON. | `errors[]`: `{ field, message }` |
| `idempotency-key-reuse`   | 422    | The same key was already used by this user on this plan with a different body.                       | none                             |
| `plan-version-conflict`   | 409    | `reviewedVersion` is not the current version (the plan was edited after review).                     | `currentVersion` (integer)       |
| `plan-validation-failed`  | 422    | The validator rejects the plan. **Nothing is saved or shared.**                                      | `violations[]` (below)           |

`violations[]` items: `{ code, stopIndex, userId?, message }` where `code` is one of
`place-not-found`, `closed-at-stop-time`, `travel-time-too-short`, `member-cap-exceeded`,
`group-total-exceeded`, `outdoor-rain-risk`; `stopIndex` is the zero-based stop or `null` for
plan-wide rules. Spending rule: each member's total stays within that member's own cap and the
plan total stays within the group total. (Assumption until the product owners rule otherwise.)

Example:

```json
{
  "type": "https://atp.example/problems/plan-validation-failed",
  "title": "The plan breaks a validator rule",
  "status": 422,
  "detail": "1 violation(s). Nothing was saved or shared.",
  "instance": "/api/plans/p-1/save",
  "violations": [
    {
      "code": "outdoor-rain-risk",
      "stopIndex": 2,
      "message": "Outdoor stop Saigon Zoo and Botanical Garden overlaps 14:00 where rain chance is 80%."
    }
  ]
}
```

## 6. Idempotency and repeating the call

- Saving is safe to repeat. A retry with the **same key and same body** returns the stored
  response (`200`, same body) with header `Idempotent-Replayed: true`. It never shares twice.
- A **new key** for a plan that is already saved at the same `reviewedVersion` returns `200` with the
  existing `savedAt`; nothing changes.
- The same key with a different body is `422 idempotency-key-reuse`.
- Failed attempts (4xx) are not stored: a retry is evaluated again against the current plan.
- Keys are scoped to (user, plan) and kept at least 24 hours.

## 7. Paging

Not applicable: the endpoint returns one object.

## 8. Changing this contract

- Adding a response member, a new `violations[].code`, or a new problem `type` is **non-breaking**;
  clients must ignore unknown members and handle unknown `type` as a generic failure of that status.
- Changing a status code, removing or renaming a member, tightening a field rule, or changing the
  check order is **breaking**: it needs a new path version (`/api/v2/...`), and this file is edited
  in the same pull request, before the code.
- Tests in `tests/contract/` follow this file. A change that makes a contract test fail is fixed in
  the code, or in this file first with a reviewer's approval, never by editing the test alone.
