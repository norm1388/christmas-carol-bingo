// src/components/Scoreboard.tsx
import type { Room } from "../types";

interface ScoreboardProps {
  room: Room;
}

export function Scoreboard({ room }: ScoreboardProps) {
  const players = Object.values(room.players).sort((a, b) => {
  const scoreDelta = b.score - a.score;
  if (scoreDelta !== 0) return scoreDelta;

  const aj = a.joinedAt ?? 0;
  const bj = b.joinedAt ?? 0;
  if (aj !== bj) return aj - bj;

  return a.name.localeCompare(b.name);
});

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
