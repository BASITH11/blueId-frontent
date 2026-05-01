import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@config/authStore";
import { validateUser, invalidateGuard } from "@utils/authGuard";
import { notify } from "@utils/helpers";
import { Navigate } from "@tanstack/react-router";

export const useLogin = (email, password) => {
    return useMutation({

        mutationFn: async () =>
            await axios.post("login", {
                email: email,
                password: password,
            }),
        onSuccess: (data) => {
            const user = data.data.user;
           
            // const validated = validateUser(user);

            // if (validated !== true) {
            //     invalidateGuard();

            //     notify({
            //         title: "Unauthorized",
            //         message: validated,
            //     });

            //     return false;
            // }

            useAuthStore.setState((state) => ({
                authToken: data.data.access_token,
                user: data.data.user,
                school: data.data.school,
                permissions: data.data.permissions,
                user_type: data.data.user_type,
                role: data.data.role,
                isAuthenticated: true,
            }));
           
        },
        
    });
};

export const useLogout = () => {
    const logout = useAuthStore((state) => state.logout);

    return useMutation({
        mutationFn: async () => await axios.post("logout"),
        onSuccess: (data) => {
            logout();

            notify({
                title: "Success",
                message: data.message,
                iconType: "success",
            });
        },
    });
};
