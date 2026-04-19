import { create } from 'zustand';
import { produce } from 'immer';
import type { DeckState, AnyNode } from '../types/engine';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface SyncStore extends DeckState {
  chatHistory: ChatMessage[];
  nexusActive: boolean;
  userStyle: any;
  connections: {
    website?: string;
    twitter?: string;
    reddit?: { clientId: string; clientSecret: string };
  };
  leads: any[];
  activeTool: string | null;
  connect: () => void;
  applyManualEdit: (nodeId: string, changes: Record<string, any>) => void;
  setSelectedNode: (nodeId: string | null) => void;
  sendChatCommand: (text: string) => void;
  toggleNexus: () => void;
  setNexusState: (key: string, value: any) => void;
  setActiveTool: (toolId: string | null) => void;
}

export const useSyncEngine = create<SyncStore>((set, get) => ({
  slides: {
    'slide_1': { id: 'slide_1', type: 'SLIDE', name: 'Title Slide', width: 1920, height: 1080, rotation: 0, opacity: 1, locked: false, hidden: false, zIndex: 0, parentId: null, background: '#ffffff', transition: 'fade', duration: 300, children: ['image_1', 'text_1', 'shape_1', 'sheet_1'] }
  },
  nodes: {
    'image_1': { id: 'image_1', type: 'IMAGE', name: 'Background Image', x: 0, y: 0, width: 800, height: 450, rotation: 0, opacity: 1, locked: false, hidden: false, zIndex: 0, parentId: 'slide_1', imageProps: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', altText: 'Abstract Liquid', brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0 } },
    'text_1': { id: 'text_1', type: 'TEXT', name: 'Title', x: 100, y: 150, width: 600, height: 100, rotation: 0, opacity: 1, locked: false, hidden: false, zIndex: 2, parentId: 'slide_1', textProps: { text: 'AXIOM Presentation', fontFamily: 'Inter', fontSize: 64, fontWeight: 800, color: '#ffffff', textAlign: 'center', letterSpacing: 0, lineHeight: 1.2 } },
    'shape_1': { id: 'shape_1', type: 'SHAPE', name: 'Accent', x: 300, y: 250, width: 200, height: 10, rotation: 0, opacity: 1, locked: false, hidden: false, zIndex: 2, parentId: 'slide_1', shapeProps: { shapeType: 'rectangle', fillColor: '#7928CA', strokeColor: 'transparent', strokeWidth: 0, cornerRadius: 4 } },
    'sheet_1': { id: 'sheet_1', type: 'SPREADSHEET', name: 'Revenue Data', x: 50, y: 280, width: 300, height: 150, rotation: 0, opacity: 0.9, locked: false, hidden: false, zIndex: 3, parentId: 'slide_1', sheetProps: { rowCount: 4, colCount: 3, data: { 'cell_0': 'Q1', 'cell_1': 'Q2', 'cell_2': 'Q3', 'cell_3': '$12K', 'cell_4': '$18K', 'cell_5': '$24K', 'cell_6': '+15%', 'cell_7': '+22%', 'cell_8': '+30%' } } }
  },
  activeSlideId: 'slide_1',
  selectedNodeIds: [],
  chatHistory: [],
  nexusActive: false,
  userStyle: JSON.parse(localStorage.getItem('axiom_user_style') || 'null'),
  connections: JSON.parse(localStorage.getItem('axiom_connections') || '{}'),
  leads: [],
  activeTool: null,

  connect: () => {}, // Mocked for local engine mode

  applyManualEdit: (nodeId, changes) => {
    set(produce((draft: SyncStore) => {
      const node = draft.nodes[nodeId] as Record<string, any>;
      if (node) {
        const c = changes as Record<string, any>;
        Object.keys(c).forEach(key => {
          if (typeof c[key] === 'object' && c[key] !== null && !Array.isArray(c[key])) {
            node[key] = { ...node[key], ...c[key] };
          } else {
            node[key] = c[key];
          }
        });
      }
    }));
  },

  setSelectedNode: (nodeId) => set({ selectedNodeIds: nodeId ? [nodeId] : [] }),

  sendChatCommand: (text) => {
    set(produce((draft: SyncStore) => { draft.chatHistory.push({ id: Math.random().toString(), sender: 'user', text }); }));
  },

  toggleNexus: () => set((state) => ({ nexusActive: !state.nexusActive })),

  setActiveTool: (toolId) => set({ activeTool: toolId }),

  setNexusState: (key, value) => {
    set(produce((draft: SyncStore) => {
      (draft as any)[key] = value;
      if (key === 'userStyle' || key === 'connections') {
        localStorage.setItem(`axiom_${key === 'userStyle' ? 'user_style' : 'connections'}`, JSON.stringify(value));
      }
    }));
  }
}));
