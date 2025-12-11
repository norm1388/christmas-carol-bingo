// src/imageDeck.ts
export const IMAGE_DECK: string[] = [
  "bell",
  "snowman",
  "holly",
  "sleigh",
  "candy_cane",
  "gingerbread",
  "stocking",
  "wreath",
  "reindeer",
  "tree",
  "ornament",
  "gift",
  "star",
  "choir",
  "nativity",
  "candle",
  "mistletoe",
  "angel",
  "drum",
  "snowflake",
  "chimney",
  "carolers",
  "fireplace",
  "hot_cocoa",
  "nutcracker",
];

export function makeCard(): { grid: string[]; marks: boolean[] } {
  const shuffled = [...IMAGE_DECK].sort(() => Math.random() - 0.5);
  const grid = shuffled.slice(0, 25);
  const marks = new Array(25).fill(false);
  return { grid, marks };
}
