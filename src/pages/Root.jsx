import { useNavigate, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MantineProvider } from "@mantine/core";
import { useEffect } from "react";
import { shouldRedirect } from "@utils/authGuard";
import { useAuthStore } from "@config/authStore";
import { Notifications } from "@mantine/notifications";
import { theme, colorSchemeManager, cssVariablesResolver } from "@config/theme";
import App from "@components/layout/App";
import AuthLayout from "../components/layout/AuthLayout";

const Root = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const navigate = useNavigate();
    const router = useRouter();
    const currentPath = router.state.location.pathname;
    

    useEffect(() => {
        const redirectPath = shouldRedirect(currentPath);

        if (redirectPath) {
            navigate({ to: redirectPath });
        }
    }, [isAuthenticated, currentPath]);

    return (
        <MantineProvider
            theme={theme}
            colorSchemeManager={colorSchemeManager}
            defaultColorScheme="light"
            cssVariablesResolver={cssVariablesResolver}
        >
            <Notifications position="top-center" />
            {isAuthenticated ? (<App />) : (<AuthLayout />)}
            {/* <TanStackRouterDevtools /> */}
        </MantineProvider>
    );
};

export default Root;
