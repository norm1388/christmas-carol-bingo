// src/App.tsx
import { useState } from "react";
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
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      alert("Please enter your name before creating a room.");
      return;
    }
    try {
      const code = await createRoomWithPlayer(playerId, trimmedName);
      setRoomCode(code);
    } catch (e) {
      console.error(e);
      alert("Failed to create room.");
    }
  };

	const handleJoinRoom = async () => {
	  const trimmedName = playerName.trim();
	  const trimmedCode = joiningCode.trim().toUpperCase();
	  if (!trimmedName) {
		alert("Please enter your name before joining a room.");
		return;
	  }
	  if (!trimmedCode) {
		alert("Please enter a room code.");
		return;
	  }

	  try {
		await joinRoomWithPlayer(trimmedCode, playerId, trimmedName);
		// We already know the code; joinRoomWithPlayer returns void
		setRoomCode(trimmedCode);
	  } catch (e) {
		console.error(e);
		alert("Failed to join room. Check the code and try again.");
	  }
	};


  // Shared background + card layout
  const renderShell = (content: React.ReactNode) => (
    <div
      style={{
        minHeight: "100vh",
        padding: 16,
        background:
          "radial-gradient(circle at top, #022c22 0%, #020617 45%, #111827 100%)",
        color: "#f9fafb",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          backgroundColor: "rgba(15,23,42,0.92)",
          borderRadius: 12,
          padding: 16,
          border: "1px solid rgba(148,163,184,0.6)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        }}
      >
        {content}
      </div>
    </div>
  );

  // Landing screen (no roomCode yet)
  if (!roomCode) {
    return renderShell(
      <>
        <h1 style={{ marginTop: 0, color: "#fefce8" }}>
          Christmas Carol Bingo
        </h1>
        <p style={{ marginBottom: 16 }}>
          Play a creative twist on Bingo with Christmas carols. Everyone listens
          to the same song and taps images on their card when the lyrics match
          (or almost match) what they see. When a Bingo is called, justify your
		  matches from the song, or risk being voted down by other players!
        </p>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            Your name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #4b5563",
              backgroundColor: "#020617",
              color: "#f9fafb",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          <button
            onClick={handleCreateRoom}
            style={{
              backgroundColor: "#16a34a", // Christmas green
              color: "#f9fafb",
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Create Room
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label>Join room code</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={joiningCode}
                onChange={(e) =>
                  setJoiningCode(e.target.value.toUpperCase())
                }
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #4b5563",
                  backgroundColor: "#020617",
                  color: "#f9fafb",
                  textTransform: "uppercase",
                  width: 120,
                }}
              />
              <button
                onClick={handleJoinRoom}
                style={{
                  backgroundColor: "#b91c1c", // Christmas red
                  color: "#f9fafb",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 16, fontSize: 13, color: "#e5e7eb" }}>
          Tip: Use Discord, Zoom, or a group call to share music and discuss
          each Bingo claim together.
        </p>
      </>
    );
  }

  // Room is loading
  if (loading && !room) {
    return renderShell(<p>Loading room...</p>);
  }

  // Error / missing room
  if (error || !room) {
    return renderShell(
      <>
        <p>Error: {error ?? "Room not found."}</p>
        <button onClick={() => setRoomCode(null)}>Back</button>
      </>
    );
  }

  const isHost = room.hostId === playerId;

  // Lobby or Game view
  return renderShell(
    room.status === "lobby" ? (
      <Lobby room={room} isHost={isHost} />
    ) : (
      <GameScreen room={room} playerId={playerId} />
    )
  );
}

export default App;
