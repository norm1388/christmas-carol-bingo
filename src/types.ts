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
  lineIndices: number[]; // indices of the claimed line (e.g., [0,6,12,18,24])
  votes: Record<string, "yes" | "no">; // playerId -> vote
}

export interface Room {
  code: string;
  hostId: string;
  status: RoomStatus;

  players: Record<string, Player>;
  cards: Record<string, Card>;

  currentClaim?: Claim | null;
}
