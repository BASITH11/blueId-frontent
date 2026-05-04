import React, { useState } from "react";
import {
  Box,
  Text,
  Paper,
  Button,
  Flex,
  Table,
  Badge,
  ActionIcon,
  Modal,
  Drawer,
  Accordion,
  Divider,
  SimpleGrid,
  TextInput,
  MultiSelect,
  Loader,
  Center,
  Group,
  Checkbox,
  ThemeIcon,
  Stack,
  Menu,
  Pagination,
  UnstyledButton,
  Avatar,
  Skeleton,
  ScrollArea,
  useMantineTheme
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { 
    IconShieldLock, 
    IconEdit, 
    IconTrash, 
    IconPlus, 
    IconEye, 
    IconCheck, 
    IconSearch, 
    IconDots, 
    IconChevronDown 
} from "@tabler/icons-react";
import { useFetchRoles, useFetchPermissions, useCreateRole, useUpdateRole, useDeleteRole } from "../queries/roles";

const ManageRoles = () => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [viewDrawerOpened, setViewDrawerOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const { data: roles, isLoading: rolesLoading } = useFetchRoles();
  const { data: permissions, isLoading: permissionsLoading } = useFetchPermissions();
  
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const THEME_PRIMARY = theme.colors.blueId[5];
  const THEME_LIGHT = theme.colors.blueId[2];
  const THEME_DARK = theme.colors.blueId[9];

  const form = useForm({
    initialValues: {
      display_name: "",
      description: "",
      permissions: [],
    },
  });

  const handleOpen = (role = null) => {
    if (role) {
      setEditingId(role.id);
      form.setValues({
        display_name: role.display_name || "",
        description: role.description || "",
        permissions: role.permissions_flat?.map(p => typeof p === 'string' ? p : p.name) || [],
      });
    } else {
      setEditingId(null);
      form.reset();
    }
    setOpened(true);
  };

  const handleClose = () => {
    setOpened(false);
    form.reset();
    setEditingId(null);
  };

  const handleViewRole = (role) => {
    setSelectedRole(role);
    setViewDrawerOpened(true);
  };

  const handleSubmit = (values) => {
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, payload: values },
        { onSuccess: handleClose }
      );
    } else {
      createMutation.mutate(values, { onSuccess: handleClose });
    }
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setDeleteModalOpened(true);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id, {
        onSuccess: () => setDeleteModalOpened(false)
      });
    }
  };

  // Group ALL available permissions by module for the checkbox list
  const groupedPermissions = React.useMemo(() => {
    if (!Array.isArray(permissions)) return {};
    
    // Check if the data is already grouped by the backend
    const isAlreadyGrouped = permissions.length > 0 && Array.isArray(permissions[0].permissions);
    
    if (isAlreadyGrouped) {
        return permissions.reduce((acc, group) => {
            acc[group.module_display_name || group.module] = group.permissions;
            return acc;
        }, {});
    }

    // Otherwise, perform manual grouping on flat array
    return permissions.reduce((acc, p) => {
        const module = p.module_display_name || p.module || "Other";
        if (!acc[module]) acc[module] = [];
        acc[module].push(p);
        return acc;
      }, {});
  }, [permissions]);

  const togglePermission = (permName) => {
    const current = form.values.permissions;
    if (current.includes(permName)) {
        form.setFieldValue("permissions", current.filter(p => p !== permName));
    } else {
        form.setFieldValue("permissions", [...current, permName]);
    }
  };

  const toggleModulePermissions = (modulePerms, isChecked) => {
    const permNames = modulePerms.map(p => p.name);
    const otherPerms = form.values.permissions.filter(p => !permNames.includes(p));
    
    if (isChecked) {
        form.setFieldValue("permissions", [...otherPerms, ...permNames]);
    } else {
        form.setFieldValue("permissions", otherPerms);
    }
  };

  return (
    <Box p="xl">
      <Flex align="center" justify="space-between" mb={40}>
        <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
          Manage Roles
        </Text>
        <Button 
            leftSection={<IconPlus size={18} />} 
            radius="xl"
            onClick={() => handleOpen()}
            style={{ backgroundColor: THEME_PRIMARY, color: "white" }}
            size="md"
        >
          Create New Role
        </Button>
      </Flex>

      <Paper radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}22` }}>
          <ScrollArea>
              <Table verticalSpacing="md" horizontalSpacing="xl">
                  <Table.Thead>
                      <Table.Tr style={{ backgroundColor: THEME_PRIMARY }}>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>SL NO.</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>DISPLAY NAME</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>DESCRIPTION</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }} align="right">ACTIONS</Table.Th>
                      </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                      {rolesLoading ? (
                          Array(5).fill(0).map((_, i) => (
                            <Table.Tr key={i}>
                                <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                            </Table.Tr>
                          ))
                      ) : (
                          roles?.map((role, index) => (
                              <Table.Tr key={role.id}>
                                  <Table.Td>
                                      <Text size="sm" fw={700} color={THEME_DARK}>{index + 1}</Text>
                                  </Table.Td>
                                  <Table.Td>
                                      <Text size="sm" fw={600} color={THEME_DARK}>{role.display_name}</Text>
                                  </Table.Td>
                                  <Table.Td>
                                      <Text size="sm" color="dimmed" truncate>{role.description}</Text>
                                  </Table.Td>
                                  <Table.Td align="right">
                                    <Flex gap="sm" justify="flex-end">
                                        <ActionIcon variant="light" color="green" onClick={() => handleViewRole(role)}>
                                            <IconEye size={16} />
                                        </ActionIcon>
                                        <ActionIcon variant="light" color="blue" onClick={() => handleOpen(role)}>
                                            <IconEdit size={16} />
                                        </ActionIcon>
                                        <ActionIcon variant="light" color="red" onClick={() => handleDeleteClick(role)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Flex>
                                  </Table.Td>
                              </Table.Tr>
                          ))
                      )}
                  </Table.Tbody>
              </Table>
          </ScrollArea>
      </Paper>

      {/* Role Form Drawer */}
      <Drawer
        opened={opened} 
        onClose={handleClose} 
        title={
            <Group gap="sm">
                <ThemeIcon color={THEME_DARK} variant="light" size="xl" radius="md">
                    <IconShieldLock size={24} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} style={{ fontSize: "1.2rem", color: THEME_DARK }}>
                        {editingId ? "Update Role" : "Create New Role"}
                    </Text>
                    <Text size="xs" color="dimmed">{editingId ? "Modify existing authorization levels" : "Define a new access profile"}</Text>
                </Box>
            </Group>
        }
        position="right"
        size="md"
        padding="xl"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Role Display Name"
            placeholder="e.g. Data Entry Operator"
            required
            mb="md"
            {...form.getInputProps("display_name")}
          />
          
          <TextInput
            label="Description"
            placeholder="Briefly describe what this role does"
            mb="xl"
            {...form.getInputProps("description")}
          />

          <Divider my="md" label="Permissions Assignment" labelPosition="center" color={`${THEME_LIGHT}44`} mb="lg" />

          {permissionsLoading ? (
            <Stack gap="md">
                {Array(5).fill(0).map((_, i) => (
                    <Box key={i}>
                        <Skeleton h={15} w={100} mb="sm" radius="xs" />
                        <Stack gap="xs">
                            <Skeleton h={12} w="90%" radius="xs" />
                            <Skeleton h={12} w="85%" radius="xs" />
                        </Stack>
                    </Box>
                ))}
            </Stack>
          ) : (
            <Box style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto", paddingRight: "10px" }}>
                {Object.entries(groupedPermissions).map(([module, perms]) => {
                    const modulePermNames = perms.map(p => p.name);
                    const selectedInModule = form.values.permissions.filter(p => modulePermNames.includes(p));
                    const allSelected = selectedInModule.length === perms.length && perms.length > 0;
                    const indeterminate = selectedInModule.length > 0 && selectedInModule.length < perms.length;

                    return (
                        <Box key={module} mb="lg">
                            <Group justify="space-between" mb="xs">
                                <Text size="sm" fw={700} color={THEME_DARK} style={{ textTransform: "capitalize" }}>
                                    {module} Module
                                </Text>
                                <Checkbox
                                    size="xs"
                                    color={THEME_PRIMARY}
                                    label={<Text size="xs" color="dimmed" fw={600}>Select All</Text>}
                                    checked={allSelected}
                                    indeterminate={indeterminate}
                                    onChange={(event) => toggleModulePermissions(perms, event.currentTarget.checked)}
                                />
                            </Group>
                            <SimpleGrid cols={1} spacing="xs">
                                {perms.map((perm) => (
                                    <Checkbox
                                        key={perm.id}
                                        label={perm.display_name || perm.name}
                                        checked={form.values.permissions.includes(perm.name)}
                                        onChange={() => togglePermission(perm.name)}
                                        color={THEME_PRIMARY}
                                        styles={{ label: { fontSize: "12px", cursor: "pointer" } }}
                                    />
                                ))}
                            </SimpleGrid>
                            <Divider mt="md" color="#f4f6f0" />
                        </Box>
                    );
                })}
            </Box>
          )}

          <Flex justify="flex-end" gap="md" mt="xl" pt="md" style={{ borderTop: "1px solid #f4f6f0" }}>
            <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
            <Button 
                type="submit" 
                loading={createMutation.isPending || updateMutation.isPending}
                style={{ backgroundColor: THEME_PRIMARY, color: "white" }}
                radius="md"
            >
              {editingId ? "Save Changes" : "Create Role"}
            </Button>
          </Flex>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={<Text fw={700} style={{ color: "#fa5252" }}>Delete Role Configuration</Text>}
        centered
        radius="lg"
      >
        <Stack p="sm">
            <Text size="sm" color={THEME_DARK}>
                Are you absolutely sure you want to delete the <b>{roleToDelete?.display_name}</b> role? 
                This action is irreversible and may affect users assigned to this role.
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

      {/* View Permissions Drawer */}
      <Drawer
        opened={viewDrawerOpened}
        onClose={() => setViewDrawerOpened(false)}
        title={
          <Group gap="sm">
            <ThemeIcon color={THEME_PRIMARY} variant="light" size="xl" radius="md">
                <IconShieldLock size={24} />
            </ThemeIcon>
            <Box>
                <Text fw={700} style={{ fontSize: "1.2rem", color: THEME_DARK }}>{selectedRole?.display_name}</Text>
                <Text size="xs" color="dimmed">Detailed Permissions Breakdown</Text>
            </Box>
          </Group>
        }
        position="right"
        size="md"
        padding="xl"
      >
        <Box mb="xl">
            <Text size="sm" fw={600} color={THEME_PRIMARY} mb="xs">Description</Text>
            <Text size="sm" color={THEME_DARK}>{selectedRole?.description || "No description provided."}</Text>
        </Box>

        <Divider my="lg" label="Assigned Permissions" labelPosition="center" color={`${THEME_LIGHT}44`} />

        <Box style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", paddingRight: "10px" }}>
            {Object.entries(groupedPermissions).map(([module, perms]) => (
                <Box key={module} mb="lg">
                    <Text size="sm" fw={700} color={THEME_PRIMARY} mb="xs" style={{ textTransform: "capitalize" }}>
                        {module} Module
                    </Text>
                    <SimpleGrid cols={1} spacing="xs">
                        {perms.map((perm) => {
                            const isAssigned = selectedRole?.permissions_flat?.some(p => p.name === perm.name);
                            return (
                                <Checkbox
                                    key={perm.id}
                                    label={perm.display_name || perm.name}
                                    checked={isAssigned}
                                    readOnly
                                    color={THEME_PRIMARY}
                                    styles={{ 
                                        label: { fontSize: "13px", color: isAssigned ? THEME_DARK : "#adb5bd" },
                                        input: { cursor: "default" }
                                    }}
                                />
                            );
                        })}
                    </SimpleGrid>
                    <Divider mt="md" color="#f4f6f0" />
                </Box>
            ))}
        </Box>

        <Button 
            fullWidth 
            mt="xl" 
            variant="light" 
            color="gray" 
            onClick={() => setViewDrawerOpened(false)}
            radius="md"
        >
            Close View
        </Button>
      </Drawer>
    </Box>
  );
};

export default ManageRoles;
