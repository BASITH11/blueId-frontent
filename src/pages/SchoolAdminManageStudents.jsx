import React, { useState, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { 
    Paper, 
    SimpleGrid, 
    ThemeIcon, 
    Badge, 
    Table, 
    Divider,
    Button,
    Box,
    Text,
    Flex,
    Center,
    Loader,
    Avatar,
    Stack,
    Group,
    ScrollArea,
    Drawer,
    TextInput,
    Select,
    ActionIcon,
    Menu,
    FileInput,
    Pagination,
    useMantineTheme,
    Skeleton
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import { notify } from "../utils/helpers";
import { 
    IconEdit, 
    IconTrash, 
    IconDots,
    IconSearch,
    IconUser,
    IconFolders,
    IconUpload,
    IconUserPlus,
    IconInfoCircle,
    IconCalendarTime
} from "@tabler/icons-react";
import { 
    useFetchMyStudents,
    useCreateMyStudent,
    useUpdateMyStudent,
    useDeleteMyStudent,
    useFetchMySchoolBatches,
    useFetchAllocatedFields
} from "../queries/schoolAdmin";
import api from "../api";

// Dynamically construct the storage URL from the API base URL
const STORAGE_URL = api.defaults.baseURL.replace("/api/", "/storage/");

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

const SchoolAdminManageStudents = () => {
    const theme = useMantineTheme();
    const { add } = useSearch({ from: '/manage-students' });
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [viewDrawerOpened, setViewDrawerOpened] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedStudentForView, setSelectedStudentForView] = useState(null);
    
    // Filtering States
    const [filters, setFilters] = useState({
        batch_id: null,
        session: null,
        search: "",
        page: 1
    });

    // Queries
    const { data: studentsData, isLoading: studentsLoading } = useFetchMyStudents(filters);
    const { data: batches = [] } = useFetchMySchoolBatches();
    const { data: allocatedFields = [], isLoading: fieldsLoading } = useFetchAllocatedFields();

    const isFieldAllocated = (fieldName) => allocatedFields.some(f => f.field_name === fieldName);
    const showSessionFilter = isFieldAllocated('session');

    // Mutations
    const createMutation = useCreateMyStudent();
    const updateMutation = useUpdateMyStudent();
    const deleteMutation = useDeleteMyStudent();

    const studentsList = Array.isArray(studentsData) ? studentsData : (studentsData?.data || studentsData?.students || []);
    const totalPages = studentsData?.last_page || studentsData?.pagination?.last_page || 1;

    const form = useForm({
        initialValues: {
            student_name: "",
            batch_id: "",
            admission_no: "",
            dob: "",
            father_name: "",
            mother_name: "",
            class: "",
            section: "",
            roll_no: "",
            session: "",
            photo: null,
        },
        validate: {
            student_name: (value) => (value.length < 2 ? "Name too short" : null),
            batch_id: (value) => (!value ? "Batch is required" : null),
        },
    });

    // Helper to extract correct photo URL
    const getImageUrl = (student) => {
        if (!student) return null;
        const photoPath = student.photo_url || student.photo || student.profile_photo;
        if (!photoPath) return null;
        if (photoPath.startsWith('http')) return photoPath;
        return `${STORAGE_URL}${photoPath}`;
    };

    // Update form when editingId changes
    useEffect(() => {
        if (editingId && studentsData) {
            const student = studentsList.find(s => s.id === editingId);
            if (student) {
                const values = {};
                Object.keys(form.values).forEach(key => {
                    if (key === 'photo') {
                        values[key] = null;
                    } else if (key === 'dob' && student[key]) {
                        values[key] = new Date(student[key]);
                    } else {
                        values[key] = student[key] || "";
                    }
                });
                form.setValues(values);
            }
        }
    }, [editingId, drawerOpened]);

    useEffect(() => {
        if (add) {
            handleOpenAdd();
        }
    }, [add]);

    const handleOpenAdd = () => {
        setEditingId(null);
        form.reset();
        setDrawerOpened(true);
    };

    const handleOpenEdit = (student) => {
        setEditingId(student.id);
        setDrawerOpened(true);
    };

    const handleOpenView = (student) => {
        setSelectedStudentForView(student);
        setViewDrawerOpened(true);
    };

    const handleClose = () => {
        setDrawerOpened(false);
        form.reset();
        setEditingId(null);
    };

    const handleSubmit = (values) => {
        const formData = new FormData();
        
        Object.keys(values).forEach(key => {
            let val = values[key];
            if (val instanceof Date) {
                val = dayjs(val).format('YYYY-MM-DD');
            }
            if (val !== null && val !== undefined) {
                formData.append(key, val);
            }
        });

        if (editingId) {
            formData.append('_method', 'PUT');
            updateMutation.mutate({ id: editingId, payload: formData }, { onSuccess: handleClose });
        } else {
            createMutation.mutate(formData, { onSuccess: handleClose });
        }
    };

    const THEME_PRIMARY = theme.colors.sage[5];
    const THEME_LIGHT = theme.colors.sage[2];
    const THEME_DARK = theme.colors.sage[9];

    return (
        <Box p="xl">
            {/* Header Section */}
            <Flex align="center" justify="space-between" mb={40}>
                <Box>
                    <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
                        Institution Registry
                    </Text>
                    <Text color="dimmed" size="sm">Manage student enrollment and institutional records.</Text>
                </Box>
                <Button 
                    onClick={handleOpenAdd}
                    leftSection={<IconUserPlus size={18} />}
                    style={{ backgroundColor: THEME_PRIMARY }}
                    radius="md"
                    size="md"
                >
                    Enroll Student
                </Button>
            </Flex>

            {/* Filters Section */}
            <Paper p="lg" radius="md" mb="xl" style={{ border: `1px solid ${THEME_LIGHT}44`, backgroundColor: "#fdfdfd" }}>
                <SimpleGrid cols={{ base: 1, sm: showSessionFilter ? 3 : 2 }} spacing="lg">
                    <Select 
                        label="Filter by Batch"
                        placeholder="All Batches"
                        data={batches.map(b => ({ value: b.id.toString(), label: b.name }))}
                        value={filters.batch_id}
                        onChange={(val) => setFilters({ ...filters, batch_id: val, page: 1 })}
                        leftSection={<IconFolders size={16} />}
                        clearable
                    />
                    {showSessionFilter && (
                        <Select 
                            label="Filter by Session"
                            placeholder="All Sessions"
                            data={generateSessions()}
                            value={filters.session}
                            onChange={(val) => setFilters({ ...filters, session: val, page: 1 })}
                            leftSection={<IconCalendarTime size={16} />}
                            clearable
                        />
                    )}
                    <TextInput 
                        label="Search Registry"
                        placeholder="Name or Admission No."
                        leftSection={<IconSearch size={16} />}
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.currentTarget.value, page: 1 })}
                    />
                </SimpleGrid>
            </Paper>

            {/* Students Table */}
            <Paper radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}22` }}>
                <ScrollArea>
                    <Table verticalSpacing="md" horizontalSpacing="xl">
                        <Table.Thead>
                            <Table.Tr style={{ backgroundColor: THEME_PRIMARY }}>
                                <Table.Th style={{ color: "white" }}>STUDENT</Table.Th>
                                <Table.Th style={{ color: "white" }}>ADMISSION NO</Table.Th>
                                <Table.Th style={{ color: "white" }}>BATCH</Table.Th>
                                <Table.Th style={{ color: "white" }}>SESSION</Table.Th>
                                <Table.Th style={{ color: "white" }} align="right">ACTIONS</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {studentsLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                        <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                        <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                        <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                        <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                    </Table.Tr>
                                ))
                            ) : studentsList.length === 0 ? (
                                <Table.Tr><Table.Td colSpan={5} align="center" color="dimmed" py="xl">No student records found.</Table.Td></Table.Tr>
                            ) : (
                                studentsList.map((student) => (
                                    <Table.Tr key={student.id}>
                                        <Table.Td>
                                            <Group gap="sm">
                                                <Avatar src={getImageUrl(student)} radius="xl" size="sm" color="sage">
                                                    {student.student_name.charAt(0)}
                                                </Avatar>
                                                <Text size="sm" fw={600} color={THEME_DARK}>{student.student_name}</Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="outline" color="sage" radius="xs" size="sm">
                                                {student.admission_no || "N/A"}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" color={THEME_DARK}>{student.batch?.name || "Unassigned"}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="light" color="sage" size="sm">{student.session || "—"}</Badge>
                                        </Table.Td>
                                        <Table.Td align="right">
                                            <Menu shadow="md" width={180} radius="md">
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="sage">
                                                        <IconDots size={18} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item leftSection={<IconInfoCircle size={14} />} onClick={() => handleOpenView(student)}>
                                                        View Details
                                                    </Menu.Item>
                                                    <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleOpenEdit(student)}>
                                                        Edit Record
                                                    </Menu.Item>
                                                    <Menu.Divider />
                                                    <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => deleteMutation.mutate(student.id)}>
                                                        Remove Student
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Paper>

            {/* Pagination */}
            <Flex justify="center" mt="xl">
                <Pagination 
                    total={totalPages} 
                    value={filters.page} 
                    onChange={(p) => setFilters({ ...filters, page: p })}
                    color="sage"
                    radius="md"
                />
            </Flex>

            {/* Form Drawer */}
            <Drawer
                opened={drawerOpened}
                onClose={handleClose}
                title={
                    <Group gap="sm">
                        <ThemeIcon style={{ backgroundColor: THEME_PRIMARY }} size="xl" radius="md">
                            <IconUserPlus size={24} />
                        </ThemeIcon>
                        <Box>
                            <Text fw={700} style={{ fontSize: "1.2rem", color: THEME_DARK }}>
                                {editingId ? "Modify Student Record" : "Institutional Enrollment"}
                            </Text>
                            <Text size="xs" color="dimmed">Complete student academic profile</Text>
                        </Box>
                    </Group>
                }
                position="right"
                size="md"
                padding="xl"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="lg">
                        <Center>
                            <Stack align="center" gap="xs">
                                <Avatar 
                                    src={form.values.photo 
                                        ? URL.createObjectURL(form.values.photo) 
                                        : getImageUrl(studentsList.find(s => s.id === editingId))
                                    } 
                                    size={120} 
                                    radius={120} 
                                    color="sage"
                                />
                                <FileInput 
                                    placeholder="Upload Photo" 
                                    size="xs"
                                    leftSection={<IconUpload size={14} />}
                                    {...form.getInputProps("photo")}
                                    accept="image/*"
                                />
                            </Stack>
                        </Center>

                        <TextInput label="Student Name" required {...form.getInputProps("student_name")} />
                        
                        <SimpleGrid cols={2}>
                            <Select 
                                label="Academic Batch" 
                                required
                                data={batches.map(b => ({ value: b.id.toString(), label: b.name }))}
                                {...form.getInputProps("batch_id")}
                            />
                            <Select 
                                label="Academic Session" 
                                required
                                data={generateSessions()}
                                {...form.getInputProps("session")}
                            />
                        </SimpleGrid>

                        <Divider label="Allocated Institutional Fields" labelPosition="center" color={`${THEME_LIGHT}44`} />

                        {allocatedFields.map(field => {
                            if (field.field_name === "dob") {
                                return (
                                    <DateInput 
                                        key={field.id}
                                        label={field.field_label}
                                        required={field.is_required}
                                        {...form.getInputProps(field.field_name)}
                                    />
                                );
                            }
                            return (
                                <TextInput 
                                    key={field.id}
                                    label={field.field_label}
                                    required={field.is_required}
                                    {...form.getInputProps(field.field_name)}
                                />
                            );
                        })}

                        <Flex justify="flex-end" gap="md" mt="xl">
                            <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
                            <Button 
                                type="submit" 
                                style={{ backgroundColor: THEME_PRIMARY }}
                                loading={createMutation.isPending || updateMutation.isPending}
                            >
                                {editingId ? "Save Changes" : "Confirm Enrollment"}
                            </Button>
                        </Flex>
                    </Stack>
                </form>
            </Drawer>

            {/* View Drawer */}
            <Drawer
                opened={viewDrawerOpened}
                onClose={() => setViewDrawerOpened(false)}
                title={<Text fw={700} size="lg" color={THEME_DARK}>Student Profile Overview</Text>}
                position="right"
                size="md"
                padding="xl"
            >
                {selectedStudentForView && (
                    <Stack gap="xl">
                        <Center py="md">
                            <Stack align="center" gap="sm">
                                <Avatar src={getImageUrl(selectedStudentForView)} size={120} radius={120} color="sage" />
                                <Box align="center">
                                    <Text fw={700} size="xl" color={THEME_DARK}>{selectedStudentForView.student_name}</Text>
                                    <Badge variant="outline" color="sage">{selectedStudentForView.admission_no}</Badge>
                                </Box>
                            </Stack>
                        </Center>

                        <SimpleGrid cols={2} spacing="lg">
                            {Object.entries(selectedStudentForView).map(([key, val]) => {
                                if (['id', 'school_id', 'batch_id', 'photo', 'photo_url', 'created_at', 'updated_at', 'school', 'batch', 'deleted_at'].includes(key)) return null;
                                return (
                                    <Box key={key}>
                                        <Text size="xs" color="dimmed" tt="uppercase" fw={700}>{key.replace('_', ' ')}</Text>
                                        <Text size="sm" fw={500} color={THEME_DARK}>{val || "—"}</Text>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                        
                        <Divider />
                        <Button variant="light" color="sage" fullWidth onClick={() => setViewDrawerOpened(false)}>Close View</Button>
                    </Stack>
                )}
            </Drawer>
        </Box>
    );
};

export default SchoolAdminManageStudents;
