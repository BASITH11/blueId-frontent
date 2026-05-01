import { createFileRoute } from "@tanstack/react-router";
import Login from "@components/layout/AuthLayout";

export const Route = createFileRoute("/login")({
    component: Login,
});
