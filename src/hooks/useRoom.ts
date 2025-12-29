// src/hooks/useRoom.ts
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Room, Player, Card, Claim, RoomStatus } from "../types";
import { makeCard } from "../imageDeck";

const ROOMS_COLLECTION = "rooms";

// Generate a simple 4-letter room code
function generateRoomCode(): string {
  const letters = "ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
}

// Generate a random player id (client-side)
export function generatePlayerId(): string {
  return `p_${Math.random().toString(36).slice(2, 10)}`;
}

export function useRoom(roomCode: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    setLoading(true);

    const unsub = onSnapshot(
      roomRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setRoom(null);
          setError("Room not found");
          setLoading(false);
          return;
        }
        setRoom(snapshot.data() as Room);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError("Failed to subscribe to room");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [roomCode]);

  return { room, loading, error };
}

// Create a new room with the caller as host/player
export async function createRoomWithPlayer(
  playerId: string,
  playerName: string
): Promise<string> {
  const code = generateRoomCode();
  const roomRef = doc(db, ROOMS_COLLECTION, code);

  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
	joinedAt: Date.now(),
  };

  const card: Card = makeCard();

  const room: Room = {
    code,
    hostId: playerId,
    status: "lobby",
    players: {
      [playerId]: player,
    },
    cards: {
      [playerId]: card,
    },
    currentClaim: null,
	createdAt: serverTimestamp(),
	updatedAt: serverTimestamp(),
  };

  await setDoc(roomRef, room);
  return code;
}

// Join an existing room
export async function joinRoomWithPlayer(
  roomCode: string,
  playerId: string,
  playerName: string
): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) {
    throw new Error("Room does not exist");
  }

  const room = snap.data() as Room;
  if (room.players[playerId]) {
    // Already joined previously
    return;
  }

  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    joinedAt: Date.now(),
  };
  const card: Card = makeCard();

  await updateDoc(roomRef, {
    [`players.${playerId}`]: player,
    [`cards.${playerId}`]: card,
	updatedAt: serverTimestamp(),
  });
}

// Start a round (host only, but you can enforce that in UI)
export async function setRoomStatus(
  roomCode: string,
  status: RoomStatus
): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  await updateDoc(roomRef, { 
	status,
	updatedAt: serverTimestamp(),});
}

// Toggle mark on a cell for a player
export async function toggleMark(
  roomCode: string,
  playerId: string,
  cellIndex: number
): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return;
  const room = snap.data() as Room;

  const card = room.cards[playerId];
  if (!card) return;

  const marks = [...card.marks];
  marks[cellIndex] = !marks[cellIndex];

  await updateDoc(roomRef, {
    [`cards.${playerId}.marks`]: marks,
	updatedAt: serverTimestamp(),
  });
}

// Compute winning line indices from marks; return first found line or null
function findWinningLine(marks: boolean[]): number[] | null {
  const lines: number[][] = [];

  // rows
  for (let r = 0; r < 5; r++) {
    const base = r * 5;
    lines.push([base, base + 1, base + 2, base + 3, base + 4]);
  }
  // columns
  for (let c = 0; c < 5; c++) {
    lines.push([c, c + 5, c + 10, c + 15, c + 20]);
  }
  // diagonals
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);

  for (const line of lines) {
    if (line.every((i) => marks[i])) return line;
  }
  return null;
}

export async function callBingo(
  roomCode: string,
  playerId: string
): Promise<"no-line" | "ok"> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return "no-line";

  const room = snap.data() as Room;
  const card = room.cards[playerId];
  if (!card) return "no-line";

  const lineIndices = findWinningLine(card.marks);
  if (!lineIndices) return "no-line";

const claim: Claim = {
  playerId,
  lineIndices,
  currentCellPosition: 0,   // start with the first cell in the line
  votesForCurrent: {},      // no votes yet
};

await updateDoc(roomRef, {
  status: "review",
  currentClaim: claim,
	updatedAt: serverTimestamp(),
});

  return "ok";
}

// Vote on the claim cells (yes/no)
export async function voteOnClaim(
  roomCode: string,
  voterId: string,
  vote: "yes" | "no",
  expectedCellPosition: number
): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef);
    if (!snap.exists()) return;

    const room = snap.data() as Room;
    const claim = room.currentClaim;
    if (!claim) return;

    // Claimant does not vote
    if (claim.playerId === voterId) return;

    // Prevent a vote landing after the host advanced to the next cell
    if (claim.currentCellPosition !== expectedCellPosition) return;

    tx.update(roomRef, {
      [`currentClaim.votesForCurrent.${voterId}`]: vote,
      updatedAt: serverTimestamp(),
    });
  });
}

// Resolve claim once all votes in; can be called by any client that detects it's time
export async function resolveClaim(roomCode: string): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef);
    if (!snap.exists()) return;

    const room = snap.data() as Room;
    const claim = room.currentClaim;
    if (!claim) return;

    const { playerId, lineIndices, currentCellPosition, votesForCurrent } = claim;

    // Everyone except claimant must vote
    const voters = Object.keys(room.players).filter((id) => id !== playerId);

    // Solo room: accept immediately
    if (voters.length === 0) {
      const newScore = (room.players[playerId]?.score ?? 0) + 1;

      const newCards: Record<string, Card> = {};
      for (const pid of Object.keys(room.players)) {
        newCards[pid] = makeCard();
      }

      tx.update(roomRef, {
        [`players.${playerId}.score`]: newScore,
        cards: newCards,
        status: "in_round",
        currentClaim: null,
        updatedAt: serverTimestamp(),
      });

      return;
    }

    // Ensure all required voters have voted for THIS cell
    const allVoted = voters.every((id) => votesForCurrent?.[id]);
    if (!allVoted) return;

    const yesCount = voters.filter((id) => votesForCurrent[id] === "yes").length;

    // Tie goes to approval:
    const accepted = yesCount >= voters.length / 2;

    const currentCellIndex = lineIndices[currentCellPosition];

    if (!accepted) {
      const claimantCard = room.cards[playerId];
      if (!claimantCard) return;

      const newMarks = [...claimantCard.marks];
      newMarks[currentCellIndex] = false;

      tx.update(roomRef, {
        [`cards.${playerId}.marks`]: newMarks,
        status: "in_round",
        currentClaim: null,
        updatedAt: serverTimestamp(),
      });

      return;
    }

    const isLastCell = currentCellPosition >= lineIndices.length - 1;

    if (!isLastCell) {
      tx.update(roomRef, {
        "currentClaim.currentCellPosition": currentCellPosition + 1,
        "currentClaim.votesForCurrent": {},
        updatedAt: serverTimestamp(),
      });

      return;
    }

    // Last cell accepted: award Bingo + reset
    const newScore = (room.players[playerId]?.score ?? 0) + 1;

    const newCards: Record<string, Card> = {};
    for (const pid of Object.keys(room.players)) {
      newCards[pid] = makeCard();
    }

    tx.update(roomRef, {
      [`players.${playerId}.score`]: newScore,
      cards: newCards,
      status: "in_round",
      currentClaim: null,
      updatedAt: serverTimestamp(),
    });
  });
}

