export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Place {
  id: string;
  name: string;
  outdoor: boolean;
  /** Opening hours per weekday (0 = Sunday). Missing day = closed. "HH:MM" 24h. */
  hours: Partial<Record<Weekday, { open: string; close: string }>>;
}

export interface Member {
  userId: string;
  /** Personal spending cap in VND. */
  capVnd: number;
}

export interface Stop {
  placeId: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  /** Estimated spend per member for this stop, in VND (computed by code, never by the model). */
  spendVnd: Record<string, number>;
}

export interface Plan {
  id: string;
  tripId: string;
  ownerId: string;
  groupId: string;
  version: number;
  status: "draft" | "saved";
  date: string; // "YYYY-MM-DD"
  groupTotalVnd: number;
  stops: Stop[];
  savedAt?: string;
}

export interface Violation {
  code:
    | "place-not-found"
    | "closed-at-stop-time"
    | "travel-time-too-short"
    | "member-cap-exceeded"
    | "group-total-exceeded"
    | "outdoor-rain-risk";
  stopIndex: number | null;
  userId?: string;
  message: string;
}
