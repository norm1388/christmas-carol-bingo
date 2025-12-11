// src/components/Scoreboard.tsx
import type { Room } from "../types";

interface ScoreboardProps {
  room: Room;
}

export function Scoreboard({ room }: ScoreboardProps) {
  const players = Object.values(room.players).sort(
    (a, b) => b.score - a.score
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <h2>Scores</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name}: {p.score}
          </li>
        ))}
      </ul>
    </div>
  );
}
