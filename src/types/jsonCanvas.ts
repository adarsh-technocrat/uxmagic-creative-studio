/**
 * JSON Canvas Spec (https://jsoncanvas.org/spec/1.0/) compatible types.
 * Extended with a "creative" node type for ad creatives/frames.
 */

export interface JsonCanvasNodeBase {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface CreativeNode extends JsonCanvasNodeBase {
  type: "creative";
  sizeLabel?: string;
  asset?: string;
  variantId?: string;
}

export interface Variant {
  id: string;
  copy: string;
}

export type JsonCanvasNode = CreativeNode;

export interface JsonCanvasDocument {
  nodes: JsonCanvasNode[];
  edges: Array<{ id: string; fromNode: string; toNode: string }>;
}

export const STANDARD_AD_SIZES = [
  { width: 300, height: 250, label: "300×250" },
  { width: 200, height: 600, label: "200×600" },
  { width: 400, height: 400, label: "400×400" },
  { width: 1920, height: 1080, label: "1920×1080" },
] as const;

/** World units per pixel at zoom 1 for a view of height 2 world units */
export function worldUnitsFromPixels(
  pixelW: number,
  pixelH: number,
  viewHeightWorld = 2,
) {
  return {
    width: (pixelW / pixelH) * (viewHeightWorld / 2),
    height: viewHeightWorld / 2,
  };
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: number;
  /** Extracted @mentions for notifications */
  mentions: string[];
}
