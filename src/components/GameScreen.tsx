// src/components/GameScreen.tsx
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

interface GameScreenProps {
  room: Room;
  playerId: string;
}

export function GameScreen({ room, playerId }: GameScreenProps) {
  const card = room.cards[playerId];
  const isHost = room.hostId === playerId;
  const claim = room.currentClaim ?? null;
  const code = room.code;

  // Safely derive these; they’ll be 0 when there is no claim
  const totalCells = claim ? claim.lineIndices.length : 0;
  const currentCellNumber = claim ? claim.currentCellPosition + 1 : 0;
  const currentCellIndex =
  claim && claim.lineIndices
    ? claim.lineIndices[claim.currentCellPosition]
    : null;
	// voting status
	const voters = claim
	  ? Object.values(room.players).filter((p) => p.id !== claim.playerId)
	  : [];
	const votesForCurrent = claim ? claim.votesForCurrent : {};
	const votedPlayers = voters.filter((p) => votesForCurrent[p.id]);
	const waitingPlayers = voters.filter((p) => !votesForCurrent[p.id]);
	const totalVoters = voters.length;
	const votedCount = votedPlayers.length;
	const allVoted = totalVoters > 0 && votedCount === totalVoters;

  const handleToggleCell = async (index: number) => {
    if (room.status !== "in_round") return;
    await toggleMark(code, playerId, index);
  };

  const handleCallBingo = async () => {
    if (room.status !== "in_round") return;
    const result = await callBingo(code, playerId);
    if (result === "no-line") {
      alert("You do not have 5 in a row yet!");
    } else {
      // In your voice chat, you’d pause the song now.
    }
  };

  const handleVote = async (vote: "yes" | "no") => {
    if (!claim) return;
    if (claim.playerId === playerId) return; // caller doesn't vote
    await voteOnClaim(code, playerId, vote);
  };

  // Host can check if all votes are in and resolve
	const handleResolveIfReady = async () => {
	  if (!claim) return;
	  // allVoted is already computed above and used to disable the button
	  await resolveClaim(code);
	};

  const handleEndRound = async () => {
    // Optional: move back to lobby
    await setRoomStatus(code, "lobby");
  };

  if (!card) {
    return <div>No card assigned yet.</div>;
  }

  const statusText =
    room.status === "in_round"
      ? "Song playing – tap images that match lyrics."
      : room.status === "review"
      ? "Bingo claimed – review in progress."
      : "Lobby";

  return (
    <div>
      <h1>Room {room.code}</h1>
      <p>{statusText}</p>
      <Scoreboard room={room} />

      <div style={{ display: "flex", gap: 24 }}>
        <div>
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
            style={{ marginTop: 12 }}
          >
            Call Christmas Carol Bingo!
          </button>
        </div>

        {claim && (
		  <div>
			<h2>Current Claim</h2>
			<p>
			  Claimed by{" "}
			  {room.players[claim.playerId]
				? room.players[claim.playerId].name
				: claim.playerId}
			  . Voting on cell {currentCellNumber} of {totalCells}.
			</p>

			<Board
			  card={room.cards[claim.playerId]}
			  onCellClick={() => {}}
			  highlightLine={claim.lineIndices}
			  highlightCurrentIndex={currentCellIndex}
			  interactive={false}
			/>

			{/* Voting prompt for non-claimants */}
			{claim.playerId !== playerId && (
			  <div style={{ marginTop: 8 }}>
				<p>Do you accept this cell as a valid match?</p>
				<button onClick={() => handleVote("yes")}>Accept</button>
				<button onClick={() => handleVote("no")} style={{ marginLeft: 8 }}>
				  Reject
				</button>
			  </div>
			)}

			{/* Voting status visible to everyone (no one sees how others voted, only that they have) */}
			<div style={{ marginTop: 12, padding: 8, border: "1px solid #ccc", borderRadius: 6 }}>
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
						<span style={{ color: hasVoted ? "green" : "gray" }}>
						  {hasVoted ? "Voted" : "Waiting"}
						</span>
					  </li>
					);
				  })}
				</ul>
			  )}
			</div>

			{/* Host-only resolve button, disabled until all votes are in */}
			{isHost && (
			  <div style={{ marginTop: 8 }}>
				<button
				  onClick={handleResolveIfReady}
				  disabled={!allVoted}
				  style={{ opacity: allVoted ? 1 : 0.5 }}
				>
				  Resolve Claim{totalVoters > 0 ? ` (${votedCount}/${totalVoters} votes)` : ""}
				</button>
			  </div>
			)}
		  </div>
		)}
      </div>

      <div style={{ marginTop: 16 }}>
        <p>
          Note: Use Discord/Zoom/etc. for voice chat and music. When someone
          calls Bingo, pause the song in your call, review the claim here, then
          resume.
        </p>
        <button onClick={handleEndRound} style={{ marginTop: 8 }}>
          End Round / Back to Lobby
        </button>
      </div>
    </div>
  );
}
