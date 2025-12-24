// src/imageDeck.ts

// Main pool (normal squares)
const mainImageModules = import.meta.glob("./assets/christmas/*.{png,jpg,jpeg}", {
  eager: true,
});

// Center-only pool (reserved for index 12)
const centerImageModules = import.meta.glob("./assets/center/*.{png,jpg,jpeg}", {
  eager: true,
});

export interface ImageInfo {
  id: string;   // derived from filename, e.g. "bell" from "bell.png"
  src: string;  // actual URL that the browser can load
}

function buildImageInfos(modules: Record<string, unknown>): ImageInfo[] {
  return Object.entries(modules).map(([path, mod]) => {
    const src = (mod as { default: string }).default;
    const filename = path.split("/").pop() || "";
    const id = filename.replace(/\.(png|jpe?g)$/i, ""); // strip extension
    return { id, src };
  });
}

const MAIN_IMAGE_INFOS: ImageInfo[] = buildImageInfos(mainImageModules);
const CENTER_IMAGE_INFOS: ImageInfo[] = buildImageInfos(centerImageModules);

// Detect duplicate IDs across folders (same filename in both dirs)
const mainIds = new Set(MAIN_IMAGE_INFOS.map((i) => i.id));
const dupes = CENTER_IMAGE_INFOS.map((i) => i.id).filter((id) => mainIds.has(id));
if (dupes.length) {
  throw new Error(
    `Duplicate image IDs found in both /assets/christmas and /assets/center: ${[
      ...new Set(dupes),
    ].join(", ")}. Rename files so IDs are unique.`
  );
}

// All infos, so getDisplayForId can resolve both main + center images
const ALL_IMAGE_INFOS: ImageInfo[] = [...MAIN_IMAGE_INFOS, ...CENTER_IMAGE_INFOS];

// Just the IDs for generation
export const IMAGE_IDS: string[] = MAIN_IMAGE_INFOS.map((img) => img.id);
export const CENTER_IMAGE_IDS: string[] = CENTER_IMAGE_INFOS.map((img) => img.id);

// Helper: find the image for a given ID
export function getDisplayForId(id: string): { src?: string; label: string } {
  const img = ALL_IMAGE_INFOS.find((info) => info.id === id);
  if (!img) return { label: id };
  return { src: img.src, label: id };
}

const CENTER_INDEX = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Card generator: center comes from CENTER_IMAGE_IDS; other 24 from IMAGE_IDS
export function makeCard(opts?: { autoMarkCenter?: boolean }): { grid: string[]; marks: boolean[] } {
  if (CENTER_IMAGE_IDS.length < 1) {
    throw new Error("Need at least 1 image in src/assets/center to build a card center.");
  }
  if (IMAGE_IDS.length < 24) {
    throw new Error("Need at least 24 images in src/assets/christmas to fill non-center squares.");
  }

  const centerId = CENTER_IMAGE_IDS[Math.floor(Math.random() * CENTER_IMAGE_IDS.length)];

  // pick 24 unique from main pool
  const picks = shuffle(IMAGE_IDS).slice(0, 24);

  const grid = new Array<string>(25);
  let p = 0;
  for (let i = 0; i < 25; i++) {
    if (i === CENTER_INDEX) grid[i] = centerId;
    else grid[i] = picks[p++];
  }

  const marks = new Array(25).fill(false);
  if (opts?.autoMarkCenter) marks[CENTER_INDEX] = true;

  return { grid, marks };
}
