import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            authToken: null,
            isAuthenticated: false,

            login: (user, authToken,entity) =>
                set(() => ({
                    user: user,
                    authToken: authToken,
                    isAuthenticated: true,
                    entity:entity,
                })),

            logout: () =>
                set(() => ({
                    user: null,
                    authToken: null,
                    isAuthenticated: false,
                    entity:null,
                })),
        }),
        {
            name: "authStore",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);


export const useSubscriptionStore = create((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
}));

