import { createSlice } from "@reduxjs/toolkit";
import type {
  AIMessage,
  CreativeNode,
  JsonCanvasDocument,
  UploadedFile,
} from "@/types/jsonCanvas";

const defaultDocument: JsonCanvasDocument = {
  nodes: [
    {
      id: "creative-1",
      type: "creative",
      x: 0,
      y: 0,
      width: 6,
      height: 5,
      sizeLabel: "300×250",
    },
    {
      id: "creative-2",
      type: "creative",
      x: 8,
      y: 0,
      width: 2,
      height: 6,
      sizeLabel: "200×600",
    },
    {
      id: "creative-3",
      type: "creative",
      x: 0,
      y: 7,
      width: 8,
      height: 4,
      sizeLabel: "400×400",
    },
  ],
  edges: [],
};

export interface StudioState {
  document: JsonCanvasDocument;
  selectedNodeId: string | null;
  projectName: string;
  uploadedFiles: UploadedFile[];
  aiMessages: AIMessage[];
  zoomToFitTrigger: number;
}

const initialState: StudioState = {
  document: defaultDocument,
  selectedNodeId: null,
  projectName: "Aluvo_Summer-Ads",
  uploadedFiles: [],
  aiMessages: [],
  zoomToFitTrigger: 0,
};

const studioSlice = createSlice({
  name: "studio",
  initialState,
  reducers: {
    setDocument(state, action: { payload: JsonCanvasDocument }) {
      state.document = action.payload;
    },
    setSelectedNodeId(state, action: { payload: string | null }) {
      state.selectedNodeId = action.payload;
    },
    addCreative(
      state,
      action: {
        payload: {
          worldWidth: number;
          worldHeight: number;
          sizeLabel?: string;
        };
      },
    ) {
      const { worldWidth, worldHeight, sizeLabel } = action.payload;
      const count = state.document.nodes.length;
      const gap = 40;
      const col = count % 3;
      const row = Math.floor(count / 3);
      const node: CreativeNode = {
        id: `creative-${Date.now()}-${count}`,
        type: "creative",
        x: col * (worldWidth + gap),
        y: row * (worldHeight + gap),
        width: worldWidth,
        height: worldHeight,
        sizeLabel,
      };
      state.document.nodes.push(node);
    },
    updateNode(
      state,
      action: { payload: { id: string; patch: Partial<CreativeNode> } },
    ) {
      const { id, patch } = action.payload;
      const node = state.document.nodes.find((n) => n.id === id);
      if (node) Object.assign(node, patch);
    },
    setProjectName(state, action: { payload: string }) {
      state.projectName = action.payload;
    },
    addUploadedFiles(state, action: { payload: File[] }) {
      const files = action.payload.map((f) => ({
        id: `file-${Date.now()}-${f.name}`,
        name: f.name.length > 20 ? f.name.slice(0, 17) + "..." : f.name,
        type: f.type,
        size: f.size,
      }));
      state.uploadedFiles.push(...files);
    },
    clearUploads(state) {
      state.uploadedFiles = [];
    },
    sendAIMessage(state, action: { payload: string }) {
      const userMsg: AIMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: action.payload,
        createdAt: Date.now(),
      };
      state.aiMessages.push(userMsg);
    },
    addAIAssistantMessage(state, action: { payload: string }) {
      state.aiMessages.push({
        id: `msg-${Date.now()}-a`,
        role: "assistant",
        content: action.payload,
        createdAt: Date.now(),
      });
    },
    startNewProject(state) {
      state.document = { nodes: [], edges: [] };
      state.selectedNodeId = null;
      state.projectName = "Untitled Project";
      state.uploadedFiles = [];
      state.aiMessages = [];
    },
    triggerZoomToFit(state) {
      state.zoomToFitTrigger = Date.now();
    },
  },
});

export const {
  setDocument,
  setSelectedNodeId,
  addCreative,
  updateNode,
  setProjectName,
  addUploadedFiles,
  clearUploads,
  sendAIMessage,
  addAIAssistantMessage,
  startNewProject,
  triggerZoomToFit,
} = studioSlice.actions;

export default studioSlice.reducer;
