import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Paper,
  Button,
  Flex,
  Drawer,
  TextInput,
  PasswordInput,
  FileInput,
  Loader,
  Center,
  Group,
  Stack,
  SimpleGrid,
  Divider,
  Avatar,
  Badge,
  ThemeIcon,
  Skeleton,
  useMantineTheme
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconBuildingStore,
  IconEdit,
  IconMapPin,
  IconUser,
  IconMail,
  IconPhone,
  IconSettings,
  IconUpload,
  IconCheck,
  IconId,
} from "@tabler/icons-react";
import {
  useFetchMySchool,
  useUpdateMyProfile,
  useUpdateMySchoolLogo,
} from "../queries/schoolAdmin";
import { useAuthStore } from "../config/authStore";

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

const InfoBlock = ({ label, value }) => (
  <Box>
    <Text size="xs" fw={700} color="dimmed" tt="uppercase" mb={2}>{label}</Text>
    <Text size="sm" fw={500} color="#192612">{value || "—"}</Text>
  </Box>
);

const MySchool = () => {
  const theme = useMantineTheme();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const { user: authUser } = useAuthStore();
  const { data: schoolData, isLoading } = useFetchMySchool();
  const updateProfileMutation = useUpdateMyProfile();
  const updateLogoMutation = useUpdateMySchoolLogo();

  const THEME_PRIMARY = theme.colors.sage[5];
  const THEME_LIGHT = theme.colors.sage[2];
  const THEME_DARK = theme.colors.sage[9];

  const form = useForm({
    initialValues: {
      school_name: "",
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
      logo: null,
    },
  });

  const school = schoolData?.data?.school || schoolData?.school;
  const adminUser = school?.user || authUser;

  const populateForm = (s, u) => {
    form.setValues({
      school_name: s?.school_name || "",
      contact_no: s?.contact_no || "",
      name: u?.name || "",
      email: u?.email || "",
      mobile: u?.mobile || "",
      city: s?.city || "",
      state: s?.state || "",
      address_line1: s?.address_line1 || "",
      address_line2: s?.address_line2 || "",
      address_line3: s?.address_line3 || "",
      pincode: s?.pincode || "",
      current_password: "",
      password: "",
      password_confirmation: "",
      logo: null,
    });
  };

  useEffect(() => {
    if (school) populateForm(school, adminUser);
  }, [schoolData]);

  // Generate live preview URL when a new logo file is chosen
  useEffect(() => {
    const file = form.values.logo;
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoPreview(null);
    }
  }, [form.values.logo]);

  const handleClose = () => {
    populateForm(school, adminUser);
    setDrawerOpened(false);
  };

  const handleSubmit = (values) => {
    const logoFile = values.logo || null;

    // Build profile FormData (no logo — logo has its own endpoint)
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (key === "logo") return; // handled separately
      if (["password", "password_confirmation", "current_password"].includes(key) && !values[key]) return;
      if (values[key] !== null && values[key] !== undefined) {
        formData.append(key, values[key]);
      }
    });

    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        // If a logo file was also selected, upload it separately
        if (logoFile) {
          const logoData = new FormData();
          logoData.append("logo", logoFile);
          updateLogoMutation.mutate(logoData, {
            onSuccess: handleClose,
            onError: handleClose // close anyway, profile was already saved
          });
        } else {
          handleClose();
        }
      }
    });
  };

  if (isLoading) {
    return (
        <Box p="xl">
            <Flex align="center" justify="space-between" mb={40}>
                <Box>
                    <Skeleton h={40} w={300} mb="xs" radius="md" />
                    <Skeleton h={15} w={400} radius="xs" />
                </Box>
                <Skeleton h={40} w={120} radius="md" />
            </Flex>

            <Stack gap="xl">
                <Paper p="xl" radius="lg">
                    <Group gap="xl">
                        <Skeleton h={100} w={100} radius="md" />
                        <Box style={{ flex: 1 }}>
                            <Skeleton h={30} w="40%" mb={10} radius="xs" />
                            <Skeleton h={15} w="20%" mb={8} radius="xs" />
                            <Skeleton h={15} w="15%" radius="xs" />
                        </Box>
                    </Group>
                </Paper>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                    <Paper p="xl" radius="lg">
                        <Skeleton h={20} w={150} mb="xl" radius="xs" />
                        <Stack gap="md">
                            <Skeleton h={40} radius="xs" />
                            <Skeleton h={40} radius="xs" />
                            <Skeleton h={40} radius="xs" />
                        </Stack>
                    </Paper>
                    <Paper p="xl" radius="lg">
                        <Skeleton h={20} w={150} mb="xl" radius="xs" />
                        <Group mb="xl">
                            <Skeleton h={56} w={56} circle />
                            <Box>
                                <Skeleton h={15} w={100} mb={6} radius="xs" />
                                <Skeleton h={20} w={80} radius="xs" />
                            </Box>
                        </Group>
                        <Stack gap="md">
                            <Skeleton h={40} radius="xs" />
                            <Skeleton h={40} radius="xs" />
                        </Stack>
                    </Paper>
                </SimpleGrid>
            </Stack>
        </Box>
    );
  }

  const fullAddress = [
    school?.address_line1,
    school?.address_line2,
    school?.address_line3,
    school?.city,
    school?.state,
    school?.pincode,
  ].filter(Boolean).join(", ");

  return (
    <Box p="xl">
      {/* Page Header */}
      <Flex align="center" justify="space-between" mb={40}>
        <Box>
          <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
            Manage Institution
          </Text>
          <Text color="dimmed" size="sm">View and manage your institutional profile</Text>
        </Box>
        <Button
          leftSection={<IconEdit size={16} />}
          style={{ backgroundColor: THEME_PRIMARY, color: "white" }}
          radius="md"
          onClick={() => setDrawerOpened(true)}
        >
          Edit Details
        </Button>
      </Flex>

      {school ? (
        <Stack gap="xl">
          {/* Identity Card */}
          <Paper p="xl" radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}44` }}>
            <Group gap="xl" align="flex-start">
              <Avatar
                src={school.logo ? `${STORAGE_URL}${school.logo}` : null}
                size={100}
                radius="md"
                color={THEME_PRIMARY}
              >
                <IconBuildingStore size={44} />
              </Avatar>
              <Box style={{ flex: 1 }}>
                <Group gap="sm" mb={4}>
                  <Text style={{ fontSize: "1.8rem", fontWeight: 700, color: THEME_DARK }}>
                    {school.school_name}
                  </Text>
                  <Badge variant="light" color="green" size="lg" radius="xl">Active</Badge>
                </Group>
                <Group gap="xs" mb={4}>
                  <IconId size={14} color="#adb5bd" />
                  <Text size="sm" color="dimmed" fw={600}>School Code: {school.school_code}</Text>
                </Group>
                {school.contact_no && (
                  <Group gap="xs">
                    <IconPhone size={14} color="#adb5bd" />
                    <Text size="sm" color="dimmed">{school.contact_no}</Text>
                  </Group>
                )}
              </Box>
            </Group>
          </Paper>

          {/* Details Grid */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            {/* Location */}
            <Paper p="xl" radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}44` }}>
              <Group gap="sm" mb="xl">
                <ThemeIcon color={THEME_PRIMARY} variant="light" size="lg" radius="md">
                  <IconMapPin size={18} />
                </ThemeIcon>
                <Text fw={700} size="md" color={THEME_DARK}>Campus Location</Text>
              </Group>
              <Stack gap="md">
                <InfoBlock label="Address Line 1" value={school?.address_line1} />
                <InfoBlock label="Address Line 2" value={school?.address_line2} />
                <InfoBlock label="Address Line 3" value={school?.address_line3} />
                <SimpleGrid cols={3}>
                  <InfoBlock label="City" value={school?.city} />
                  <InfoBlock label="State" value={school?.state} />
                  <InfoBlock label="Pincode" value={school?.pincode} />
                </SimpleGrid>
              </Stack>
            </Paper>

            {/* Administrator */}
            <Paper p="xl" radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}44` }}>
              <Group gap="sm" mb="xl">
                <ThemeIcon color={THEME_DARK} variant="light" size="lg" radius="md">
                  <IconUser size={18} />
                </ThemeIcon>
                <Text fw={700} size="md" color={THEME_DARK}>Managing Administrator</Text>
              </Group>
              <Group gap="md" mb="xl">
                <Avatar size={56} radius="xl" style={{ backgroundColor: THEME_LIGHT, color: THEME_DARK, fontWeight: 700, fontSize: "1.4rem" }}>
                  {adminUser?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Text fw={700} size="md" color={THEME_DARK}>{adminUser?.name}</Text>
                  <Badge variant="outline" color="sage" size="sm">Administrator</Badge>
                </Box>
              </Group>
              <Divider color={`${THEME_LIGHT}11`} mb="md" />
              <Stack gap="md">
                <InfoBlock label="Email Address" value={adminUser?.email} />
                <SimpleGrid cols={2}>
                  <InfoBlock label="Mobile" value={adminUser?.mobile} />
                </SimpleGrid>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Stack>
      ) : (
        <Center h={300}>
          <Text color="dimmed">No institutional data found.</Text>
        </Center>
      )}

      {/* Edit Drawer */}
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
              <Text size="xs" color="dimmed">Update branding and administrative details</Text>
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
            <Divider label="Institutional Info" labelPosition="center" color={`${THEME_LIGHT}44`} />
            <TextInput label="School Name" required {...form.getInputProps("school_name")} />
            <TextInput label="Contact Number" {...form.getInputProps("contact_no")} />

            <Divider label="Location & Physical Address" labelPosition="center" color={`${THEME_LIGHT}44`} />
            <SimpleGrid cols={2}>
              <TextInput label="City" {...form.getInputProps("city")} />
              <TextInput label="State" {...form.getInputProps("state")} />
            </SimpleGrid>
            <TextInput label="Address Line 1" {...form.getInputProps("address_line1")} />
            <TextInput label="Address Line 2" {...form.getInputProps("address_line2")} />
            <TextInput label="Address Line 3" {...form.getInputProps("address_line3")} />
            <TextInput label="Pincode" {...form.getInputProps("pincode")} />

            <Divider label="Administrator Info" labelPosition="center" color={`${THEME_LIGHT}44`} />
            <TextInput label="Admin Name" required {...form.getInputProps("name")} />
            <TextInput label="Admin Email" required {...form.getInputProps("email")} />
            <TextInput label="Contact Phone" {...form.getInputProps("mobile")} />

            <Divider label="Account Credentials" labelPosition="center" color={`${THEME_LIGHT}44`} />
            <Text size="xs" color="dimmed" mt={-15}>Security verification required for password changes</Text>
            <PasswordInput label="Current Password" placeholder="Required for change" {...form.getInputProps("current_password")} />
            <SimpleGrid cols={2}>
              <PasswordInput label="New Password" {...form.getInputProps("password")} />
              <PasswordInput label="Confirm Password" {...form.getInputProps("password_confirmation")} />
            </SimpleGrid>

            <Divider label="Media" labelPosition="center" color={`${THEME_LIGHT}44`} />
            <Stack gap="sm" align="center">
              <Avatar
                src={logoPreview || (school?.logo ? `${STORAGE_URL}${school.logo}` : null)}
                size={100}
                radius="md"
                color={THEME_PRIMARY}
              >
                <IconBuildingStore size={40} />
              </Avatar>
              {logoPreview && (
                <Text size="xs" color={THEME_PRIMARY} fw={600}>New logo preview — not saved yet</Text>
              )}
            </Stack>
            <FileInput
              label="Update Logo"
              placeholder="Choose new institutional logo"
              leftSection={<IconUpload size={16} />}
              accept="image/*"
              {...form.getInputProps("logo")}
            />

            <Divider my="md" />

            <Flex justify="flex-end" gap="md">
              <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                loading={updateProfileMutation.isPending}
                style={{ backgroundColor: THEME_PRIMARY, color: "white" }}
                radius="md"
                leftSection={<IconCheck size={16} />}
              >
                Save Changes
              </Button>
            </Flex>
          </Stack>
        </form>
      </Drawer>
    </Box>
  );
};

export default MySchool;
