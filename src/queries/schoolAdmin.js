import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notify } from "@utils/helpers";

/**
 * ==================== SCHOOL ADMIN QUERIES ====================
 */

export const useFetchMySchool = (enabled = true) => {
    return useQuery({
        queryKey: ["my-school"],
        enabled: !!enabled,
        queryFn: async () => {
            const response = await axios.get(`school-admin/school`);
            return response.data || {};
        }
    });
};

export const useFetchAllocatedFields = (enabled = true) => {
    return useQuery({
        queryKey: ["allocated-fields"],
        enabled: !!enabled,
        queryFn: async () => {
            const response = await axios.get(`school-admin/school/allocated-fields`);
            return response.data?.fields || [];
        }
    });
};

export const useFetchMySchoolStats = (enabled = true) => {
    return useQuery({
        queryKey: ["my-school-stats"],
        enabled: !!enabled,
        queryFn: async () => {
            const response = await axios.get(`school-admin/dashboard`);
            return response.data || {};
        }
    });
};

export const useUpdateMyProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            // Laravel method spoofing: FormData requires POST, _method tells Laravel to treat it as PUT
            if (payload instanceof FormData) {
                payload.append("_method", "PUT");
                return await axios.post(`school-admin/profile`, payload, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }
            return await axios.put(`school-admin/profile`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-school"] });
            notify({ title: "Success", message: "Profile updated successfully", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Profile update failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useUpdateMySchoolLogo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            return await axios.post(`school-admin/school/logo`, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-school"] });
            notify({ title: "Updated", message: "School logo changed", iconType: "success" });
        }
    });
};

export const useChangeMyPassword = () => {
    return useMutation({
        mutationFn: async (payload) => {
            return await axios.put(`school-admin/change-password`, payload);
        },
        onSuccess: () => {
            notify({ title: "Security", message: "Password updated successfully", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Failed to change password";
            notify({ title: "Security Error", message, iconType: "error" });
        }
    });
};

export const useFetchMySchoolBatches = (enabled = true) => {
    return useQuery({
        queryKey: ["my-school-batches"],
        enabled: !!enabled,
        queryFn: async () => {
            const response = await axios.get(`school-admin/batches`);
            return response.data?.batches || [];
        }
    });
};

/**
 * ==================== MY SCHOOL STUDENTS QUERIES ====================
 */

export const useFetchMyStudents = (params = {}) => {
    return useQuery({
        queryKey: ["my-students", params],
        queryFn: async () => {
            const response = await axios.get(`school-admin/students`, { params });
            return response.data || { students: [], pagination: {} };
        }
    });
};

export const useFetchMyStudent = (id) => {
    return useQuery({
        queryKey: ["my-student", id],
        enabled: !!id,
        queryFn: async () => {
            const response = await axios.get(`school-admin/students/${id}`);
            return response.data || {};
        }
    });
};

export const useCreateMyStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            // Let axios/browser handle Content-Type automatically for FormData
            return await axios.post(`school-admin/students`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-students"] });
            queryClient.invalidateQueries({ queryKey: ["my-school-stats"] });
            notify({ title: "Success", message: "Student enrolled successfully", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Enrollment failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useUpdateMyStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            // Laravel method spoofing for PUT with FormData
            if (payload instanceof FormData) {
                // Ensure _method is only added once
                if (!payload.has("_method")) {
                    payload.append("_method", "PUT");
                }
                return await axios.post(`school-admin/students/${id}`, payload);
            }
            return await axios.put(`school-admin/students/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-students"] });
            notify({ title: "Success", message: "Student record updated", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Update failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useDeleteMyStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            return await axios.delete(`school-admin/students/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-students"] });
            queryClient.invalidateQueries({ queryKey: ["my-school-stats"] });
            notify({ title: "Success", message: "Student record removed", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Deletion failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};

export const useUpdateMyStudentStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, is_active }) => {
            return await axios.put(`school-admin/students/${id}/status`, { is_active });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-students"] });
            notify({ title: "Status Updated", message: "Student status changed", iconType: "success" });
        }
    });
};

export const useBulkDeleteMyStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (studentIds) => {
            return await axios.post(`school-admin/students/bulk-delete`, { student_ids: studentIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-students"] });
            queryClient.invalidateQueries({ queryKey: ["my-school-stats"] });
            notify({ title: "Success", message: "Selected students removed", iconType: "success" });
        },
        onError: (err) => {
            const message = err.response?.data?.message || "Bulk deletion failed";
            notify({ title: "Error", message, iconType: "error" });
        }
    });
};
