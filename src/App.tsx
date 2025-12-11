// src/App.tsx
import { useEffect, useState } from "react";
import {
  useRoom,
  createRoomWithPlayer,
  joinRoomWithPlayer,
  generatePlayerId,
} from "./hooks/useRoom";
import { Lobby } from "./components/Lobby";
import { GameScreen } from "./components/GameScreen";

function getStoredPlayerId(): string {
  const existing = localStorage.getItem("playerId");
  if (existing) return existing;
  const id = generatePlayerId();
  localStorage.setItem("playerId", id);
  return id;
}

function App() {
  const [playerId] = useState<string>(() => getStoredPlayerId());
  const [playerName, setPlayerName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joiningCode, setJoiningCode] = useState<string>("");

  const { room, loading, error } = useRoom(roomCode);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return alert("Enter your name first");
    try {
      const code = await createRoomWithPlayer(playerId, playerName.trim());
      setRoomCode(code);
    } catch (e) {
      console.error(e);
      alert("Failed to create room");
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) return alert("Enter your name first");
    if (!joiningCode.trim()) return alert("Enter a room code");
    try {
      await joinRoomWithPlayer(
        joiningCode.trim().toUpperCase(),
        playerId,
        playerName.trim()
      );
      setRoomCode(joiningCode.trim().toUpperCase());
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to join room");
    }
  };

  useEffect(() => {
    // optional: prefill name from localStorage
    const storedName = localStorage.getItem("playerName");
    if (storedName) setPlayerName(storedName);
  }, []);

  useEffect(() => {
    if (playerName) localStorage.setItem("playerName", playerName);
  }, [playerName]);

  if (!roomCode) {
    // Landing page: name + create/join
    return (
      <div style={{ padding: 16 }}>
        <h1>Christmas Carol Bingo</h1>
        <div style={{ marginBottom: 8 }}>
          <label>
            Your name:&nbsp;
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <button onClick={handleCreateRoom}>Create Room</button>
        </div>

        <div>
          <input
            placeholder="Room code"
            value={joiningCode}
            onChange={(e) => setJoiningCode(e.target.value.toUpperCase())}
            maxLength={4}
          />
          <button onClick={handleJoinRoom} style={{ marginLeft: 8 }}>
            Join Room
          </button>
        </div>
      </div>
    );
  }

  if (loading && !room) {
    return <div style={{ padding: 16 }}>Loading room...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <p>Error: {error}</p>
        <button onClick={() => setRoomCode(null)}>Back</button>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ padding: 16 }}>
        <p>Room not found.</p>
        <button onClick={() => setRoomCode(null)}>Back</button>
      </div>
    );
  }

  const isHost = room.hostId === playerId;

  return (
    <div style={{ padding: 16 }}>
      {room.status === "lobby" ? (
        <Lobby room={room} isHost={isHost} />
      ) : (
        <GameScreen room={room} playerId={playerId} />
      )}
    </div>
  );
}

export default App;
