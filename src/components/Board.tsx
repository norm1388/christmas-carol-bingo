// src/components/Board.tsx
import type { Card } from "../types";
import { getDisplayForId } from "../imageDeck";

interface BoardProps {
  card: Card;
  onCellClick: (index: number) => void;
  highlightLine?: number[];
  highlightCurrentIndex?: number | null;
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
          padding: 2,
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
          ? "#ffec99"
          : inLine
          ? "#fff9c4"
          : marked
          ? "#c8e6c9"
          : "#f5f5f5";

        const display = getDisplayForId(imageId);

        return (
          <div
            key={index}
            style={{ ...baseStyle, backgroundColor: bgColor }}
            onClick={() => interactive && onCellClick(index)}
          >
            {display.src ? (
              <img
                src={display.src}
                alt={display.label}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              display.label
            )}
          </div>
        );
      })}
    </div>
  );
}
