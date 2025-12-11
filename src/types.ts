// src/types.ts

export type RoomStatus = "lobby" | "in_round" | "review";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Card {
  grid: string[];      // 25 image IDs
  marks: boolean[];    // 25 booleans
}

export interface Claim {
  playerId: string;
  lineIndices: number[];          // all 5 indices being claimed
  currentCellPosition: number;    // which of the 5 we are currently voting on (0..4)
  votesForCurrent: Record<string, "yes" | "no">; // votes for the current cell only
}

export interface Room {
  code: string;
  hostId: string;
  status: RoomStatus;

  players: Record<string, Player>;
  cards: Record<string, Card>;

  currentClaim?: Claim | null;
}
