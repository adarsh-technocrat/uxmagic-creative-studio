import type { JsonCanvasDocument, Variant } from "./jsonCanvas";

export interface ProductionBrief {
  title?: string;
  strategy?: string;
  creativeDirection?: string;
  dataForVariations?: string;
  rawText?: string;
}

export interface CreativeBrief {
  name: string;
  strategy: string;
  creativeDirection: string;
  suggestedSizes: Array<{ width: number; height: number; label: string }>;
  attachments?: string[];
}

export interface BriefParseResult {
  productionBrief: ProductionBrief;
  spreadsheetRows?: Record<string, unknown>[];
}

export interface BriefPipelineResult {
  creativeBrief: CreativeBrief;
  document: JsonCanvasDocument;
  projectName: string;
  variants: Variant[];
}
