import { createFileRoute } from "@tanstack/react-router";
import ExportTemplate from "@pages/ExportTemplate";

export const Route = createFileRoute("/export-template")({
    component: ExportTemplate,
});
