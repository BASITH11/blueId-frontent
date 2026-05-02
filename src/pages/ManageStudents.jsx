import React, { useState, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import {
  Box,
  Text,
  Paper,
  Button,
  Flex,
  ActionIcon,
  Drawer,
  TextInput,
  Select,
  FileInput,
  Loader,
  Center,
  Group,
  Stack,
  SimpleGrid,
  Divider,
  Avatar,
  Badge,
  Menu,
  ThemeIcon,
  Modal,
  Pagination,
  Table,
  ScrollArea,
  useMantineTheme,
  Skeleton
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import { notify } from "../utils/helpers";
import { 
    IconPlus, 
    IconEdit, 
    IconTrash, 
    IconDots,
    IconSearch,
    IconFilter,
    IconUser,
    IconSchool,
    IconFolders,
    IconUpload,
    IconUserPlus,
    IconId,
    IconFileExport,
    IconArchive,
    IconCalendarTime
} from "@tabler/icons-react";
import { 
    useFetchStudents, 
    useCreateStudent, 
    useUpdateStudent, 
    useDeleteStudent,
    useFetchStudentFormFields
} from "../queries/students";
import { useFetchSchools } from "../queries/schools";
import axios from "axios"; 

import { env } from "../utils/helpers";

const STORAGE_URL = env("API_BASE_URL").replace("/api/", "/storage/");

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

const ManageStudents = () => {
  const theme = useMantineTheme();
  const { add } = useSearch({ from: '/manage-students' });
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [viewDrawerOpened, setViewDrawerOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const [filters, setFilters] = useState({
      school_id: null,
      batch_id: null,
      session: "",
      from_date: null,
      to_date: null,
      search: "",
      page: 1
  });

  const form = useForm({
    initialValues: {
        school_id: "",
        student_name: "",
        batch_id: "",
        photo: null,
    },
  });

  const { data: schoolList = [] } = useFetchSchools();
  const { data: studentsData, isLoading: studentsLoading } = useFetchStudents(filters);
  const { data: formConfig, isLoading: configLoading } = useFetchStudentFormFields(form.values.school_id);
  const { data: filterConfig } = useFetchStudentFormFields(filters.school_id);
  const { data: viewConfig } = useFetchStudentFormFields(selectedStudentForView?.school_id);
  
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  useEffect(() => {
    if (formConfig?.fields) {
        if (!editingId) {
            const initial = { ...form.values };
            formConfig.fields.forEach(field => {
                initial[field.field_name] = "";
            });
            form.setValues(initial);
        } else {
            const student = studentsData?.data?.find(s => s.id === editingId);
            if (student) {
                const values = { ...form.values };
                formConfig.fields.forEach(field => {
                    let val = student[field.field_name] || "";
                    if (field.field_name === "dob" && val) {
                        val = new Date(val);
                    }
                    values[field.field_name] = val;
                });
                form.setValues(values);
            }
        }
    }
  }, [formConfig, editingId]);

  useEffect(() => {
    if (add) {
        handleOpenAdd();
    }
  }, [add]);

  const handleOpenAdd = () => {
    setEditingId(null);
    form.reset();
    if (filters.school_id) {
        form.setFieldValue('school_id', filters.school_id);
    }
    setDrawerOpened(true);
  };

  const handleOpenEdit = (student) => {
    setEditingId(student.id);
    form.setValues({
        school_id: student.school_id.toString(),
        student_name: student.student_name,
        batch_id: student.batch_id?.toString(),
        photo: null,
        session: student.session || ""
    });
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
        updateMutation.mutate({ id: editingId, payload: formData }, { onSuccess: handleClose });
    } else {
        createMutation.mutate(formData, { onSuccess: handleClose });
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpened(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
        deleteMutation.mutate(studentToDelete.id, {
            onSuccess: () => setDeleteModalOpened(false)
        });
    }
  };

  const handleAuthenticatedDownload = async (type) => {
    try {
        setIsExporting(true);
        const queryParams = { ...filters };
        if (queryParams.from_date) queryParams.from_date = dayjs(queryParams.from_date).format('YYYY-MM-DD');
        if (queryParams.to_date) queryParams.to_date = dayjs(queryParams.to_date).format('YYYY-MM-DD');
        
        if (type === 'csv') queryParams.export = 1;
        if (type === 'zip') queryParams.export_zip = 1;

        const response = await axios.get('students', {
            params: queryParams,
            responseType: 'blob' 
        });

        const blobData = response.data || response;
        const url = window.URL.createObjectURL(new Blob([blobData]));
        const link = document.createElement('a');
        link.href = url;
        
        const filename = type === 'csv' 
            ? `students_export_${dayjs().format('YYYY-MM-DD')}.csv`
            : `student_photos_${dayjs().format('YYYY-MM-DD')}.zip`;
            
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        notify({ title: "Success", message: "Download started", iconType: "success" });
    } catch (err) {
        notify({ title: "Error", message: "Download failed.", iconType: "error" });
    } finally {
        setIsExporting(false);
    }
  };

  const THEME_PRIMARY = theme.colors.sage[5];
  const THEME_LIGHT = theme.colors.sage[2];
  const THEME_DARK = theme.colors.sage[9];

  return (
    <Box p="xl">
      <Stack gap="xl" mb={40}>
          <Flex align="center" justify="space-between">
            <Box>
                <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
                    Student Directory
                </Text>
                <Text color="dimmed" size="sm">Manage enrollment and academic profiles for all institutions.</Text>
            </Box>
            <Group>
                <Button 
                    variant="light"
                    color="sage"
                    onClick={() => handleAuthenticatedDownload('csv')}
                    leftSection={<IconFileExport size={18} />}
                    radius="md"
                    loading={isExporting}
                >
                    Export CSV
                </Button>
                <Button 
                    variant="light"
                    color="sage"
                    onClick={() => handleAuthenticatedDownload('zip')}
                    leftSection={<IconArchive size={18} />}
                    radius="md"
                    loading={isExporting}
                >
                    Export Photos (ZIP)
                </Button>
                <Button 
                    onClick={handleOpenAdd}
                    leftSection={<IconUserPlus size={18} />}
                    style={{ backgroundColor: THEME_PRIMARY }}
                    radius="md"
                    size="md"
                >
                    Enroll New Student
                </Button>
            </Group>
          </Flex>

          <Paper p="lg" radius="md" style={{ border: `1px solid ${THEME_LIGHT}44`, backgroundColor: "#fdfdfd" }}>
              <Stack gap="md">
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                      <Select 
                        label="Filter by Institution"
                        placeholder="All Schools"
                        data={schoolList.map(s => ({ value: s.id.toString(), label: s.school_name }))}
                        value={filters.school_id}
                        onChange={(val) => setFilters({ ...filters, school_id: val, page: 1, batch_id: null })}
                        leftSection={<IconSchool size={16} />}
                        clearable
                      />
                      <Select 
                        label="Academic Batch"
                        placeholder="All Batches"
                        data={formConfig?.batches?.map(b => ({ value: b.id.toString(), label: b.name })) || []}
                        value={filters.batch_id}
                        onChange={(val) => setFilters({ ...filters, batch_id: val, page: 1 })}
                        leftSection={<IconFolders size={16} />}
                        clearable
                        disabled={!filters.school_id}
                      />
                      {filterConfig?.fields?.some(f => f.field_name === "session") && (
                        <Select 
                          label="Student Session"
                          placeholder="All Sessions"
                          data={generateSessions()}
                          value={filters.session}
                          onChange={(val) => setFilters({ ...filters, session: val, page: 1 })}
                          leftSection={<IconCalendarTime size={16} />}
                          clearable
                        />
                      )}
                  </SimpleGrid>

                  <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="lg">
                      <DateInput 
                        label="From Date"
                        placeholder="Enrollment Start"
                        value={filters.from_date}
                        onChange={(val) => setFilters({ ...filters, from_date: val, page: 1 })}
                        clearable
                      />
                      <DateInput 
                        label="To Date"
                        placeholder="Enrollment End"
                        value={filters.to_date}
                        onChange={(val) => setFilters({ ...filters, to_date: val, page: 1 })}
                        clearable
                      />
                      <TextInput 
                        label="Search Student"
                        placeholder="Name or Admission No."
                        leftSection={<IconSearch size={16} />}
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.currentTarget.value, page: 1 })}
                      />
                      <Flex align="flex-end">
                        <Button 
                            variant="subtle" 
                            color="gray" 
                            onClick={() => setFilters({ school_id: null, batch_id: null, session: "", from_date: null, to_date: null, search: "", page: 1 })}
                            fullWidth
                        >
                            Reset Filters
                        </Button>
                      </Flex>
                  </SimpleGrid>
              </Stack>
          </Paper>
      </Stack>

      <Paper radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}22` }}>
          <ScrollArea>
              <Table verticalSpacing="md" horizontalSpacing="xl">
                  <Table.Thead>
                      <Table.Tr style={{ backgroundColor: THEME_PRIMARY }}>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>STUDENT</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>ADMISSION NO</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>INSTITUTION</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>BATCH</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }} align="right">ACTIONS</Table.Th>
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
                      ) : studentsData?.data?.length === 0 ? (
                          <Table.Tr><Table.Td colSpan={5} align="center" color="dimmed" py="xl">No student records found.</Table.Td></Table.Tr>
                      ) : (
                          studentsData?.data?.map((student) => (
                              <Table.Tr key={student.id}>
                                  <Table.Td>
                                      <Group gap="sm">
                                          <Avatar src={student.photo ? `${STORAGE_URL}${student.photo}` : null} radius="xl" size="sm" color="sage">
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
                                      <Text size="sm" color={THEME_DARK}>{student.school?.school_name}</Text>
                                  </Table.Td>
                                  <Table.Td>
                                      <Badge variant="light" color="sage" size="sm">{student.batch?.name}</Badge>
                                  </Table.Td>
                                  <Table.Td align="right">
                                    <Menu shadow="md" width={180} radius="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="sage">
                                                <IconDots size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Label>Management</Menu.Label>
                                            <Menu.Item leftSection={<IconUser size={14} />} onClick={() => handleOpenView(student)}>
                                                View Profile
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleOpenEdit(student)}>
                                                Modify Record
                                            </Menu.Item>
                                            <Menu.Divider />
                                            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDeleteClick(student)}>
                                                Delete Student
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

      <Flex justify="center" mt="xl">
          <Pagination 
            total={studentsData?.last_page || 1} 
            value={filters.page} 
            onChange={(p) => setFilters({ ...filters, page: p })}
            color="sage"
            radius="md"
          />
      </Flex>

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
                        {editingId ? "Update Student Profile" : "New Student Enrollment"}
                    </Text>
                    <Text size="xs" color="dimmed">
                        {editingId ? `Modifying record for ${form.values.student_name}` : "Enter background and academic details"}
                    </Text>
                </Box>
            </Group>
        }
        position="right"
        size="md"
        padding="xl"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
              <Divider label="Institutional Alignment" labelPosition="center" color={`${THEME_LIGHT}44`} />
              <Select 
                label="Select Institution"
                placeholder="Choose registration school"
                data={schoolList.map(s => ({ value: s.id.toString(), label: s.school_name }))}
                required
                {...form.getInputProps("school_id")}
                disabled={!!editingId}
                leftSection={<IconSchool size={16} />}
              />

              <Divider label="Basic Information" labelPosition="center" color={`${THEME_LIGHT}44`} />
              
              <Center>
                <Stack align="center" gap="xs">
                    <Avatar 
                        src={form.values.photo 
                            ? URL.createObjectURL(form.values.photo) 
                            : (editingId && studentsData?.data?.find(s => s.id === editingId)?.photo 
                                ? `${STORAGE_URL}${studentsData?.data?.find(s => s.id === editingId).photo}` 
                                : null)
                        } 
                        size={120} 
                        radius={120} 
                        color="sage"
                    />
                    <FileInput 
                        placeholder="Enrollment Photo" 
                        size="xs"
                        leftSection={<IconUpload size={14} />}
                        {...form.getInputProps("photo")}
                        accept="image/*"
                    />
                </Stack>
              </Center>

              <TextInput label="Student Full Name" required {...form.getInputProps("student_name")} />
              
              <Select 
                label="Assign to Batch" 
                required
                placeholder="Choose Academic Session"
                data={formConfig?.batches?.map(b => ({ value: b.id.toString(), label: b.name })) || []}
                {...form.getInputProps("batch_id")}
              />

              {formConfig?.fields?.some(f => f.field_name === "session") && (
                <Select 
                    label={formConfig.fields.find(f => f.field_name === "session").field_label}
                    placeholder="Pick Session"
                    data={generateSessions()}
                    required={formConfig.fields.find(f => f.field_name === "session").is_required}
                    {...form.getInputProps("session")}
                />
              )}

              {formConfig?.fields?.length > 0 && (
                  <>
                    <Divider label="Institutional Data Fields" labelPosition="center" color={`${THEME_LIGHT}44`} />
                    <SimpleGrid cols={2} spacing="md">
                        {formConfig.fields
                          .filter(f => !["student_name", "session"].includes(f.field_name))
                          .map(field => {
                             if (field.field_name === "dob") {
                                 return (
                                     <DateInput 
                                        key={field.field_name}
                                        label={field.field_label}
                                        placeholder="Pick Date of Birth"
                                        required={field.is_required}
                                        valueFormat="YYYY-MM-DD"
                                        {...form.getInputProps(field.field_name)}
                                     />
                                 );
                             }
                             return (
                                 <TextInput 
                                    key={field.field_name}
                                    label={field.field_label}
                                    required={field.is_required}
                                    {...form.getInputProps(field.field_name)}
                                 />
                             );
                          })}
                    </SimpleGrid>
                  </>
              )}
              
              <Divider my="md" />

              <Flex justify="flex-end" gap="md">
                <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
                <Button 
                    type="submit" 
                    loading={createMutation.isPending || updateMutation.isPending}
                    style={{ backgroundColor: THEME_PRIMARY }}
                    radius="md"
                >
                    {editingId ? "Save Changes" : "Enroll Student"}
                </Button>
              </Flex>
          </Stack>
        </form>
      </Drawer>

      <Drawer
        opened={viewDrawerOpened}
        onClose={() => setViewDrawerOpened(false)}
        title={
            <Group gap="sm">
                <ThemeIcon style={{ backgroundColor: THEME_PRIMARY }} size="xl" radius="md">
                    <IconUser size={24} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} style={{ fontSize: "1.2rem", color: THEME_DARK }}>Student Profile</Text>
                    <Text size="xs" color="dimmed">Detailed institutional record</Text>
                </Box>
            </Group>
        }
        position="right"
        size="md"
        padding="xl"
      >
          {selectedStudentForView && (
              <Stack gap="xl">
                  <Center py="md">
                      <Stack align="center" gap="sm">
                        <Avatar 
                            src={selectedStudentForView.photo ? `${STORAGE_URL}${selectedStudentForView.photo}` : null} 
                            size={120} 
                            radius={120} 
                            color="sage"
                        />
                        <Box align="center">
                            <Text fw={700} size="xl" color={THEME_DARK}>{selectedStudentForView.student_name}</Text>
                            <Badge variant="outline" color="sage">{selectedStudentForView.admission_no || "PROVISIONAL"}</Badge>
                        </Box>
                      </Stack>
                  </Center>

                  <Box>
                    <Divider label="Academic Alignment" labelPosition="center" color={`${THEME_LIGHT}44`} mb="md" />
                    <SimpleGrid cols={2} spacing="md">
                        <Box>
                            <Text size="xs" color="dimmed" fw={700} tt="uppercase">Institution</Text>
                            <Text fw={600} size="sm" color={THEME_DARK}>{selectedStudentForView.school?.school_name}</Text>
                        </Box>
                        <Box>
                            <Text size="xs" color="dimmed" fw={700} tt="uppercase">Academic Batch</Text>
                            <Text fw={600} size="sm" color={THEME_DARK}>{selectedStudentForView.batch?.name}</Text>
                        </Box>
                        <Box>
                            <Text size="xs" color="dimmed" fw={700} tt="uppercase">Student Session</Text>
                            <Text fw={600} size="sm" color={THEME_DARK}>{selectedStudentForView.session || "—"}</Text>
                        </Box>
                        <Box>
                            <Text size="xs" color="dimmed" fw={700} tt="uppercase">Enrollment Date</Text>
                            <Text fw={600} size="sm" color={THEME_DARK}>{dayjs(selectedStudentForView.created_at).format('DD MMM YYYY')}</Text>
                        </Box>
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Divider label="Detailed Profile" labelPosition="center" color={`${THEME_LIGHT}44`} mb="md" />
                    <SimpleGrid cols={2} spacing="md">
                        {viewConfig?.fields?.filter(f => !["student_name", "session"].includes(f.field_name)).map(field => (
                            <Box key={field.field_name}>
                                <Text size="xs" color="dimmed" fw={700} tt="uppercase">{field.field_label}</Text>
                                <Text size="sm" fw={500} color={THEME_DARK}>{selectedStudentForView[field.field_name] || "—"}</Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                  </Box>

                  <Divider my="md" />
                  <Flex justify="flex-end">
                      <Button variant="light" color="sage" onClick={() => setViewDrawerOpened(false)}>Close Review</Button>
                  </Flex>
              </Stack>
          )}
      </Drawer>

      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={<Text fw={700} style={{ color: "#fa5252" }}>Expunge Student Record</Text>}
        centered
        radius="lg"
      >
        <Stack p="sm" align="center">
            <Text align="center" size="sm" color={THEME_DARK}>
                Are you sure you want to permanently delete the record for <b>{studentToDelete?.student_name}</b>? 
            </Text>
            <Flex justify="center" gap="sm" mt="lg" w="100%">
                <Button variant="subtle" color="gray" onClick={() => setDeleteModalOpened(false)}>Cancel</Button>
                <Button 
                    color="red" 
                    radius="md"
                    loading={deleteMutation.isPending}
                    onClick={confirmDelete}
                >
                    Confirm Deletion
                </Button>
            </Flex>
        </Stack>
      </Modal>
    </Box>
  );
};

export default ManageStudents;
