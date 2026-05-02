import React, { useState } from "react";
import {
  Box,
  Text,
  Paper,
  Button,
  Flex,
  ActionIcon,
  Drawer,
  TextInput,
  PasswordInput,
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
  Checkbox,
  Skeleton
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { 
    IconPlus, 
    IconEdit, 
    IconTrash, 
    IconBuildingStore,
    IconDots,
    IconEye,
    IconMapPin,
    IconUser,
    IconMail,
    IconSettings,
    IconUpload,
    IconFolders,
    IconListDetails
} from "@tabler/icons-react";
import { 
    useFetchSchools, 
    useUpdateSchool, 
    useDeleteSchool, 
    useUpdateSchoolStatus,
    useFetchAvailableBatches,
    useAssignSchoolBatches,
    useFetchMasterFields,
    useAllocateSchoolFields,
    useFetchSchoolAllocatedFields,
    useFetchSchoolBatches
} from "../queries/schools";
import {
    useSearchAdmins,
    useFetchAdminRoles
} from "../queries/admins";
import { useFetchRoles } from "../queries/roles";
import { useFetchBatches } from "../queries/batches";
import { useMantineTheme } from "@mantine/core";

import { env } from "../utils/helpers";
const STORAGE_URL = env("API_BASE_URL").replace("/api/", "/storage/");

const ManageSchools = () => {
  const theme = useMantineTheme();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [batchModalOpened, setBatchModalOpened] = useState(false);
  const [fieldModalOpened, setFieldModalOpened] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [fieldConfig, setFieldConfig] = useState([]); // [{master_field_id, is_required}]

  const { data: schools, isLoading } = useFetchSchools();
  const { data: roles = [] } = useFetchRoles();
  const { data: allBatches = [], isLoading: batchesLoading } = useFetchBatches();
  const { data: assignedBatches = [], isLoading: assignedLoading } = useFetchSchoolBatches(selectedSchool?.id);
  const { data: allFields = [], isLoading: fieldsLoading } = useFetchMasterFields();
  const { data: schoolAllocations = [], isLoading: allocationsLoading } = useFetchSchoolAllocatedFields(selectedSchool?.id);
  
  const updateMutation = useUpdateSchool();
  const deleteMutation = useDeleteSchool();
  const statusMutation = useUpdateSchoolStatus();
  const assignBatchesMutation = useAssignSchoolBatches();
  const allocateFieldsMutation = useAllocateSchoolFields();

  const THEME_PRIMARY = theme.colors.sage[5];
  const THEME_LIGHT = theme.colors.sage[2];
  const THEME_DARK = theme.colors.sage[9];

  const form = useForm({
    initialValues: {
      school_name: "",
      school_code: "",
      contact_no: "",
      name: "",
      email: "",
      mobile: "",
      city: "",
      state: "",
      address_line1: "",
      address_line2: "",
      address_line3: "",
      pincode: "",
      current_password: "",
      password: "",
      password_confirmation: "",
      role: "",
      logo: null,
    },
  });

  const handleOpenEdit = (school) => {
    setEditingId(school.id);
    setSelectedSchool(school);
    form.setValues({
      school_name: school.school_name,
      school_code: school.school_code,
      contact_no: school.contact_no,
      name: school.user?.name || "",
      email: school.user?.email || "",
      mobile: school.user?.mobile || "",
      city: school.city || "",
      state: school.state || "",
      address_line1: school.address_line1 || "",
      address_line2: school.address_line2 || "",
      address_line3: school.address_line3 || "",
      pincode: school.pincode || "",
      current_password: "",
      password: "",
      password_confirmation: "",
      role: school.user?.role?.name || roles.find(r => r.id === school.user?.role_id)?.name || "", 
    });
    setDrawerOpened(true);
  };

  const handleClose = () => {
    setDrawerOpened(false);
    form.reset();
    setEditingId(null);
  };

  const handleSubmit = (values) => {
    const formData = new FormData();
    Object.keys(values).forEach(key => {
        // Skip password fields if they are empty to avoid backend validation errors
        if (['password', 'password_confirmation', 'current_password'].includes(key) && !values[key]) {
            return;
        }

        if (values[key] !== null && values[key] !== undefined) {
            formData.append(key, values[key]);
        }
    });

    updateMutation.mutate({ id: editingId, payload: formData }, {
        onSuccess: handleClose
    });
  };

  const handleDeleteClick = (school) => {
    setSchoolToDelete(school);
    setDeleteModalOpened(true);
  };

  const confirmDelete = () => {
    if (schoolToDelete) {
        deleteMutation.mutate(schoolToDelete.id, {
            onSuccess: () => setDeleteModalOpened(false)
        });
    }
  };

  const handleOpenBatch = (school) => {
    setSelectedSchool(school);
    setBatchModalOpened(true);
  };

  // Sync selectedBatches when school-specific assignments are fetched
  React.useEffect(() => {
    if (batchModalOpened && assignedBatches) {
        setSelectedBatches(assignedBatches.map(b => b.id));
    }
  }, [batchModalOpened, assignedBatches]);

  const handleOpenFields = (school) => {
    setSelectedSchool(school);
    setFieldModalOpened(true);
  };

  // Sync fieldConfig when allocations are fetched for the selected school
  React.useEffect(() => {
    if (fieldModalOpened && schoolAllocations) {
        const initialConfig = schoolAllocations
            .filter(f => f.is_allocated)
            .map(f => ({
                master_field_id: f.id,
                is_required: f.is_required
            }));
        setFieldConfig(initialConfig);
    }
  }, [fieldModalOpened, schoolAllocations]);

  const handleBatchAllocation = () => {
    assignBatchesMutation.mutate({
        schoolId: selectedSchool.id,
        batchIds: selectedBatches
    }, {
        onSuccess: () => setBatchModalOpened(false)
    });
  };

  const handleFieldAllocation = () => {
    allocateFieldsMutation.mutate({
        schoolId: selectedSchool.id,
        fields: fieldConfig
    }, {
        onSuccess: () => setFieldModalOpened(false)
    });
  };

  const toggleField = (fieldId, checked) => {
      if (checked) {
          setFieldConfig([...fieldConfig, { master_field_id: fieldId, is_required: false }]);
      } else {
          setFieldConfig(fieldConfig.filter(f => f.master_field_id !== fieldId));
      }
  };

  const toggleFieldRequirement = (fieldId, isRequired) => {
      setFieldConfig(fieldConfig.map(f => 
        f.master_field_id === fieldId ? { ...f, is_required: isRequired } : f
      ));
  };

  return (
    <Box p="xl">
      <Flex align="center" justify="space-between" mb={40}>
        <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
          Manage Institutions
        </Text>
      </Flex>

      {/* Table Header */}
      <Box px="xl" mb="md">
          <SimpleGrid cols={5} spacing="xl">
            <Text size="xs" fw={700} color="#adb5bd">INSTITUTION</Text>
            <Text size="xs" fw={700} color="#adb5bd">LOCATION</Text>
            <Text size="xs" fw={700} color="#adb5bd">ADMINISTRATOR</Text>
            <Text size="xs" fw={700} color="#adb5bd">STATUS</Text>
            <Text size="xs" fw={700} color="#adb5bd" align="right">ACTIONS</Text>
          </SimpleGrid>
      </Box>

      {/* School Cards Stack */}
      <Stack gap="sm" mb="xl">
        {isLoading ? (
            Array(5).fill(0).map((_, i) => (
                <Paper key={i} p="md" radius="lg" style={{ backgroundColor: "#ffffff" }}>
                    <SimpleGrid cols={5} spacing="xl" align="center">
                        <Group gap="sm">
                            <Skeleton h={40} w={40} radius="md" />
                            <Box>
                                <Skeleton h={15} w={120} mb={6} radius="xs" />
                                <Skeleton h={10} w={80} radius="xs" />
                            </Box>
                        </Group>
                        <Skeleton h={15} w={100} radius="xs" />
                        <Box>
                            <Skeleton h={15} w={120} mb={6} radius="xs" />
                            <Skeleton h={10} w={150} radius="xs" />
                        </Box>
                        <Skeleton h={25} w={60} radius="xl" />
                        <Flex justify="flex-end">
                            <Skeleton h={30} w={30} radius="md" />
                        </Flex>
                    </SimpleGrid>
                </Paper>
            ))
        ) : (
            schools?.map((school) => (
                <Paper 
                    key={school.id} 
                    p="md" 
                    radius="lg" 
                    style={{ 
                        backgroundColor: "#ffffff", 
                        border: "none", 
                        transition: "transform 0.2s"
                    }}
                >
                    <SimpleGrid cols={5} spacing="xl" align="center">
                        <Group gap="sm">
                            <Avatar 
                              src={school.logo ? `${STORAGE_URL}${school.logo}` : null} 
                              radius="md" 
                              size="md" 
                              color={THEME_PRIMARY}
                            >
                                <IconBuildingStore size={20} />
                            </Avatar>
                            <Box>
                                <Text size="sm" fw={700} color={THEME_DARK}>{school.school_name}</Text>
                                <Text size="xs" color="dimmed">Code: {school.school_code}</Text>
                            </Box>
                        </Group>

                        <Group gap="xs">
                            <IconMapPin size={14} color="#adb5bd" />
                            <Text size="sm" color={THEME_DARK}>{school.city || "N/A"}, {school.state || ""}</Text>
                        </Group>

                        <Box>
                            <Group gap="xs" mb={4}>
                                <IconUser size={14} color="#adb5bd" />
                                <Text size="sm" fw={600} color={THEME_DARK}>{school.user?.name || "Unassigned"}</Text>
                            </Group>
                            <Group gap="xs">
                                <IconMail size={12} color="#adb5bd" />
                                <Text size="xs" color="dimmed">{school.user?.email}</Text>
                            </Group>
                        </Box>

                        <Badge 
                            variant="light" 
                            color={school.user?.user_status_id === 1 ? "green" : "red"}
                            size="md"
                            radius="xl"
                        >
                            {school.user?.user_status_id === 1 ? "Active" : "Closed"}
                        </Badge>

                        <Flex gap="sm" justify="flex-end">
                            <Menu shadow="md" width={200} radius="md">
                                <Menu.Target>
                                    <ActionIcon variant="subtle" color="gray">
                                        <IconDots size={18} />
                                    </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Label>Management</Menu.Label>
                                    <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleOpenEdit(school)}>
                                        Edit Details
                                    </Menu.Item>
                                    <Menu.Item leftSection={<IconFolders size={14} />} onClick={() => handleOpenBatch(school)}>
                                        Manage Batches
                                    </Menu.Item>
                                    <Menu.Item leftSection={<IconListDetails size={14} />} onClick={() => handleOpenFields(school)}>
                                        Configure Fields
                                    </Menu.Item>
                                    
                                    <Menu.Divider />
                                    
                                    <Menu.Label>Danger Zone</Menu.Label>
                                    <Menu.Item 
                                        color="red" 
                                        leftSection={<IconTrash size={14} />} 
                                        onClick={() => handleDeleteClick(school)}
                                    >
                                        Delete Institution
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Flex>
                    </SimpleGrid>
                </Paper>
            ))
        )}
      </Stack>

      {/* Edit School Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={handleClose}
        title={
            <Group gap="sm">
                <ThemeIcon color={THEME_DARK} variant="light" size="xl" radius="md">
                    <IconSettings size={24} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} style={{ fontSize: "1.2rem", color: THEME_DARK }}>Configure Institution</Text>
                    <Text size="xs" color="dimmed">Update branding and administrative contact</Text>
                </Box>
            </Group>
        }
        position="right"
        size="md"
        padding="xl"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
              <Divider label="Location & Physical Address" labelPosition="center" color={`${THEME_LIGHT}44`} />
              <SimpleGrid cols={2}>
                <TextInput label="City" {...form.getInputProps("city")} />
                <TextInput label="State" {...form.getInputProps("state")} />
              </SimpleGrid>
              <TextInput label="Address Line 1" required {...form.getInputProps("address_line1")} />
              <SimpleGrid cols={2}>
                <TextInput placeholder="Line 2" {...form.getInputProps("address_line2")} />
                <TextInput placeholder="Line 3" {...form.getInputProps("address_line3")} />
              </SimpleGrid>
              <TextInput label="Pincode" {...form.getInputProps("pincode")} />

              <Divider label="Administrator Info" labelPosition="center" color={`${THEME_LIGHT}44`} />
              <TextInput label="Admin Name" required {...form.getInputProps("name")} />
              <TextInput label="Admin Email" required {...form.getInputProps("email")} />
              <TextInput label="Contact Phone" {...form.getInputProps("mobile")} />
              <Select 
                label="Assign Role" 
                data={roles.map(r => ({ value: r.name, label: r.display_name }))} 
                {...form.getInputProps("role")} 
              />

              <Divider label="Account Credentials" labelPosition="center" color={`${THEME_LIGHT}44`} />
              <Text size="xs" color="dimmed" mt={-15}>Security verification required for password changes</Text>
              <PasswordInput label="Current Password" placeholder="Required for change" mb="sm" {...form.getInputProps("current_password")} />
              <SimpleGrid cols={2}>
                <PasswordInput label="New Password" {...form.getInputProps("password")} />
                <PasswordInput label="Confirm Password" {...form.getInputProps("password_confirmation")} />
              </SimpleGrid>

              <Divider label="Media" labelPosition="center" color={`${THEME_LIGHT}44`} />
              <FileInput 
                label="Update Logo" 
                placeholder="Choose new institutional logo"
                leftSection={<IconUpload size={16} />}
                {...form.getInputProps("logo")}
              />
              
              <Divider my="md" />

              <Flex justify="flex-end" gap="md">
                <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
                <Button 
                    type="submit" 
                    loading={updateMutation.isPending}
                    style={{ backgroundColor: THEME_PRIMARY, color: "white" }}
                    radius="md"
                >
                    Save Changes
                </Button>
              </Flex>
          </Stack>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={<Text fw={700} style={{ color: "#fa5252" }}>Remove Institution</Text>}
        centered
        radius="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack p="sm">
            <Text size="sm" color={THEME_DARK}>
                Are you sure you want to permanently delete <b>{schoolToDelete?.school_name}</b>? 
                This will also remove the associated admin account and all student records.
            </Text>
            <Flex justify="flex-end" gap="sm" mt="lg">
                <Button variant="subtle" color="gray" onClick={() => setDeleteModalOpened(false)}>Cancel</Button>
                <Button 
                    color="red" 
                    radius="xl"
                    loading={deleteMutation.isPending}
                    onClick={confirmDelete}
                >
                    Delete Permanently
                </Button>
            </Flex>
        </Stack>
      </Modal>

      {/* Academic Batches Drawer */}
      <Drawer
        opened={batchModalOpened}
        onClose={() => setBatchModalOpened(false)}
        title={
            <Group gap="sm">
                <ThemeIcon color={THEME_DARK} variant="light" size="xl" radius="md">
                    <IconFolders size={24} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} style={{ fontSize: "1.2rem", color: THEME_DARK }}>Academic Sessions</Text>
                    <Text size="xs" color="dimmed">Authorize batches for {selectedSchool?.school_name}</Text>
                </Box>
            </Group>
        }
        position="right"
        size="md"
        padding="xl"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="xl">
            <Divider label="Batch Allocation" labelPosition="center" color={`${THEME_LIGHT}44`} />
            <Text size="sm" color="dimmed">Select the academic sessions this institution is authorized to manage.</Text>
            
            {batchesLoading || assignedLoading ? (
                <Stack gap="xs">
                    {Array(8).fill(0).map((_, i) => (
                        <Skeleton key={i} h={40} radius="md" />
                    ))}
                </Stack>
            ) : (
                <Stack gap="xs">
                    {allBatches.map(batch => (
                        <Paper key={batch.id} p="sm" radius="md" style={{ border: '1px solid #f4f6f0' }}>
                            <Checkbox 
                                label={batch.name}
                                color={THEME_PRIMARY}
                                checked={selectedBatches.includes(batch.id)}
                                onChange={(e) => {
                                    if (e.currentTarget.checked) setSelectedBatches([...selectedBatches, batch.id]);
                                    else setSelectedBatches(selectedBatches.filter(id => id !== batch.id));
                                }}
                            />
                        </Paper>
                    ))}
                </Stack>
            )}

            <Flex justify="flex-end" gap="sm" mt="xl">
                <Button variant="subtle" color="gray" onClick={() => setBatchModalOpened(false)}>Cancel</Button>
                <Button 
                    radius="md" 
                    style={{ backgroundColor: THEME_PRIMARY, color: "white" }}
                    onClick={handleBatchAllocation}
                    loading={assignBatchesMutation.isPending}
                >
                    Update Allocations
                </Button>
            </Flex>
        </Stack>
      </Drawer>

      {/* Field Configuration Drawer */}
      <Drawer
        opened={fieldModalOpened}
        onClose={() => setFieldModalOpened(false)}
        title={
            <Group gap="sm">
                <ThemeIcon color={THEME_DARK} variant="light" size="xl" radius="md">
                    <IconListDetails size={24} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} style={{ fontSize: "1.2rem", color: THEME_DARK }}>Student Data Fields</Text>
                    <Text size="xs" color="dimmed">Configure required fields for {selectedSchool?.school_name}</Text>
                </Box>
            </Group>
        }
        position="right"
        size="md"
        padding="xl"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="xl">
            <Divider label="Field Mapping" labelPosition="center" color={`${THEME_LIGHT}44`} />
            <Text size="sm" color="dimmed">Choose student data fields and set mandatory requirements.</Text>

            {fieldsLoading || allocationsLoading ? (
                <Stack gap="sm">
                    {Array(10).fill(0).map((_, i) => (
                        <Skeleton key={i} h={50} radius="md" />
                    ))}
                </Stack>
            ) : (
                <Box style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
                    <Stack gap="sm">
                        {allFields.map(field => {
                            const isSelected = fieldConfig.some(f => f.master_field_id === field.id);
                            const currentConfig = fieldConfig.find(f => f.master_field_id === field.id);

                            return (
                                <Paper key={field.id} p="sm" radius="md" style={{ border: '1px solid #f4f6f0', backgroundColor: isSelected ? '#fafcfa' : 'white' }}>
                                    <Flex justify="space-between" align="center">
                                        <Checkbox 
                                            label={field.field_label}
                                            color={THEME_PRIMARY}
                                            checked={isSelected}
                                            onChange={(e) => toggleField(field.id, e.currentTarget.checked)}
                                        />
                                        {isSelected && (
                                            <Group gap="xs">
                                                <Badge color={currentConfig.is_required ? "red" : "gray"} variant="light" size="xs">
                                                    {currentConfig.is_required ? "REQ" : "OPT"}
                                                </Badge>
                                                <Button 
                                                    size="compact-xs" 
                                                    variant="subtle" 
                                                    color="gray"
                                                    onClick={() => toggleFieldRequirement(field.id, !currentConfig.is_required)}
                                                >
                                                    Toggle
                                                </Button>
                                            </Group>
                                        )}
                                    </Flex>
                                </Paper>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            <Flex justify="flex-end" gap="sm" mt="xl">
                <Button variant="subtle" color="gray" onClick={() => setFieldModalOpened(false)}>Cancel</Button>
                <Button 
                    radius="md" 
                    style={{ backgroundColor: THEME_PRIMARY, color: "white" }}
                    onClick={handleFieldAllocation}
                    loading={allocateFieldsMutation.isPending}
                >
                    Save Mapping
                </Button>
            </Flex>
        </Stack>
      </Drawer>
    </Box>
  );
};

export default ManageSchools;
