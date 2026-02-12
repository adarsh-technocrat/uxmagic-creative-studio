import { createSlice } from "@reduxjs/toolkit";
import type { Campaign, Project, Workspace } from "@/types/workspace";
import type { JsonCanvasDocument, Variant } from "@/types/jsonCanvas";

const emptyDocument: JsonCanvasDocument = { nodes: [], edges: [] };
const defaultVariants: Variant[] = [];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const now = Date.now();
const seedWorkspaceId = "ws-1";
const seedCampaignId = "camp-1";
const seedProjectId = "proj-1";
const seedDocument: JsonCanvasDocument = {
  nodes: [
    {
      id: "creative-1",
      type: "creative",
      x: 0,
      y: 0,
      width: 6,
      height: 5,
      sizeLabel: "300×250",
      variantId: "var-1",
    },
    {
      id: "creative-2",
      type: "creative",
      x: 8,
      y: 0,
      width: 2,
      height: 6,
      sizeLabel: "200×600",
      variantId: "var-1",
    },
    {
      id: "creative-3",
      type: "creative",
      x: 0,
      y: 7,
      width: 8,
      height: 4,
      sizeLabel: "400×400",
      variantId: "var-1",
    },
  ],
  edges: [],
};

const initialWorkspaces: Workspace[] = [
  {
    id: seedWorkspaceId,
    name: "Brand Alpha",
    campaignIds: [seedCampaignId],
    brandId: "brand-1",
    createdAt: now,
  },
  { id: "ws-2", name: "Brand Beta", campaignIds: [], createdAt: now },
];

const initialCampaigns: Campaign[] = [
  {
    id: seedCampaignId,
    workspaceId: seedWorkspaceId,
    name: "Summer 2025",
    status: "active",
    projectId: seedProjectId,
    createdAt: now,
    updatedAt: now,
  },
];

const initialProjects: Project[] = [
  {
    id: seedProjectId,
    campaignId: seedCampaignId,
    name: "Aluvo_Summer-Ads",
    document: seedDocument,
    variants: [{ id: "var-1", copy: "Summer sale – 20% off" }],
    brandId: "brand-1",
    createdAt: now,
    updatedAt: now,
  },
];

export interface WorkspacesState {
  workspaces: Workspace[];
  campaigns: Campaign[];
  projects: Project[];
}

const initialState: WorkspacesState = {
  workspaces: initialWorkspaces,
  campaigns: initialCampaigns,
  projects: initialProjects,
};

const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    addWorkspace(state, action: { payload: { name: string } }) {
      const id = createId("ws");
      state.workspaces.push({
        id,
        name: action.payload.name,
        campaignIds: [],
        createdAt: Date.now(),
      });
    },
    addCampaign(
      state,
      action: { payload: { workspaceId: string; name: string } },
    ) {
      const id = createId("camp");
      const { workspaceId, name } = action.payload;
      state.campaigns.push({
        id,
        workspaceId,
        name,
        status: "draft",
        projectId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const ws = state.workspaces.find((w) => w.id === workspaceId);
      if (ws) ws.campaignIds.push(id);
    },
    createProjectForCampaign(
      state,
      action: {
        payload: {
          campaignId: string;
          name: string;
          document?: JsonCanvasDocument;
          variants?: Variant[];
        };
      },
    ) {
      const id = createId("proj");
      const {
        campaignId,
        name,
        document = emptyDocument,
        variants = defaultVariants,
      } = action.payload;
      state.projects.push({
        id,
        campaignId,
        name,
        document,
        variants,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const camp = state.campaigns.find((c) => c.id === campaignId);
      if (camp) {
        camp.projectId = id;
        camp.updatedAt = Date.now();
      }
    },
    createStandaloneProject(
      state,
      action: {
        payload: {
          id?: string;
          name: string;
          document?: JsonCanvasDocument;
          variants?: Variant[];
        };
      },
    ) {
      const id = action.payload.id ?? createId("proj");
      const {
        name,
        document = emptyDocument,
        variants = defaultVariants,
      } = action.payload;
      state.projects.push({
        id,
        campaignId: null,
        name,
        document,
        variants,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },
    updateProject(
      state,
      action: {
        payload: {
          id: string;
          name?: string;
          document?: JsonCanvasDocument;
          variants?: Variant[];
        };
      },
    ) {
      const proj = state.projects.find((p) => p.id === action.payload.id);
      if (proj) {
        if (action.payload.name !== undefined) proj.name = action.payload.name;
        if (action.payload.document !== undefined)
          proj.document = action.payload.document;
        if (action.payload.variants !== undefined)
          proj.variants = action.payload.variants;
        proj.updatedAt = Date.now();
      }
    },
    setCampaignStatus(
      state,
      action: { payload: { id: string; status: Campaign["status"] } },
    ) {
      const camp = state.campaigns.find((c) => c.id === action.payload.id);
      if (camp) {
        camp.status = action.payload.status;
        camp.updatedAt = Date.now();
      }
    },
  },
});

export const {
  addWorkspace,
  addCampaign,
  createProjectForCampaign,
  createStandaloneProject,
  updateProject,
  setCampaignStatus,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
