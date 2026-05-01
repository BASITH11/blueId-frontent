import { Button } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import Test from "@pages/Test";

export const Route = createFileRoute("/test")({
    component: Test,
});
