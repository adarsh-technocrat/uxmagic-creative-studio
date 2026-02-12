import type { JsonCanvasDocument, Variant } from "./jsonCanvas";

export interface Workspace {
  id: string;
  name: string;
  campaignIds: string[];
  brandId?: string | null;
  createdAt: number;
}

export type CampaignStatus = "draft" | "active" | "completed";

export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  status: CampaignStatus;
  projectId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  campaignId: string | null;
  name: string;
  document: JsonCanvasDocument;
  variants: Variant[];
  brandId?: string | null;
  createdAt: number;
  updatedAt: number;
}
