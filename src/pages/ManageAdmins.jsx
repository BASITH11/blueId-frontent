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
  Table,
  ScrollArea,
  Skeleton,
  useMantineTheme
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { 
    IconEdit, 
    IconTrash, 
    IconDots,
    IconUser,
    IconMail,
    IconShieldLock,
    IconDeviceMobile,
    IconLock,
    IconAlertCircle
} from "@tabler/icons-react";
import { 
    useFetchAdmins, 
    useUpdateAdmin, 
    useDeleteAdmin, 
    useUpdateAdminStatus,
    useFetchAdminStats
} from "../queries/admins";
import { useFetchRoles } from "../queries/roles";

const ManageAdmins = () => {
  const theme = useMantineTheme();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const { data: admins, isLoading } = useFetchAdmins();
  const { data: stats, isLoading: statsLoading } = useFetchAdminStats();
  const { data: roles = [] } = useFetchRoles();
  
  const updateMutation = useUpdateAdmin();
  const deleteMutation = useDeleteAdmin();
  const statusMutation = useUpdateAdminStatus();

  const THEME_PRIMARY = theme.colors.blueId[5];
  const THEME_LIGHT = theme.colors.blueId[2];
  const THEME_DARK = theme.colors.blueId[9];

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      role: "",
      status: "",
      current_password: "",
      password: "",
      password_confirmation: "",
    },
    validate: {
        password_confirmation: (value, values) => 
            values.password && value !== values.password ? "Passwords do not match" : null
    }
  });

  const handleOpenEdit = (admin) => {
    setSelectedAdmin(admin);
    form.setValues({
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile || "",
      role: admin.role?.name || "",
      status: admin.user_status?.status_name || (admin.user_status_id === 1 ? "active" : "inactive"),
      current_password: "",
      password: "",
      password_confirmation: "",
    });
    setDrawerOpened(true);
  };

  const handleClose = () => {
    setDrawerOpened(false);
    form.reset();
    setSelectedAdmin(null);
  };

  const handleSubmit = (values) => {
    // Only send password fields if a change is intended
    const payload = { ...values };
    if (!values.password) {
        delete payload.password;
        delete payload.password_confirmation;
        delete payload.current_password;
    }

    updateMutation.mutate({ id: selectedAdmin.id, payload }, {
        onSuccess: handleClose
    });
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setDeleteModalOpened(true);
  };

  const confirmDelete = () => {
    if (adminToDelete) {
        deleteMutation.mutate(adminToDelete.id, {
            onSuccess: () => setDeleteModalOpened(false)
        });
    }
  };

  const toggleStatus = (admin) => {
      const newStatus = (admin.user_status?.status_name === 'active' || admin.user_status_id === 1) ? 'inactive' : 'active';
      statusMutation.mutate({ id: admin.id, status: newStatus });
  };

  return (
    <Box p="xl">
      <Stack gap="xl" mb={40}>
          <Box>
            <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
                System Administrators
            </Text>
            <Text color="dimmed" size="sm">Manage administrative accounts and accessibility controls.</Text>
          </Box>

          {/* Stats Section */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              {statsLoading ? (
                  <>
                    <Skeleton h={80} radius="md" />
                    <Skeleton h={80} radius="md" />
                    <Skeleton h={80} radius="md" />
                  </>
              ) : (
                  <>
                    <Paper p="md" radius="md" style={{ backgroundColor: "#f8faf7", border: `1px solid ${THEME_LIGHT}44` }}>
                        <Text size="xs" color="dimmed" fw={700} tt="uppercase">Total Admins</Text>
                        <Text size="xl" fw={700} color={THEME_PRIMARY}>{stats?.total_admins || 0}</Text>
                    </Paper>
                    <Paper p="md" radius="md" style={{ backgroundColor: "#f8faf7", border: `1px solid ${THEME_LIGHT}44` }}>
                        <Text size="xs" color="dimmed" fw={700} tt="uppercase">Active Sessions</Text>
                        <Text size="xl" fw={700} color={THEME_PRIMARY}>{stats?.active_admins || 0}</Text>
                    </Paper>
                    <Paper p="md" radius="md" style={{ backgroundColor: "#f8faf7", border: `1px solid ${THEME_LIGHT}44` }}>
                        <Text size="xs" color="dimmed" fw={700} tt="uppercase">Super Admins</Text>
                        <Text size="xl" fw={700} color={THEME_DARK}>{stats?.super_admins || 0}</Text>
                    </Paper>
                  </>
              )}
          </SimpleGrid>
      </Stack>

      <Paper radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}22` }}>
          <ScrollArea>
              <Table verticalSpacing="md" horizontalSpacing="xl">
                  <Table.Thead>
                      <Table.Tr style={{ backgroundColor: THEME_PRIMARY }}>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>ADMINISTRATOR</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>CONTACT</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>ROLE</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>STATUS</Table.Th>
                          <Table.Th style={{ color: "white", fontSize: "11px", fontWeight: 700 }} align="right">ACTIONS</Table.Th>
                      </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                      {isLoading ? (
                          Array(5).fill(0).map((_, i) => (
                            <Table.Tr key={i}>
                                <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                                <Table.Td><Skeleton h={20} radius="md" /></Table.Td>
                            </Table.Tr>
                          ))
                      ) : (
                          admins?.map((admin) => (
                              <Table.Tr key={admin.id}>
                                  <Table.Td>
                                      <Group gap="sm">
                                          <Avatar color={THEME_PRIMARY} radius="xl" size="sm">
                                              {admin.name.charAt(0)}
                                          </Avatar>
                                          <Box>
                                              <Text size="sm" fw={600} color={THEME_DARK}>{admin.name}</Text>
                                              <Text size="xs" color="dimmed">ID: #{admin.id}</Text>
                                          </Box>
                                      </Group>
                                  </Table.Td>
                                  <Table.Td>
                                      <Box>
                                          <Group gap="xs" mb={4}>
                                              <IconMail size={14} color="#adb5bd" />
                                              <Text size="sm" color={THEME_DARK}>{admin.email}</Text>
                                          </Group>
                                          {admin.mobile && (
                                              <Group gap="xs">
                                                  <IconDeviceMobile size={12} color="#adb5bd" />
                                                  <Text size="xs" color="dimmed">{admin.mobile}</Text>
                                              </Group>
                                          )}
                                      </Box>
                                  </Table.Td>
                                  <Table.Td>
                                      <Badge color={admin.role?.name === 'super_admin' ? "dark" : "gray"} variant="outline" size="sm" radius="xs">
                                          {admin.role?.display_name || admin.role?.name}
                                      </Badge>
                                  </Table.Td>
                                  <Table.Td>
                                      <Badge 
                                          variant="light" 
                                          color={(admin.user_status?.status_name === 'active' || admin.user_status_id === 1) ? "green" : "red"}
                                          size="sm"
                                          radius="xl"
                                      >
                                          {(admin.user_status?.status_name === 'active' || admin.user_status_id === 1) ? "Active" : "Disabled"}
                                      </Badge>
                                  </Table.Td>
                                  <Table.Td align="right">
                                    <Menu shadow="md" width={200} radius="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="blueId">
                                                <IconDots size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Label>Account</Menu.Label>
                                            <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleOpenEdit(admin)}>
                                                Configure Profile
                                            </Menu.Item>
                                            <Menu.Item 
                                                leftSection={<IconShieldLock size={14} />} 
                                                onClick={() => toggleStatus(admin)}
                                            >
                                                { (admin.user_status?.status_name === 'active' || admin.user_status_id === 1) ? 'Disable Access' : 'Enable Access' }
                                            </Menu.Item>
                                            <Menu.Divider />
                                            <Menu.Label>Security</Menu.Label>
                                            <Menu.Item 
                                                color="red" 
                                                leftSection={<IconTrash size={14} />} 
                                                onClick={() => handleDeleteClick(admin)}
                                                disabled={admin.role?.name === 'super_admin'}
                                            >
                                                Revoke Account
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

      {/* Edit Admin Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={handleClose}
        title={
            <Group gap="sm">
                <ThemeIcon color={THEME_DARK} variant="light" size="xl" radius="md">
                    <IconShieldLock size={24} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} style={{ fontSize: "1.2rem", color: THEME_DARK }}>Update Administrator</Text>
                    <Text size="xs" color="dimmed">Modify access levels and credentials</Text>
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
              <Divider label="Identity & Contact" labelPosition="center" color={`${THEME_LIGHT}44`} />
              <TextInput label="Full Name" required {...form.getInputProps("name")} />
              <TextInput label="Email Address" required {...form.getInputProps("email")} />
              <TextInput label="Mobile Number" {...form.getInputProps("mobile")} />

              <Divider label="System Privileges" labelPosition="center" color={`${THEME_LIGHT}44`} />
              <Select 
                label="Role Assignment"
                data={[
                    { value: 'admin', label: 'Administrator' },
                    { value: 'super_admin', label: 'Super Administrator' }
                ]}
                {...form.getInputProps("role")}
                disabled={selectedAdmin?.role?.name === 'super_admin'}
              />
              <Select 
                label="Account Status"
                data={[
                    { value: 'active', label: 'Active (Full Access)' },
                    { value: 'inactive', label: 'Inactive (No Access)' }
                ]}
                {...form.getInputProps("status")}
              />

              <Divider label="Security Reset" labelPosition="center" color={`${THEME_LIGHT}44`} />
              <Text size="xs" color="dimmed" mt={-15}>Leave blank if no change is required.</Text>
              <PasswordInput 
                label="Current Password" 
                placeholder="Required to authorize change"
                {...form.getInputProps("current_password")} 
              />
              <SimpleGrid cols={2}>
                <PasswordInput label="New Password" {...form.getInputProps("password")} />
                <PasswordInput label="Confirm New Password" {...form.getInputProps("password_confirmation")} />
              </SimpleGrid>
              
              <Divider my="md" />

              <Flex justify="flex-end" gap="md">
                <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
                <Button 
                    type="submit" 
                    loading={updateMutation.isPending}
                    style={{ backgroundColor: THEME_PRIMARY, color: "white" }}
                    radius="md"
                >
                    Update Account
                </Button>
              </Flex>
          </Stack>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={<Text fw={700} style={{ color: "#fa5252" }}>Revoke Administrative Access</Text>}
        centered
        radius="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack p="sm" align="center">
            <ThemeIcon color="red" variant="light" size={60} radius={60} mb="sm">
                <IconAlertCircle size={36} />
            </ThemeIcon>
            <Text align="center" size="sm" color={THEME_DARK}>
                Are you sure you want to revoke system access for <b>{adminToDelete?.name}</b>? 
                This action is permanent and will immediately terminate their current session.
            </Text>
            <Flex justify="center" gap="sm" mt="lg" w="100%">
                <Button variant="subtle" color="gray" onClick={() => setDeleteModalOpened(false)}>Go Back</Button>
                <Button 
                    color="red" 
                    radius="md"
                    loading={deleteMutation.isPending}
                    onClick={confirmDelete}
                >
                    Yes, Revoke Access
                </Button>
            </Flex>
        </Stack>
      </Modal>
    </Box>
  );
};

export default ManageAdmins;
