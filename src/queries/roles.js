import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notify } from "@utils/helpers";

export const useFetchRoles = () => {
    return useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            const response = await axios.get(`/roles`);
            return response.data || []; 
        },
    });
};

export const useFetchPermissions = () => {
    return useQuery({
        queryKey: ["permissions"],
        queryFn: async () => {
            const response = await axios.get(`/roles/permissions/all`);
            return response.data || []; 
        },
    });
};

export const useCreateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const response = await axios.post(`/roles`, payload);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            notify({ title: "Success", message: "Role created successfully", iconType: "success" });
        },
        onError: (err) => {
             notify({ title: "Error", message: "Failed to create role", iconType: "error" });
        }
    });
};

export const useUpdateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            // Some backends sync permissions directly in PUT, but based on routes provided we might need assign-permissions.
            // If the PUT route accepts the whole payload:
            const response = await axios.put(`/roles/${id}`, payload);
            
            // If explicit sync is required by backend later, we fire:
            if (payload.permissions) {
                await axios.post(`/roles/${id}/assign-permissions`, { permissions: payload.permissions });
            }
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            notify({ title: "Success", message: "Role updated successfully", iconType: "success" });
        },
        onError: (err) => {
            notify({ title: "Error", message: "Failed to update role", iconType: "error" });
        }
    });
};

export const useDeleteRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(`/roles/${id}`);
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["roles"] });
             notify({ title: "Success", message: "Role deleted completely", iconType: "success" });
        },
        onError: (err) => {
            notify({ title: "Error", message: "Failed to delete role", iconType: "error" });
        }
    });
};
