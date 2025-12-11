// src/imageDeck.ts

export interface ImageMeta {
  id: string;       // Stable ID used in cards
  label: string;    // Human-readable name (optional but nice to have)
  emoji: string;    // Fallback display
  filename?: string; // Optional: "bell.png" etc. when you add art
}

// Initial set (you can expand this list with your ~100 IDs later)
export const IMAGE_META: ImageMeta[] = [
  { id: "bell", label: "Bell", emoji: "🔔" },
  { id: "snowman", label: "Snowman", emoji: "⛄" },
  { id: "holly", label: "Holly", emoji: "🌿" },
  { id: "sleigh", label: "Sleigh", emoji: "🛷" },
  { id: "candy_cane", label: "Candy Cane", emoji: "🍬" },
  { id: "gingerbread", label: "Gingerbread", emoji: "🍪" },
  { id: "stocking", label: "Stocking", emoji: "🧦" },
  { id: "wreath", label: "Wreath", emoji: "🎀" },
  { id: "reindeer", label: "Reindeer", emoji: "🦌" },
  { id: "tree", label: "Christmas Tree", emoji: "🎄" },
  { id: "ornament", label: "Ornament", emoji: "🎊" },
  { id: "gift", label: "Gift", emoji: "🎁" },
  { id: "star", label: "Star", emoji: "⭐" },
  { id: "choir", label: "Choir", emoji: "🎤" },
  { id: "nativity", label: "Nativity", emoji: "✨" },
  { id: "candle", label: "Candle", emoji: "🕯️" },
  { id: "mistletoe", label: "Mistletoe", emoji: "💋" },
  { id: "angel", label: "Angel", emoji: "😇" },
  { id: "drum", label: "Drum", emoji: "🥁" },
  { id: "snowflake", label: "Snowflake", emoji: "❄️" },
  { id: "chimney", label: "Chimney", emoji: "🏠" },
  { id: "carolers", label: "Carolers", emoji: "🎶" },
  { id: "fireplace", label: "Fireplace", emoji: "🔥" },
  { id: "hot_cocoa", label: "Hot Cocoa", emoji: "☕" },
  { id: "nutcracker", label: "Nutcracker", emoji: "🤴" },
  // You can keep adding more ImageMeta entries here as you expand the deck
];

// Convenience: array of just the IDs, used for card generation
export const IMAGE_IDS: string[] = IMAGE_META.map((m) => m.id);

// Helper for rendering: returns emoji and optional image src
export function getDisplayForId(id: string): { emoji: string; src?: string } {
  const meta = IMAGE_META.find((m) => m.id === id);
  if (!meta) {
    return { emoji: id }; // fallback if unknown id is encountered
  }

  if (meta.filename) {
    // When you add art, you'll set filename, e.g. "bell.png"
    return { emoji: meta.emoji, src: `/images/${meta.filename}` };
  }

  return { emoji: meta.emoji };
}

// Card generator (unchanged behavior, now based on IMAGE_IDS)
export function makeCard(): { grid: string[]; marks: boolean[] } {
  const shuffled = [...IMAGE_IDS].sort(() => Math.random() - 0.5);
  const grid = shuffled.slice(0, 25);
  const marks = new Array(25).fill(false);
  return { grid, marks };
}
