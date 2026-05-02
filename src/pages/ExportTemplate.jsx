import React, { useState, useMemo } from "react";
import { 
    Box, 
    Text, 
    Paper, 
    Button, 
    Flex, 
    Stack, 
    Group, 
    Select, 
    TextInput, 
    useMantineTheme,
    SimpleGrid,
    Divider
} from "@mantine/core";
import { IconSchool, IconUsers, IconCalendar, IconDownload } from "@tabler/icons-react";
import { useAuthStore } from "@config/authStore";
import { useFetchSchools, useFetchSchoolBatches } from "@queries/schools";
import { useFetchStudentFormFields } from "@queries/students";
import { useFetchMySchoolBatches } from "@queries/schoolAdmin";
import axios from "axios";
import { notify } from "@utils/helpers";

/**
 * Generate a range of academic sessions similar to the Student Management screen
 */
const generateSessions = () => {
    const sessions = [];
    const currentYear = new Date().getFullYear();
    for (let i = -5; i < 5; i++) {
        const start = currentYear + i;
        const end = start + 1;
        sessions.push({ value: `${start}-${end}`, label: `${start}-${end}` });
    }
    return sessions;
};

const ExportTemplate = () => {
    const theme = useMantineTheme();
    const { user_type, school: userSchool } = useAuthStore();
    const isAdmin = user_type === "admin";

    // Form State
    const [selectedSchool, setSelectedSchool] = useState(isAdmin ? null : userSchool?.id?.toString());
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [session, setSession] = useState("");
    const [loading, setLoading] = useState(false);

    // Queries
    // 1. Schools List (Admin Only)
    const { data: schools = [] } = useFetchSchools({ enabled: isAdmin });
    
    // 2. Batches (Admin version fetches by ID, School Admin version fetches for 'my school')
    const adminBatchesQuery = useFetchSchoolBatches(selectedSchool && isAdmin ? selectedSchool : null);
    const schoolAdminBatchesQuery = useFetchMySchoolBatches();
    
    // Resolve which batches to show
    const batches = isAdmin ? (adminBatchesQuery.data || []) : (schoolAdminBatchesQuery.data || []);
    const batchesLoading = isAdmin ? adminBatchesQuery.isLoading : schoolAdminBatchesQuery.isLoading;
    
    // 3. Configuration fields for the selected school
    const { data: formConfig } = useFetchStudentFormFields(selectedSchool);

    const THEME_PRIMARY = theme.colors.sage[5];
    const THEME_DARK = theme.colors.sage[9];
    const THEME_LIGHT = theme.colors.sage[2];

    // Dynamic Visibility Logic: Only show session if it's an allocated field for this school
    const hasSessionField = useMemo(() => {
        return formConfig?.fields?.some(f => f.field_name === "session");
    }, [formConfig]);

    const handleExport = async () => {
        if (!selectedSchool || !selectedBatch) {
            notify({ title: "Error", message: "Institution and Batch are required", iconType: "error" });
            return;
        }

        setLoading(true);
        try {
            const params = {
                school_id: selectedSchool,
                batch_id: selectedBatch,
                session: hasSessionField ? (session || null) : null
            };

            const response = await axios.get("template", {
                params,
                responseType: "blob"
            });

            const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            
            const schoolName = isAdmin 
                ? (schools.find(s => s.id.toString() === selectedSchool)?.school_name || "school")
                : (userSchool?.school_name || "school");
                
            const batchName = batches.find(b => b.id.toString() === selectedBatch)?.name || "batch";
            const fileName = `template_${schoolName.toLowerCase().replace(/\s+/g, '_')}_${batchName.toLowerCase().replace(/\s+/g, '_')}.xlsx`;
            
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            notify({ title: "Success", message: "Template downloaded successfully", iconType: "success" });
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p="xl">
            <Stack gap="xl" mb={40}>
                <Flex align="center" justify="space-between">
                    <Box>
                        <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
                            Export Template
                        </Text>
                        <Text color="dimmed" size="sm">Generate pre-formatted Excel sheets for bulk student enrollment.</Text>
                    </Box>
                    <Group>
                        <Button 
                            onClick={handleExport}
                            leftSection={<IconDownload size={18} />}
                            style={{ backgroundColor: THEME_PRIMARY }}
                            radius="md"
                            size="md"
                            loading={loading}
                            disabled={!selectedSchool || !selectedBatch}
                        >
                            Download Excel
                        </Button>
                    </Group>
                </Flex>

                <Paper p="xl" radius="lg" style={{ border: `1px solid ${THEME_LIGHT}44`, backgroundColor: "#ffffff", maxWidth: '900px' }}>
                    <Stack gap="xl">
                        <Box>
                            <Text fw={700} color={THEME_DARK} size="lg" mb={4}>Configuration</Text>
                            <Text size="xs" color="dimmed">Select the parameters for your enrollment template.</Text>
                        </Box>
                        
                        <Divider color={`${THEME_LIGHT}22`} />

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                            {isAdmin ? (
                                <Select 
                                    label="Target Institution"
                                    placeholder="Choose school"
                                    data={schools.map(s => ({ value: s.id.toString(), label: s.school_name }))}
                                    value={selectedSchool}
                                    onChange={(val) => {
                                        setSelectedSchool(val);
                                        setSelectedBatch(null);
                                    }}
                                    leftSection={<IconSchool size={16} color={THEME_PRIMARY} />}
                                    required
                                    searchable
                                    size="md"
                                />
                            ) : (
                                <TextInput
                                    label="Institution"
                                    value={userSchool?.school_name || "N/A"}
                                    readOnly
                                    disabled
                                    leftSection={<IconSchool size={16} color={THEME_PRIMARY} />}
                                    size="md"
                                />
                            )}

                            <Select 
                                label="Target Batch"
                                placeholder="Select academic batch"
                                data={batches.map(b => ({ value: b.id.toString(), label: b.name }))}
                                value={selectedBatch}
                                onChange={setSelectedBatch}
                                disabled={batchesLoading}
                                leftSection={<IconUsers size={16} color={THEME_PRIMARY} />}
                                required
                                size="md"
                            />

                            {hasSessionField && (
                                <Select 
                                    label="Session"
                                    placeholder="Select academic session"
                                    data={generateSessions()}
                                    value={session}
                                    onChange={setSession}
                                    leftSection={<IconCalendar size={16} color={THEME_PRIMARY} />}
                                    size="md"
                                    clearable
                                />
                            )}
                        </SimpleGrid>

                        <Box p="md" radius="md" style={{ backgroundColor: "#f8faf7", borderLeft: `4px solid ${THEME_PRIMARY}` }}>
                            <Text size="xs" color="#384729" lh={1.6}>
                                <b>Note:</b> The generated file will include all mandatory data fields allocated to this institution. 
                                Use this file to import student data in the "Manage Students" section.
                            </Text>
                        </Box>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
};

export default ExportTemplate;
