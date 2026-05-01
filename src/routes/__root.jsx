import { createRootRoute, redirect } from "@tanstack/react-router";
import { shouldRedirect } from "@utils/authGuard";
import Root from "@pages/Root";

export const Route = createRootRoute({
    component: Root,
    beforeLoad: ({ location }) => {
        const redirectPath = shouldRedirect(location.pathname);

        if (redirectPath) {
            throw new redirect({ to: redirectPath });
        }
    },
});
