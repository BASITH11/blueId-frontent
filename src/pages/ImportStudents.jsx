import React, { useState } from "react";
import { 
    Box, 
    Text, 
    Paper, 
    Button, 
    Flex, 
    Stack, 
    Group, 
    Select, 
    FileInput, 
    TextInput,
    useMantineTheme,
    SimpleGrid,
    Divider,
    Tabs,
    ThemeIcon,
    Alert
} from "@mantine/core";
import { 
    IconFileUpload, 
    IconSchool, 
    IconPhotoUp, 
    IconInfoCircle,
    IconFileSpreadsheet,
    IconCloudUpload,
    IconDownload,
    IconCheck
} from "@tabler/icons-react";
import { useAuthStore } from "@config/authStore";
import { useFetchSchools } from "@queries/schools";
import { useImportStudents, useImportPhotos } from "@queries/students";
import { notify } from "@utils/helpers";
import { Link } from "@tanstack/react-router";

const ImportStudents = () => {
    const theme = useMantineTheme();
    const { user_type, school: userSchool } = useAuthStore();
    const isAdmin = user_type === "admin";

    // Form State
    const [selectedSchool, setSelectedSchool] = useState(isAdmin ? null : userSchool?.id?.toString());
    const [excelFile, setExcelFile] = useState(null);
    const [zipFile, setZipFile] = useState(null);

    // Queries & Mutations
    const { data: schools = [] } = useFetchSchools({ enabled: isAdmin });
    const importStudentsMutation = useImportStudents();
    const importPhotosMutation = useImportPhotos();

    const THEME_PRIMARY = theme.colors.sage[5];
    const THEME_DARK = theme.colors.sage[9];
    const THEME_LIGHT = theme.colors.sage[2];

    const handleImportExcel = () => {
        if (!selectedSchool || !excelFile) {
            notify({ title: "Required", message: "Please select school and file", iconType: "error" });
            return;
        }

        const formData = new FormData();
        formData.append("school_id", selectedSchool);
        formData.append("file", excelFile);

        importStudentsMutation.mutate(formData, {
            onSuccess: () => setExcelFile(null)
        });
    };

    const handleImportPhotos = () => {
        if (!selectedSchool || !zipFile) {
            notify({ title: "Required", message: "Please select school and ZIP file", iconType: "error" });
            return;
        }

        const formData = new FormData();
        formData.append("school_id", selectedSchool);
        formData.append("file", zipFile);

        importPhotosMutation.mutate(formData, {
            onSuccess: () => setZipFile(null)
        });
    };

    return (
        <Box p="xl">
            <Stack gap="xl" mb={40}>
                <Flex align="center" justify="space-between">
                    <Box>
                        <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
                            Import Student Data
                        </Text>
                        <Text color="dimmed" size="sm">Bulk enroll students and synchronize profile photos via files.</Text>
                    </Box>
                    <Group>
                        <Button 
                            component={Link}
                            to="/export-template"
                            variant="light"
                            color="sage"
                            leftSection={<IconDownload size={18} />}
                            radius="md"
                        >
                            Get Template
                        </Button>
                    </Group>
                </Flex>

                <Paper p="xl" radius="lg" style={{ border: `1px solid ${THEME_LIGHT}44`, backgroundColor: "#ffffff", maxWidth: '900px' }}>
                    <Tabs variant="outline" defaultValue="excel" color="sage" styles={{
                        tab: { fontWeight: 600, fontSize: '13px' },
                        panel: { paddingTop: '24px' }
                    }}>
                        <Tabs.List mb="lg">
                            <Tabs.Tab value="excel" leftSection={<IconFileSpreadsheet size={16} />}>Enrollment Sheet</Tabs.Tab>
                            <Tabs.Tab value="photos" leftSection={<IconPhotoUp size={16} />}>Bulk Photos Upload</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="excel">
                            <Stack gap="xl">
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                                    <Stack gap="md">
                                        {isAdmin ? (
                                            <Select 
                                                label="Target Institution"
                                                placeholder="Choose school"
                                                data={schools.map(s => ({ value: s.id.toString(), label: s.school_name }))}
                                                value={selectedSchool}
                                                onChange={setSelectedSchool}
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

                                        <FileInput 
                                            label="Excel File"
                                            placeholder="Upload .xlsx or .csv"
                                            value={excelFile}
                                            onChange={setExcelFile}
                                            leftSection={<IconFileUpload size={16} color={THEME_PRIMARY} />}
                                            accept=".xlsx,.xls,.csv"
                                            required
                                            size="md"
                                            styles={{ input: { cursor: 'pointer' } }}
                                        />
                                        
                                        <Button 
                                            onClick={handleImportExcel}
                                            leftSection={<IconCloudUpload size={18} />}
                                            style={{ backgroundColor: THEME_PRIMARY }}
                                            radius="md"
                                            size="md"
                                            loading={importStudentsMutation.isPending}
                                            disabled={!selectedSchool || !excelFile}
                                            fullWidth
                                        >
                                            Process Enrollment
                                        </Button>
                                    </Stack>

                                    <Stack gap="sm">
                                        <Text fw={700} size="sm" color={THEME_DARK}>Quick Guide</Text>
                                        <Paper p="md" radius="md" withBorder style={{ backgroundColor: "#fcfdfa" }}>
                                            <Stack gap="xs">
                                                <Group gap="xs">
                                                    <ThemeIcon size={18} radius="xl" color="sage" variant="light">
                                                        <IconCheck size={12} />
                                                    </ThemeIcon>
                                                    <Text size="xs">Use the exported school template.</Text>
                                                </Group>
                                                <Group gap="xs">
                                                    <ThemeIcon size={18} radius="xl" color="sage" variant="light">
                                                        <IconCheck size={12} />
                                                    </ThemeIcon>
                                                    <Text size="xs">Mandatory fields must be filled.</Text>
                                                </Group>
                                                <Group gap="xs">
                                                    <ThemeIcon size={18} radius="xl" color="sage" variant="light">
                                                        <IconCheck size={12} />
                                                    </ThemeIcon>
                                                    <Text size="xs">Maximum file size: 10MB.</Text>
                                                </Group>
                                            </Stack>
                                        </Paper>
                                        <Alert variant="light" color="blue" icon={<IconInfoCircle size={16} />}>
                                            <Text size="xs">Import runs in the background. Check Directory for results.</Text>
                                        </Alert>
                                    </Stack>
                                </SimpleGrid>
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="photos">
                            <Stack gap="xl">
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                                    <Stack gap="md">
                                        {isAdmin ? (
                                            <Select 
                                                label="Target Institution"
                                                placeholder="Choose school"
                                                data={schools.map(s => ({ value: s.id.toString(), label: s.school_name }))}
                                                value={selectedSchool}
                                                onChange={setSelectedSchool}
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

                                        <FileInput 
                                            label="Photo ZIP Archive"
                                            placeholder="Upload .zip file"
                                            value={zipFile}
                                            onChange={setZipFile}
                                            leftSection={<IconPhotoUp size={16} color={THEME_PRIMARY} />}
                                            accept=".zip"
                                            required
                                            size="md"
                                            styles={{ input: { cursor: 'pointer' } }}
                                        />

                                        <Button 
                                            onClick={handleImportPhotos}
                                            leftSection={<IconCloudUpload size={18} />}
                                            style={{ backgroundColor: THEME_PRIMARY }}
                                            radius="md"
                                            size="md"
                                            loading={importPhotosMutation.isPending}
                                            disabled={!selectedSchool || !zipFile}
                                            fullWidth
                                        >
                                            Upload Photos
                                        </Button>
                                    </Stack>

                                    <Stack gap="sm">
                                        <Text fw={700} size="sm" color={THEME_DARK}>Requirements</Text>
                                        <Paper p="md" radius="md" withBorder style={{ backgroundColor: "#fcfdfa" }}>
                                            <Text size="xs" color="dimmed" lh={1.6}>
                                                Filenames inside the ZIP must match the <b>photo</b> column in your enrollment sheet.
                                                <br /><br />
                                                Format: <b>name_admission.jpg</b>
                                            </Text>
                                        </Paper>
                                        <Alert variant="light" color="sage" icon={<IconInfoCircle size={16} />}>
                                            <Text size="xs">Supported formats: .jpg, .jpeg, .png</Text>
                                        </Alert>
                                    </Stack>
                                </SimpleGrid>
                            </Stack>
                        </Tabs.Panel>
                    </Tabs>
                </Paper>
            </Stack>
        </Box>
    );
};

export default ImportStudents;
