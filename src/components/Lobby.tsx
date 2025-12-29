// src/components/Lobby.tsx
import type { Room } from "../types";
import { setRoomStatus } from "../hooks/useRoom";

interface LobbyProps {
  room: Room;
  isHost: boolean;
}

export function Lobby({ room, isHost }: LobbyProps) {
  const { code, players } = room;

  const orderedPlayers = Object.values(players).sort((a, b) => {
    const aj = a.joinedAt ?? 0;
    const bj = b.joinedAt ?? 0;
    if (aj !== bj) return aj - bj;
    return a.name.localeCompare(b.name);
  });

  const handleStart = async () => {
    try {
      await setRoomStatus(code, "in_round");
    } catch (e) {
      console.error(e);
      alert("Failed to start round");
    }
  };

  return (
    <div>
      <h1>Room Code: {code}</h1>
      <h2>Lobby</h2>
      <p>Share this code with others to join.</p>

      <h3>Players</h3>
      <ul>
        {orderedPlayers.map((p) => (
          <li key={p.id}>
            {p.name} {p.id === room.hostId && "(Host)"} – Score: {p.score}
          </li>
        ))}
      </ul>

      {isHost ? (
        <button
		  onClick={handleStart}
		  style={{
			backgroundColor: "#6f9166",
			color: "#f9fafb",
			border: "none",
			borderRadius: 6,
			padding: "6px 12px",
			fontWeight: 600,
			cursor: "pointer",
		  }}
		>
		  Start Round
		</button>

      ) : (
        <p>Waiting for host to start…</p>
      )}
    </div>
  );
}
