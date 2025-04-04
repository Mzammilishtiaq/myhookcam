import { create } from 'zustand';

// Create a simple store for sidebar state
interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

// Create the store with zustand (a lightweight, no dependency state manager)
const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => {
    console.log("Zustand toggle called");
    set((state) => ({ isOpen: !state.isOpen }));
  },
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export default useSidebarStore;