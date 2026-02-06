import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  isMobileView: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  checkScreenSize: () => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isMobileView: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  checkScreenSize: () =>
    set({ isMobileView: window.innerWidth < 768 }),
}));

export default useSidebarStore;