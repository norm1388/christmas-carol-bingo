// src/components/Lobby.tsx
import type { Room } from "../types";
import { setRoomStatus } from "../hooks/useRoom";

interface LobbyProps {
  room: Room;
  isHost: boolean;
}

export function Lobby({ room, isHost }: LobbyProps) {
  const { code, players } = room;

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
      <h1>Room {code}</h1>
      <h2>Lobby</h2>
      <p>Share this code with others to join.</p>

      <h3>Players</h3>
      <ul>
        {Object.values(players).map((p) => (
          <li key={p.id}>
            {p.name} {p.id === room.hostId && "(Host)"} – Score: {p.score}
          </li>
        ))}
      </ul>

      {isHost ? (
        <button onClick={handleStart}>Start Round</button>
      ) : (
        <p>Waiting for host to start…</p>
      )}
    </div>
  );
}
