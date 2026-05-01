import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { notify } from "@utils/helpers";

/**
 * ==================== STUDENT MANAGEMENT QUERIES ====================
 */

export const useFetchStudentFormFields = (schoolId) => {
    return useQuery({
        queryKey: ["student-form-fields", schoolId],
        queryFn: async () => {
            const response = await axios.get(`student-form-fields`, {
                params: { school_id: schoolId }
            });
            return response.data || {};
        },
        enabled: !!schoolId
    });
};

export const useFetchStudents = (filters) => {
    return useQuery({
        queryKey: ["students", filters],
        queryFn: async () => {
            const response = await axios.get(`students`, { params: filters });
            return response.data || { data: [], meta: {} };
        }
    });
};

export const useCreateStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            // Use Multipart/form-data for photo uploads
            return await axios.post(`add-students`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            notify({ title: "Success", message: "Student record created", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Failed to create student";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useUpdateStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            // Note: Laravel usually needs POST with _method=PUT or POST for files
            // The controller uses POST /students/{id} for update
            return await axios.post(`students/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            notify({ title: "Success", message: "Student record updated", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Update failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useDeleteStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            return await axios.delete(`students/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            notify({ title: "Success", message: "Student record removed", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Deletion failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};
