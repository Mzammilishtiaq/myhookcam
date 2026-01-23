// store/authStore.ts
import { create } from 'zustand';
import { SetStorage, GetStorage, Logout, StorageI } from '@/Utlis/authServices';

interface AuthState {
  user: StorageI | null;
  login: (data: StorageI, remember?: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: GetStorage(), // initialize from storage

  login: (data: StorageI, remember = true) => {
    SetStorage(data, remember); // save to localStorage/sessionStorage
    set({ user: data });
  },

  logout: () => {
    Logout(); // clears storage
    set({ user: null });
  },
}));
