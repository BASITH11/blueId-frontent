import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notify } from "@utils/helpers";

export const useFetchBatches = () => {
    return useQuery({
        queryKey: ["batches"],
        queryFn: async () => {
            const response = await axios.get(`/batches`);
            // The interceptor unwraps to {status, message, data}
            return response.data || []; 
        },
    });
};

export const useCreateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            return await axios.post(`/batches`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["batches"] });
            notify({ title: "Success", message: "Batch created successfully", iconType: "success" });
        },
        onError: (err) => {
             const message = err.response?.data?.message || "Failed to create batch";
             notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useUpdateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            return await axios.put(`/batches/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["batches"] });
            notify({ title: "Success", message: "Batch updated successfully", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Failed to update batch";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useDeleteBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(`/batches/${id}`);
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["batches"] });
             notify({ title: "Success", message: "Batch deleted successfully", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Failed to delete batch";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};
