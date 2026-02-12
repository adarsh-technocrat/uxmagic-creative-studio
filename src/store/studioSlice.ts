import { createSlice } from "@reduxjs/toolkit";
import type {
  AIMessage,
  Comment,
  CreativeNode,
  JsonCanvasDocument,
  UploadedFile,
  Variant,
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

export interface StudioState {
  document: JsonCanvasDocument;
  variants: Variant[];
  selectedNodeId: string | null;
  projectName: string;
  currentProjectId: string | null;
  uploadedFiles: UploadedFile[];
  aiMessages: AIMessage[];
  comments: Comment[];
  zoomToFitTrigger: number;
}

const initialVariants: Variant[] = [
  { id: "var-1", copy: "Summer sale – 20% off" },
];

const initialState: StudioState = {
  document: defaultDocument,
  variants: initialVariants,
  selectedNodeId: null,
  projectName: "Aluvo_Summer-Ads",
  currentProjectId: null,
  uploadedFiles: [],
  aiMessages: [],
  comments: [],
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
      let variantId: string | undefined;
      if (state.variants.length > 0) {
        variantId = state.variants[0].id;
      } else {
        const newVar: Variant = {
          id: `var-${Date.now()}`,
          copy: "",
        };
        state.variants.push(newVar);
        variantId = newVar.id;
      }
      const node: CreativeNode = {
        id: `creative-${Date.now()}-${count}`,
        type: "creative",
        x: col * (worldWidth + gap),
        y: row * (worldHeight + gap),
        width: worldWidth,
        height: worldHeight,
        sizeLabel,
        variantId,
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
      state.variants = [];
      state.selectedNodeId = null;
      state.projectName = "Untitled Project";
      state.currentProjectId = null;
      state.uploadedFiles = [];
      state.aiMessages = [];
      state.comments = [];
    },
    loadProject(
      state,
      action: {
        payload: {
          id: string;
          name: string;
          document: JsonCanvasDocument;
          variants?: Variant[];
        };
      },
    ) {
      state.currentProjectId = action.payload.id;
      state.projectName = action.payload.name;
      state.document = action.payload.document;
      state.variants = action.payload.variants ?? [];
      state.selectedNodeId = null;
      state.uploadedFiles = [];
      state.aiMessages = [];
      state.comments = [];
    },
    updateVariantCopy(
      state,
      action: { payload: { variantId: string; copy: string } },
    ) {
      const v = state.variants.find((x) => x.id === action.payload.variantId);
      if (v) v.copy = action.payload.copy;
    },
    addComment(
      state,
      action: { payload: { author: string; content: string } },
    ) {
      const mentions = (action.payload.content.match(/@\w+/g) ?? []).map((m) =>
        m.slice(1),
      );
      state.comments.push({
        id: `comment-${Date.now()}`,
        author: action.payload.author,
        content: action.payload.content,
        createdAt: Date.now(),
        mentions,
      });
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
  loadProject,
  updateVariantCopy,
  addComment,
  triggerZoomToFit,
} = studioSlice.actions;

export default studioSlice.reducer;
