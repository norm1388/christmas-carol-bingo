// src/components/GameScreen.tsx
import { useEffect, useRef } from "react";
import type { Room } from "../types";
import {
  toggleMark,
  callBingo,
  voteOnClaim,
  resolveClaim,
  setRoomStatus,
} from "../hooks/useRoom";
import { Board } from "./Board";
import { Scoreboard } from "./Scoreboard";

const CHRISTMAS_GREEN_DARK = "#064e3b";   // deep green
const CHRISTMAS_GREEN = "#16a34a";        // accept
const CHRISTMAS_RED = "#b91c1c";          // reject
const GOLD_ACCENT = "#fbbf24";            // border / accents

interface GameScreenProps {
  room: Room;
  playerId: string;
}

export function GameScreen({ room, playerId }: GameScreenProps) {
  const card = room.cards[playerId];
  // const isHost = room.hostId === playerId;
  const claim = room?.currentClaim;
  const code = room.code;
  const prevStatusRef = useRef(room.status);
  const claimPanelRef = useRef<HTMLDivElement | null>(null);


  // Safely derive claim-related info
  const totalCells = claim ? claim.lineIndices.length : 0;
  const currentCellNumber = claim ? claim.currentCellPosition + 1 : 0;
  const currentCellIndex =
    claim && claim.lineIndices
      ? claim.lineIndices[claim.currentCellPosition]
      : null;

  // Voting status (exclude claimant from voting)
  const voters = claim
    ? Object.values(room.players).filter((p) => p.id !== claim.playerId)
    : [];

  const votesForCurrent = claim?.votesForCurrent ?? {};

  // Count only votes from eligible voters
  const votedCount = claim
    ? voters.reduce((count, p) => count + (votesForCurrent[p.id] ? 1 : 0), 0)
    : 0;

  const totalVoters = claim ? voters.length : 0;

  // Ready when there are no voters (solo room) OR all voters have voted
  const allVoted = !!claim && (totalVoters === 0 || votedCount === totalVoters);

  // Auto-scroll to claim panel when a Bingo enters review
  useEffect(() => {
	  const prevStatus = prevStatusRef.current;

	  // Only scroll when we *enter* review mode from a different status
	  if (room.status === "review" && prevStatus !== "review" && claimPanelRef.current) {
		claimPanelRef.current.scrollIntoView({
		  behavior: "smooth",
		  block: "start",
		});
	  }

	  // Update previous status for the next run
	  prevStatusRef.current = room.status;
	}, [room.status]);

  // Auto-resolve a claime when all votes are received
  useEffect(() => {
    if (room.status !== "review") return;
    if (!claim) return;
    if (!allVoted) return;

    // Any client may resolve; backend is transactional/idempotent
    resolveClaim(code).catch(() => {
      // optional: log or ignore
    });
  }, [room.status, claim?.currentCellPosition, allVoted, code]);


  const handleToggleCell = async (index: number) => {
    if (room.status !== "in_round") return;
    await toggleMark(code, playerId, index);
  };

  const handleCallBingo = async () => {
    if (room.status !== "in_round") return;
    const result = await callBingo(code, playerId);
    if (result === "no-line") {
      alert("You do not have 5 in a row yet!");
    }
  };

  const handleVote = async (vote: "yes" | "no") => {
    if (!claim) return;
    if (claim.playerId === playerId) return; // caller doesn't vote
    await voteOnClaim(code, playerId, vote, claim.currentCellPosition);
  };

  const handleEndRound = async () => {
    await setRoomStatus(code, "lobby");
  };

  if (!card) {
    return <div>No card assigned yet.</div>;
  }

  const statusText =
    room.status === "in_round"
      ? "Song playing – tap images that match lyrics. You can tap one cell per each time a lyric is used"
      : room.status === "review"
      ? "Christmas Carol Bingo claimed – review in progress."
      : "Lobby";

  return (
    <div>
      <h1>Room Code: {room.code}</h1>
      <p>{statusText}</p>
      <Scoreboard room={room} />

      {/* Claim panel: always at the top when a Bingo is under review */}
      {claim && (
        <div
          ref={claimPanelRef}
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            backgroundColor: CHRISTMAS_GREEN_DARK,
            border: `2px solid ${GOLD_ACCENT}`,
            color: "#fefce8",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 4 }}>
            Christmas Carol Bingo called!
          </h2>
          <p style={{ marginTop: 0 }}>
            Claimed by{" "}
            {room.players[claim.playerId]
              ? room.players[claim.playerId].name
              : claim.playerId}
            . Voting on cell {currentCellNumber} of {totalCells}.
          </p>

          {/* Claimant's board (everyone sees this) */}
          <Board
            card={room.cards[claim.playerId]}
            onCellClick={() => {}}
            highlightLine={claim.lineIndices}
            highlightCurrentIndex={currentCellIndex}
            interactive={false}
          />

          {/* Voting buttons for non-claimants */}
          {claim.playerId !== playerId && (
            <div style={{ marginTop: 8 }}>
              <p style={{ marginBottom: 8 }}>
                Do you accept this cell as a valid match?
              </p>
              <button
                onClick={() => handleVote("yes")}
                style={{
                  backgroundColor: CHRISTMAS_GREEN,
                  color: "#f9fafb",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Accept
              </button>
              <button
                onClick={() => handleVote("no")}
                style={{
                  marginLeft: 8,
                  backgroundColor: CHRISTMAS_RED,
                  color: "#f9fafb",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reject
              </button>
            </div>
          )}

          {/* Voting status for everyone */}
          <div
            style={{
              marginTop: 12,
              padding: 8,
              border: "1px solid rgba(248, 250, 252, 0.25)",
              borderRadius: 6,
              backgroundColor: "rgba(15,23,42,0.6)",
            }}
          >
            <strong>Voting status:</strong>{" "}
            {totalVoters === 0
              ? "No other players to vote."
              : `${votedCount} / ${totalVoters} votes received`}
            {totalVoters > 0 && (
              <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                {voters.map((p) => {
                  const hasVoted = !!votesForCurrent[p.id];
                  return (
                    <li key={p.id}>
                      {p.name}:{" "}
                      <span
                        style={{ color: hasVoted ? "#bbf7d0" : "#e5e7eb" }}
                      >
                        {hasVoted ? "Voted" : "Waiting"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}


      {/* Your board (dimmed & locked during review) */}
      <div style={{ marginTop: 24, position: "relative" }}>
        <h2>Your Board</h2>
        <Board
          card={card}
          onCellClick={handleToggleCell}
          highlightLine={
            claim && claim.playerId === playerId ? claim.lineIndices : []
          }
          highlightCurrentIndex={
            claim && claim.playerId === playerId ? currentCellIndex : null
          }
          interactive={room.status === "in_round"}
        />
        <button
          onClick={handleCallBingo}
          disabled={room.status !== "in_round"}
          style={{ marginTop: 12,
		  backgroundColor: CHRISTMAS_GREEN}}
        >
          Call Christmas Carol Bingo!
        </button>

                {room.status === "review" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(15,23,42,0.9)", // dark  slate
                borderRadius: 10,
                border: `1px solid ${GOLD_ACCENT}`,
                padding: 12,
                maxWidth: 320,
                textAlign: "center",
                color: "#f9fafb",
              }}
            >
              <div style={{ marginBottom: 8, fontWeight: 700 }}>
                Bingo under review
              </div>
              <div style={{ marginBottom: 8, fontSize: 14 }}>
                A Christmas Carol Bingo has been called. Review the highlighted
                board above to vote.
              </div>
              <button
                type="button"
                onClick={() =>
                  claimPanelRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                style={{
                  marginTop: 4,
                  backgroundColor: CHRISTMAS_RED,
                  color: "#f9fafb",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Scroll to review
              </button>
            </div>
          </div>
        )}

      </div>

      <div style={{ marginTop: 16 }}>
        <p>
          Note: Use Discord/Zoom/etc. for voice chat and music. When someone
          calls Bingo, pause the song in your call, review the claim above, then
          resume.
        </p>
        <button onClick={handleEndRound} style={{ marginTop: 8 }}>
          End Round / Back to Lobby
        </button>
      </div>
    </div>
  );
}
