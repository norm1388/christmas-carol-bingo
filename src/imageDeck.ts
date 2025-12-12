// src/imageDeck.ts

// Vite will replace this with a map of path -> module (each module has a default export = URL)
const imageModules = import.meta.glob("./assets/christmas/*.{png,jpg,jpeg}", {
  eager: true,
});

export interface ImageInfo {
  id: string;   // derived from filename, e.g. "bell" from "bell.png"
  src: string;  // actual URL that the browser can load
}

// Build an array of ImageInfo from all imported modules
const IMAGE_INFOS: ImageInfo[] = Object.entries(imageModules).map(
  ([path, mod]) => {
    // Vite image modules like this have a default export which is the URL
    const src = (mod as { default: string }).default;

    // path example: "./assets/christmas/bell.png"
    const filename = path.split("/").pop() || "";
    const id = filename.replace(/\.(png|jpe?g)$/i, ""); // strip extension

    return { id, src };
  }
);

// Just the IDs, used for card generation
export const IMAGE_IDS: string[] = IMAGE_INFOS.map((img) => img.id);

// Helper: find the image for a given ID
export function getDisplayForId(id: string): { src?: string; label: string } {
  const img = IMAGE_INFOS.find((info) => info.id === id);
  if (!img) {
    // Fallback: no image found (shouldn't happen if IDs come from IMAGE_IDS)
    return { label: id };
  }
  return { src: img.src, label: id };
}

// Card generator: chooses 25 unique IDs from the available images
export function makeCard(): { grid: string[]; marks: boolean[] } {
  if (IMAGE_IDS.length < 25) {
    throw new Error("Need at least 25 images to build a 5x5 card.");
  }

  const shuffled = [...IMAGE_IDS].sort(() => Math.random() - 0.5);
  const grid = shuffled.slice(0, 25);
  const marks = new Array(25).fill(false);
  return { grid, marks };
}
