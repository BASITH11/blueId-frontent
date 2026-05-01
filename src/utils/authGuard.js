import { useAuthStore } from "@config/authStore";

const skipAuthForPaths = ["/login"];

/**
 * Check if the user has to be redirected based on the authentication data and current path
 *
 * @param {*} currentPath
 * @returns false if should not be redirected, redirect path otherwise
 */
export const shouldRedirect = (currentPath) => {
    const { isAuthenticated, enable_sms } = useAuthStore.getState();

 
    if (!isAuthenticated && !skipAuthForPaths.includes(currentPath)) {
        return "/login";
    }

    if (isAuthenticated && skipAuthForPaths.includes(currentPath)) {
        return "/dashboard";
    }

       if (currentPath.startsWith("/smslog") && !enable_sms) {
        return "/no-access";
    }



    return false;
};

/**
 * Logout the user to invalidate the authentication guard
 */
export const invalidateGuard = () => useAuthStore.getState().logout();

/**
 * Check if the user has valid access to the website
 *
 * @param user user object
 * @returns bool true if valid user, string error message if not
 */
export const validateUser = (user) => {
    if (!user.is_admin) {
        return "You need to be an admin to login to this website";
    }

    if (!user.is_verified) {
        return "Please complete verification to access this website";
    }

    if (user.banned) {
        return "You are banned from accessing the website";
    }

    return true;
};
