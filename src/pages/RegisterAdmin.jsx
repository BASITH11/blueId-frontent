import React, { useState } from "react";
import {
  Box,
  Text,
  Paper,
  SimpleGrid,
  TextInput,
  PasswordInput,
  Button,
  SegmentedControl,
  Select,
  Divider,
  FileInput,
  Flex,
  Stepper,
  Checkbox,
  Group,
  Stack,
  Loader,
  Center,
  ThemeIcon,
  Badge,
  Skeleton,
  useMantineTheme
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { 
    IconUpload, 
    IconUserPlus, 
    IconFolders, 
    IconListDetails, 
    IconCheck, 
    IconChevronRight, 
    IconChevronLeft,
    IconBuildingStore 
} from "@tabler/icons-react";
import { useFetchRoles } from "../queries/roles";
import { 
    useRegisterSystemAdmin, 
    useRegisterSchoolAdmin,
    useFetchAvailableBatches,
    useAssignSchoolBatches,
    useFetchMasterFields,
    useAllocateSchoolFields
} from "../queries/schools";

const RegisterAdmin = () => {
  const theme = useMantineTheme();
  const [active, setActive] = useState(0);
  const [newSchoolId, setNewSchoolId] = useState(null);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [fieldConfig, setFieldConfig] = useState([]); // [{master_field_id, is_required}]

  const { data: roles = [] } = useFetchRoles();
  const { data: masterBatches = [], isLoading: batchesLoading } = useFetchAvailableBatches(newSchoolId);
  const { data: masterFields = [], isLoading: fieldsLoading } = useFetchMasterFields();

  const registerAdminMutation = useRegisterSystemAdmin();
  const registerSchoolMutation = useRegisterSchoolAdmin();
  const assignBatchesMutation = useAssignSchoolBatches();
  const allocateFieldsMutation = useAllocateSchoolFields();

  const THEME_PRIMARY = theme.colors.sage[5];
  const THEME_LIGHT = theme.colors.sage[2];
  const THEME_DARK = theme.colors.sage[9];

  const form = useForm({
    initialValues: {
      user_type: "schooladmin",
      name: "",
      email: "",
      mobile: "",
      password: "",
      password_confirmation: "",
      role: "school_admin",
      school_name: "",
      contact_no: "",
      school_code: "",
      address_line1: "",
      city: "",
      state: "",
      pincode: "",
      logo: null,
    },
  });

  const isSchool = form.values.user_type === "schooladmin";
  const roleOptions = React.useMemo(() => roles.map(r => ({ value: r.name, label: r.display_name })), [roles]);

  // Step 1: Initial Registration
  const handlePrimaryRegistration = async (values) => {
    // Check if passwords match
    if (values.password !== values.password_confirmation) {
        form.setFieldError("password_confirmation", "Passwords do not match");
        return;
    }

    if (!isSchool) {
      registerAdminMutation.mutate({
          name: values.name,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
          password_confirmation: values.password_confirmation,
          role: values.role,
          user_type: "admin"
      }, {
          onSuccess: () => {
              form.reset();
              setActive(3); // Go to completed
          }
      });
      return;
    }

    // Prepare FormData for file upload support (logos)
    const formData = new FormData();
    Object.keys(values).forEach(key => {
        if (key === 'logo' && values[key]) {
            formData.append('logo', values[key]);
        } else if (values[key] !== null) {
            formData.append(key, values[key]);
        }
    });

    registerSchoolMutation.mutate(formData, {
        onSuccess: (res) => {
            // Controller returns 'school' object in data
            const schoolId = res.data?.school?.id;
            if (schoolId) {
                setNewSchoolId(schoolId);
                setActive(1);
            }
        }
    });
  };

  // Step 2: Batch Allocation
  const handleBatchAllocation = () => {
    assignBatchesMutation.mutate({
        schoolId: newSchoolId,
        batchIds: selectedBatches
    }, {
        onSuccess: () => setActive(2)
    });
  };

  // Step 3: Field Allocation
  const handleFieldAllocation = () => {
    allocateFieldsMutation.mutate({
        schoolId: newSchoolId,
        fields: fieldConfig
    }, {
        onSuccess: () => {
            setNewSchoolId(null);
            form.reset();
            setActive(0);
        }
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
      <Stepper 
        active={active} 
        onStepClick={setActive} 
        allowNextStepsSelect={false}
        color={THEME_PRIMARY}
        iconSize={42}
        styles={{
            stepIcon: { border: `2px solid ${THEME_LIGHT}44`, backgroundColor: 'transparent' },
            separator: { backgroundColor: `${THEME_LIGHT}44` }
        }}
      >
        <Stepper.Step 
            label="Account Info" 
            description="Personal & Institution" 
            icon={<IconUserPlus size={20} />}
        >
          <Box mt="xl">
            <Paper radius="xl" p="xl" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}22` }}>
              <form onSubmit={form.onSubmit(handlePrimaryRegistration)}>
                <SegmentedControl
                  fullWidth
                  size="md"
                  mb="xl"
                  data={[
                    { label: 'System Admin', value: 'admin' },
                    { label: 'School Admin', value: 'schooladmin' },
                  ]}
                  {...form.getInputProps("user_type")}
                  styles={{
                      root: { backgroundColor: "#f4f6f0" },
                      indicator: { backgroundColor: "#ffffff" },
                      label: { fontWeight: 600, color: THEME_DARK }
                  }}
                />

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  <Select label="User Role" data={roleOptions} required {...form.getInputProps("role")} />
                  <TextInput label="Full Name" placeholder="John Doe" required {...form.getInputProps("name")} />
                  <TextInput label="Email Address" required {...form.getInputProps("email")} />
                  <TextInput label="Mobile Number" required {...form.getInputProps("mobile")} />
                  <PasswordInput label="Password" required {...form.getInputProps("password")} />
                  <PasswordInput label="Confirm" required {...form.getInputProps("password_confirmation")} />
                </SimpleGrid>

                {isSchool && (
                  <>
                    <Divider my="xl" label="Institution Branding & Location" labelPosition="center" color={`${THEME_LIGHT}44`} />
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  <TextInput label="School Name" placeholder="e.g. Springfield Academy" required {...form.getInputProps("school_name")} />
                  <TextInput label="School Code" placeholder="SCH-001" required {...form.getInputProps("school_code")} />
                  <TextInput label="Contact No (School)" placeholder="Office Phone" required {...form.getInputProps("contact_no")} />
                  <FileInput label="Official Logo" placeholder="Choose image" leftSection={<IconUpload size={16} />} {...form.getInputProps("logo")} />
                </SimpleGrid>

                <Box mt="lg">
                    <Text size="sm" fw={600} color={THEME_DARK} mb="sm">Institution Address</Text>
                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                        <TextInput placeholder="Address Line 1" required {...form.getInputProps("address_line1")} />
                        <TextInput placeholder="Address Line 2" {...form.getInputProps("address_line2")} />
                        <TextInput placeholder="Address Line 3" {...form.getInputProps("address_line3")} />
                        <TextInput placeholder="City" required {...form.getInputProps("city")} />
                        <TextInput placeholder="State" required {...form.getInputProps("state")} />
                        <TextInput placeholder="Pincode" required {...form.getInputProps("pincode")} />
                    </SimpleGrid>
                </Box>
                  </>
                )}

                <Flex justify="flex-end" mt="xl">
                  <Button 
                    type="submit" 
                    radius="xl" 
                    size="md" 
                    rightSection={isSchool ? <IconChevronRight size={18} /> : <IconCheck size={18} />}
                    style={{ backgroundColor: THEME_PRIMARY }}
                    loading={registerAdminMutation.isPending || registerSchoolMutation.isPending}
                  >
                    {isSchool ? "Next: Allocate Batches" : "Complete Registration"}
                  </Button>
                </Flex>
              </form>
            </Paper>
          </Box>
        </Stepper.Step>

        <Stepper.Step 
            label="Allocation" 
            description="Academic Batches" 
            icon={<IconFolders size={20} />}
        >
          <Box mt="xl">
            <Paper radius="xl" p="xl" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}22` }}>
              <Text fw={700} color={THEME_DARK} mb="sm">Assign Academic Batches</Text>
              <Text size="sm" color="dimmed" mb="xl">Select the active years/batches this school is authorized to manage.</Text>
              
              {batchesLoading ? (
                <Stack gap="xs">
                    {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} h={50} radius="md" />
                    ))}
                </Stack>
              ) : (
                <Stack gap="xs">
                    {masterBatches.map(batch => (
                        <Paper key={batch.id} p="md" radius="md" style={{ border: '1px solid #f4f6f0' }}>
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

              <Flex justify="space-between" mt="xl">
                <Button variant="subtle" color="gray" leftSection={<IconChevronLeft size={18} />} onClick={() => setActive(0)}>Back</Button>
                <Button 
                    radius="xl" 
                    rightSection={<IconChevronRight size={18} />} 
                    style={{ backgroundColor: THEME_PRIMARY }}
                    onClick={handleBatchAllocation}
                    loading={assignBatchesMutation.isPending}
                    disabled={selectedBatches.length === 0}
                >
                    Next: Field Config
                </Button>
              </Flex>
            </Paper>
          </Box>
        </Stepper.Step>

        <Stepper.Step 
            label="Finalize" 
            description="Custom Fields" 
            icon={<IconListDetails size={20} />}
        >
          <Box mt="xl">
            <Paper radius="xl" p="xl" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}22` }}>
                <Text fw={700} color={THEME_DARK} mb="sm">Data Entry Configuration</Text>
                <Text size="sm" color="dimmed" mb="xl">Choose which fields are collected during student entry and mark mandatory ones.</Text>

                {fieldsLoading ? (
                    <Stack gap="sm">
                        {Array(8).fill(0).map((_, i) => (
                            <Skeleton key={i} h={60} radius="md" />
                        ))}
                    </Stack>
                ) : (
                    <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Stack gap="sm">
                            {masterFields.map(field => {
                                const isSelected = fieldConfig.some(f => f.master_field_id === field.id);
                                const currentConfig = fieldConfig.find(f => f.master_field_id === field.id);

                                return (
                                    <Paper key={field.id} p="md" radius="md" style={{ border: '1px solid #f4f6f0', backgroundColor: isSelected ? '#fafcfa' : 'white' }}>
                                        <Flex justify="space-between" align="center">
                                            <Checkbox 
                                                label={field.field_label}
                                                color={THEME_PRIMARY}
                                                checked={isSelected}
                                                onChange={(e) => toggleField(field.id, e.currentTarget.checked)}
                                            />
                                            {isSelected && (
                                                <Group gap="xs">
                                                    <Badge color={currentConfig.is_required ? "red" : "gray"} variant="light" size="sm">
                                                        {currentConfig.is_required ? "MANDATORY" : "OPTIONAL"}
                                                    </Badge>
                                                    <Button 
                                                        size="compact-xs" 
                                                        variant="subtle" 
                                                        color="gray"
                                                        onClick={() => toggleFieldRequirement(field.id, !currentConfig.is_required)}
                                                    >
                                                        Toggle Requirement
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

                <Flex justify="space-between" mt="xl">
                    <Button variant="subtle" color="gray" leftSection={<IconChevronLeft size={18} />} onClick={() => setActive(1)}>Back</Button>
                    <Button 
                        radius="xl" 
                        rightSection={<IconCheck size={18} />} 
                        style={{ backgroundColor: THEME_PRIMARY }}
                        onClick={handleFieldAllocation}
                        loading={allocateFieldsMutation.isPending}
                        disabled={fieldConfig.length === 0}
                    >
                        Create Institution Account
                    </Button>
                </Flex>
            </Paper>
          </Box>
        </Stepper.Step>

        <Stepper.Completed>
            <Center py={100}>
                <Stack align="center">
                    <ThemeIcon size={80} radius={100} color="green" variant="light">
                        <IconCheck size={40} />
                    </ThemeIcon>
                    <Text fw={700} size="xl" color={THEME_DARK}>Ready to Start!</Text>
                    <Text color="dimmed">The institution has been successfully onboarded and configured.</Text>
                    <Button radius="xl" variant="light" color="green" onClick={() => setActive(0)}>Onboard Another</Button>
                </Stack>
            </Center>
        </Stepper.Completed>
      </Stepper>
    </Box>
  );
};

export default RegisterAdmin;
