import { create } from 'zustand';

interface RequestsState {
  activeRequest: Record<string, unknown> | null;
  setActiveRequest: (req: Record<string, unknown> | null) => void;
}

export const useRequestsStore = create<RequestsState>((set) => ({
  activeRequest: null,
  setActiveRequest: (req) => set({ activeRequest: req }),
}));
