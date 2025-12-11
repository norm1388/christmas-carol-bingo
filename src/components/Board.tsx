// src/components/Board.tsx
import type { Card } from "../types";
import { getDisplayForId } from "../imageDeck";

interface BoardProps {
  card: Card;
  onCellClick: (index: number) => void;
  highlightLine?: number[];               // all indices in the claimed line
  highlightCurrentIndex?: number | null;  // the *one* cell currently being judged
  interactive?: boolean;
}

export function Board({
  card,
  onCellClick,
  highlightLine = [],
  highlightCurrentIndex = null,
  interactive = true,
}: BoardProps) {
  const { grid, marks } = card;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 96px)",
        gridTemplateRows: "repeat(5, 96px)",
        gap: 6,
      }}
    >
      {grid.map((imageId, index) => {
        const marked = marks[index];
        const inLine = highlightLine.includes(index);
        const isCurrent = highlightCurrentIndex === index;

        const baseStyle: React.CSSProperties = {
          border: isCurrent
            ? "4px solid #d32f2f"
            : inLine
            ? "2px solid #f1b000"
            : "1px solid #888",
          borderRadius: 10,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: interactive ? "pointer" : "default",
          fontSize: 40,
          lineHeight: 1,
          padding: 4,
          userSelect: "none",
          boxShadow: isCurrent
            ? "0 0 10px rgba(211,47,47,0.9)"
            : inLine
            ? "0 0 4px rgba(241,176,0,0.6)"
            : "none",
          transform: isCurrent ? "scale(1.05)" : "scale(1)",
          transition: "all 0.15s ease-out",
        };

        const bgColor = isCurrent
          ? "#ffec99" // current cell
          : inLine
          ? "#fff9c4" // other cells in the claimed line
          : marked
          ? "#c8e6c9" // marked but not part of claim
          : "#f5f5f5"; // default

        const display = getDisplayForId(imageId);

        return (
          <div
            key={index}
            style={{ ...baseStyle, backgroundColor: bgColor }}
            onClick={() => interactive && onCellClick(index)}
          >
            {/* If we eventually have an image src, show that; else use emoji */}
            {display.src ? (
              <img
                src={display.src}
                alt={imageId}
                style={{ maxWidth: "80%", maxHeight: "80%" }}
              />
            ) : (
              display.emoji
            )}
          </div>
        );
      })}
    </div>
  );
}
