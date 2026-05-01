import { env } from "@utils/helpers";
import axios from "axios";
import { invalidateGuard } from "@utils/authGuard";
import { useAuthStore,useSubscriptionStore } from "@config/authStore";
import { notify } from "@utils/helpers";

axios.defaults.baseURL = env("API_BASE_URL", "http://127.0.0.1:8000/api/");
axios.defaults.headers.common["Accept"] = "application/json";


// Set up interceptors globally
axios.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().authToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.status == 401 || error.response?.status == 401) {
            invalidateGuard();
        }
        if (error.status === 423 ||  error.response?.status == 423) {
           useSubscriptionStore.getState().openDrawer();
        }

        notify({
            title: error.response?.data?.title,
            message: error.response?.data?.message || error.message,
        });

        throw new Error(error.response?.data?.message || error.message);
    }
);
