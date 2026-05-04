import axios from "axios";
import { useQuery } from "@tanstack/react-query";

/**
 * Get profile details for the logged in user
 */
export const useFetchDashboardDetails = () => {
    return useQuery({
        queryKey: ["dashboardDetails"],
        queryFn: async () => {
            const response = await axios.get(`/profile`);
            return response.data;
        },
    });
};

/**
 * Get overall dashboard statistics for Super Admins
 * Endpoint: /api/admin/dashboard-stats
 */
export const useFetchAdminStats = (enabled = true) => {
    return useQuery({
        queryKey: ["adminStats"],
        queryFn: async () => {
            const response = await axios.get(`admin/dashboard-stats`);
            return response.data?.data || response.data;
        },
        enabled: enabled
    });
};
