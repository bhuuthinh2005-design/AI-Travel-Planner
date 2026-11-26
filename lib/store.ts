import type { Member, Place, Plan } from "./types";

export interface Group {
  id: string;
  members: Member[];
}

export interface IdempotencyRecord {
  bodyHash: string;
  status: number;
  body: unknown;
}

export interface Store {
  /** bearer token -> userId */
  tokens: Record<string, string>;
  groups: Record<string, Group>;
  places: Record<string, Place>;
  /** motorbike minutes: travelMinutes[fromPlaceId][toPlaceId] */
  travelMinutes: Record<string, Record<string, number>>;
  /** rain chance in percent: rain[date][hour] */
  rain: Record<string, Record<number, number>>;
  plans: Record<string, Plan>;
  idempotency: Map<string, IdempotencyRecord>;
}

const allDays = (open: string, close: string): Place["hours"] => ({
  0: { open, close },
  1: { open, close },
  2: { open, close },
  3: { open, close },
  4: { open, close },
  5: { open, close },
  6: { open, close },
});

export function createSeed(): Store {
  return {
    tokens: { "tok-linh": "u-linh", "tok-minh": "u-minh", "tok-outsider": "u-outsider" },
    groups: {
      "g-1": {
        id: "g-1",
        members: [
          { userId: "u-linh", capVnd: 1_000_000 },
          { userId: "u-minh", capVnd: 600_000 },
        ],
      },
      "g-2": { id: "g-2", members: [{ userId: "u-outsider", capVnd: 1_000_000 }] },
    },
    places: {
      "ben-thanh-market": {
        id: "ben-thanh-market",
        name: "Ben Thanh Market",
        outdoor: false,
        hours: allDays("06:00", "18:00"),
      },
      "war-remnants-museum": {
        id: "war-remnants-museum",
        name: "War Remnants Museum",
        outdoor: false,
        hours: allDays("07:30", "17:30"),
      },
      "saigon-zoo": {
        id: "saigon-zoo",
        name: "Saigon Zoo and Botanical Garden",
        outdoor: true,
        hours: allDays("07:00", "18:00"),
      },
    },
    travelMinutes: {
      "ben-thanh-market": { "war-remnants-museum": 15, "saigon-zoo": 20 },
      "war-remnants-museum": { "ben-thanh-market": 15, "saigon-zoo": 25 },
      "saigon-zoo": { "ben-thanh-market": 20, "war-remnants-museum": 25 },
    },
    rain: { "2026-12-05": { 14: 80 } },
    plans: {
      "p-1": {
        id: "p-1",
        tripId: "t-1",
        ownerId: "u-linh",
        groupId: "g-1",
        version: 3,
        status: "draft",
        date: "2026-12-05",
        groupTotalVnd: 1_500_000,
        stops: [
          {
            placeId: "ben-thanh-market",
            start: "09:00",
            end: "10:30",
            spendVnd: { "u-linh": 100_000, "u-minh": 100_000 },
          },
          {
            placeId: "war-remnants-museum",
            start: "11:00",
            end: "12:30",
            spendVnd: { "u-linh": 40_000, "u-minh": 40_000 },
          },
        ],
      },
      // Owned by another member of the same group (used for the ownership rule).
      "p-2": {
        id: "p-2",
        tripId: "t-1",
        ownerId: "u-minh",
        groupId: "g-1",
        version: 1,
        status: "draft",
        date: "2026-12-05",
        groupTotalVnd: 1_500_000,
        stops: [],
      },
      // Belongs to a group the main test user is not in (must look like it does not exist).
      "p-3": {
        id: "p-3",
        tripId: "t-2",
        ownerId: "u-outsider",
        groupId: "g-2",
        version: 1,
        status: "draft",
        date: "2026-12-05",
        groupTotalVnd: 1_000_000,
        stops: [],
      },
    },
    idempotency: new Map(),
  };
}

let store: Store = createSeed();

export function getStore(): Store {
  return store;
}

/** Test helper: restore the seed data. */
export function resetStore(): Store {
  store = createSeed();
  return store;
}
