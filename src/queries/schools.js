import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notify } from "@utils/helpers";

/**
 * ==================== SCHOOLS & AUTH ====================
 */

export const useRegisterSystemAdmin = () => {
    return useMutation({
        mutationFn: async (payload) => {
            // Updated to use admin/ prefix as per latest routes
            return await axios.post(`admin/register/admin`, payload);
        },
        onSuccess: (res) => {
            notify({ title: "Success", message: res.message || "Administrator registered successfully", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Registration failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useRegisterSchoolAdmin = () => {
    return useMutation({
        mutationFn: async (payload) => {
            // Updated to use admin/ prefix as per latest routes
            const response = await axios.post(`admin/register/school`, payload);
            return response;
        },
        onSuccess: (res) => {
            notify({ title: "Primary Registration Done", message: "Institution account created. Proceed to allocation.", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Institution registration failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

/**
 * ==================== BATCH ALLOCATION ====================
 */

export const useFetchAvailableBatches = (schoolId) => {
    return useQuery({
        queryKey: ["available-batches", schoolId],
        queryFn: async () => {
            // Updated to use admin/ prefix
            const response = await axios.get(`admin/schools/${schoolId}/available-batches`);
            return response.data?.batches || [];
        },
        enabled: !!schoolId
    });
};

export const useAssignSchoolBatches = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ schoolId, batchIds }) => {
            // Updated to use admin/ prefix
            return await axios.post(`admin/schools/${schoolId}/assign-batches`, { batch_ids: batchIds });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["school-batches", variables.schoolId] });
            notify({ title: "Success", message: "Batches allocated to institution", iconType: "success" });
        }
    });
};

/**
 * ==================== FIELD ALLOCATION ====================
 */

export const useFetchMasterFields = () => {
    return useQuery({
        queryKey: ["master-fields"],
        queryFn: async () => {
            // Updated to use admin/ prefix
            const response = await axios.get(`admin/master-fields`);
            return response.data || [];
        }
    });
};

export const useFetchSchoolAllocatedFields = (schoolId) => {
    return useQuery({
        queryKey: ["school-fields", schoolId],
        queryFn: async () => {
             // Updated to use admin/ prefix
            const response = await axios.get(`admin/schools/${schoolId}/allocated-fields`);
            return response.data?.fields || [];
        },
        enabled: !!schoolId
    });
};

export const useAllocateSchoolFields = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ schoolId, fields }) => {
             // Updated to use admin/ prefix
            return await axios.post(`admin/schools/${schoolId}/allocate-fields`, { fields });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["school-fields", variables.schoolId] });
            notify({ title: "Success", message: "Data fields configured for institution", iconType: "success" });
        }
    });
};

/**
 * ==================== SCHOOL MANAGEMENT ====================
 */

export const useFetchSchools = (options = {}) => {
    return useQuery({
        queryKey: ["schools"],
        queryFn: async () => {
            const response = await axios.get(`schools`);
            return response.data || [];
        },
        ...options
    });
};

export const useUpdateSchool = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            return await axios.post(`schools/${id}?_method=PUT`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schools"] });
            notify({ title: "Success", message: "Institution details updated", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Update failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useDeleteSchool = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            return await axios.delete(`schools/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schools"] });
            notify({ title: "Success", message: "School removed from directory", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Deletion restricted";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useUpdateSchoolStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, is_active }) => {
            return await axios.put(`schools/${id}/status`, { is_active });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schools"] });
            notify({ title: "Status Changed", message: "Visibility updated successfully", iconType: "success" });
        }
    });
};

export const useFetchSchoolBatches = (schoolId) => {
    return useQuery({
        queryKey: ["school-batches", schoolId],
        queryFn: async () => {
            const response = await axios.get(`admin/schools/${schoolId}/batches`);
            return response.data?.batches || [];
        },
        enabled: !!schoolId
    });
};
