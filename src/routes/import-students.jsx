import { createFileRoute } from "@tanstack/react-router";
import ImportStudents from "@pages/ImportStudents";

export const Route = createFileRoute("/import-students")({
    component: ImportStudents,
});
