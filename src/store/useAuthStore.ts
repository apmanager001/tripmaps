import { create } from "zustand";
import { AuthStore, User } from "@/types";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (userData: User | null) =>
    set({
      user: userData,
      isAuthenticated: !!userData,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
