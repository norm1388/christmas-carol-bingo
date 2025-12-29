// src/types.ts
import type { FieldValue, Timestamp } from "firebase/firestore";

export type RoomStatus = "lobby" | "in_round" | "review";

export interface Player {
  id: string;
  name: string;
  score: number;
  joinedAt?: number; // milliseconds since epoch; used only for stable ordering
}

export interface Card {
  grid: string[];   // 25 image IDs
  marks: boolean[]; // 25 booleans
}

export interface Claim {
  playerId: string;                // claimant player id
  lineIndices: number[];           // the 5 indices being claimed
  currentCellPosition: number;     // which of the 5 we are voting on (0..4)
  votesForCurrent: Record<string, "yes" | "no">; // votes for the current cell only
}

export interface Room {
  code: string;
  hostId: string;
  status: RoomStatus;

  players: Record<string, Player>;
  cards: Record<string, Card>;

  // Prefer non-optional; you always set it to null when absent
  currentClaim: Claim | null;

  // Audit fields
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}
