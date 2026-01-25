import { create } from "zustand";
import apiRequest from "./apiRequest";

export const useNotificationStore = create((set) => ({
  number: 0,
  fetch: async () => {
    try {
      const res = await apiRequest("/users/notification");
      set({ number: res.data });
    } catch(err) {
      console.error("Failed to fetch notifications:", err);
    }
  },

  // --- [YAHI HAI ASLI FIX] ---
  // Yeh function add karein
  increase: () => {
    set((prev) => ({ number: prev.number + 1 }));
  },
  // -------------------------

  decrease: () => {
    set((prev) => ({ number: prev.number - 1 }));
  },
  reset: () => {
    set({ number: 0 });
  },
}));