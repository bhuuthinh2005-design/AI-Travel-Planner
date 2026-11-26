import type { Store } from "./store";
import type { Plan, Violation, Weekday } from "./types";

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Deterministic plan validator (plain code, no model). Same checks the brief lists in section 3.
 * Returns every violation; an empty array means the plan may be saved.
 */
export function validatePlan(plan: Plan, store: Store): Violation[] {
  const violations: Violation[] = [];
  const weekday = new Date(`${plan.date}T00:00:00Z`).getUTCDay() as Weekday;

  plan.stops.forEach((stop, i) => {
    const place = store.places[stop.placeId];
    if (!place) {
      violations.push({
        code: "place-not-found",
        stopIndex: i,
        message: `Place ${stop.placeId} does not exist in the checked data.`,
      });
      return;
    }

    const start = toMinutes(stop.start);
    const end = toMinutes(stop.end);
    const hours = place.hours[weekday];
    if (!hours || start < toMinutes(hours.open) || end > toMinutes(hours.close)) {
      violations.push({
        code: "closed-at-stop-time",
        stopIndex: i,
        message: `${place.name} is not open from ${stop.start} to ${stop.end} on ${plan.date}.`,
      });
    }

    if (place.outdoor) {
      const rain = store.rain[plan.date] ?? {};
      for (let h = Math.floor(start / 60); h * 60 < end; h++) {
        if ((rain[h] ?? 0) > 60) {
          violations.push({
            code: "outdoor-rain-risk",
            stopIndex: i,
            message: `Outdoor stop ${place.name} overlaps ${h}:00 where rain chance is ${rain[h]}%.`,
          });
          break;
        }
      }
    }

    const prev = plan.stops[i - 1];
    if (prev) {
      const needed = store.travelMinutes[prev.placeId]?.[stop.placeId];
      if (needed !== undefined && start - toMinutes(prev.end) < needed) {
        violations.push({
          code: "travel-time-too-short",
          stopIndex: i,
          message: `Motorbike trip needs ${needed} min but the gap is ${start - toMinutes(prev.end)} min.`,
        });
      }
    }
  });

  const group = store.groups[plan.groupId];
  let total = 0;
  for (const member of group?.members ?? []) {
    const spent = plan.stops.reduce((sum, s) => sum + (s.spendVnd[member.userId] ?? 0), 0);
    total += spent;
    if (spent > member.capVnd) {
      violations.push({
        code: "member-cap-exceeded",
        stopIndex: null,
        userId: member.userId,
        message: `Member ${member.userId} spends ${spent} VND, above their cap of ${member.capVnd} VND.`,
      });
    }
  }
  if (total > plan.groupTotalVnd) {
    violations.push({
      code: "group-total-exceeded",
      stopIndex: null,
      message: `Group spends ${total} VND, above the group total of ${plan.groupTotalVnd} VND.`,
    });
  }

  return violations;
}
