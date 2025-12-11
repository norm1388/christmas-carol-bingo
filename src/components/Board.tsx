// src/components/Board.tsx
import type { Card } from "../types";
import { IMAGE_ICONS } from "../imageIcons";

interface BoardProps {
  card: Card;
  onCellClick: (index: number) => void;
  highlightLine?: number[];            // optional, still supported if you want it later
  highlightCurrentIndex?: number | null; // NEW: index of the single cell to emphasize
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
          border: isCurrent ? "3px solid #f1b000" : "1px solid #888",
          borderRadius: 8,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: interactive ? "pointer" : "default",
          fontSize: 40,
          lineHeight: 1,
          padding: 4,
          userSelect: "none",
          boxShadow: isCurrent ? "0 0 8px rgba(241,176,0,0.7)" : "none",
        };

        // "Highlight" means: only the current cell gets the special color.
        // Other cells just use marked/unmarked colors, even if they are in the claimed line.
        const bgColor = isCurrent
          ? "#ffec99"
          : marked
          ? "#c8e6c9"
          : "#f5f5f5";

        return (
          <div
            key={index}
            style={{ ...baseStyle, backgroundColor: bgColor }}
            onClick={() => interactive && onCellClick(index)}
          >
            {IMAGE_ICONS[imageId] ?? imageId}
          </div>
        );
      })}
    </div>
  );
}
