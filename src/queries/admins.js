import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notify } from "@utils/helpers";

/**
 * ==================== ADMIN MANAGEMENT QUERIES ====================
 */

export const useFetchAdmins = () => {
    return useQuery({
        queryKey: ["admins"],
        queryFn: async () => {
            // singular 'admin/' prefix as per latest routes
            const response = await axios.get(`admin`);
            return response.data || [];
        }
    });
};

export const useFetchAdminStats = () => {
    return useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            // singular 'admin/stats/all' prefix
            const response = await axios.get(`admin/stats/all`);
            return response.data || {};
        }
    });
};

export const useUpdateAdmin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            // singular 'admin/{id}'
            return await axios.put(`admin/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admins"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            notify({ title: "Success", message: "Administrator account updated", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Update failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useDeleteAdmin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            // singular 'admin/{id}'
            return await axios.delete(`admin/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admins"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            notify({ title: "Success", message: "Administrator removed", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Deletion restricted";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useUpdateAdminStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }) => {
            // singular 'admin/{id}/status'
            return await axios.put(`admin/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admins"] });
            notify({ title: "Status Updated", message: "Account availability changed", iconType: "success" });
        }
    });
};

export const useSearchAdmins = () => {
    return useMutation({
        mutationFn: async (search) => {
            // singular 'admin/search'
            const response = await axios.post(`admin/search`, { search });
            return response.data || [];
        }
    });
};

export const useFetchAdminRoles = () => {
    return useQuery({
        queryKey: ["admin-roles-list"],
        queryFn: async () => {
            const response = await axios.get(`admin/roles/list`);
            return response.data || [];
        }
    });
};
