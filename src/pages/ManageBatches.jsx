import React, { useState } from "react";
import {
  Box,
  Text,
  Paper,
  Button,
  Flex,
  ActionIcon,
  Modal,
  TextInput,
  Loader,
  Center,
  Group,
  Checkbox,
  Stack,
  SimpleGrid,
  Divider,
  Skeleton,
  useMantineTheme
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { 
    IconPlus, 
    IconEdit, 
    IconTrash, 
    IconFolders 
} from "@tabler/icons-react";
import { 
    useFetchBatches, 
    useCreateBatch, 
    useUpdateBatch, 
    useDeleteBatch 
} from "../queries/batches";

const ManageBatches = () => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [batchToDelete, setBatchToDelete] = useState(null);

  const { data: batches, isLoading } = useFetchBatches();
  const createMutation = useCreateBatch();
  const updateMutation = useUpdateBatch();
  const deleteMutation = useDeleteBatch();

  const THEME_PRIMARY = theme.colors.blueId[5];
  const THEME_LIGHT = theme.colors.blueId[2];
  const THEME_DARK = theme.colors.blueId[9];

  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name must have at least 2 characters" : null),
    },
  });

  const handleOpen = (batch = null) => {
    if (batch) {
      setEditingId(batch.id);
      form.setValues({ name: batch.name });
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

  const handleDeleteClick = (batch) => {
    setBatchToDelete(batch);
    setDeleteModalOpened(true);
  };

  const confirmDelete = () => {
    if (batchToDelete) {
      deleteMutation.mutate(batchToDelete.id, {
        onSuccess: () => setDeleteModalOpened(false)
      });
    }
  };

  return (
    <Box p="xl">
      <Flex align="center" justify="space-between" mb={40}>
        <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
          Manage Batches
        </Text>
        <Button 
            onClick={() => handleOpen()} 
            leftSection={<IconPlus size={18} />}
            style={{ backgroundColor: THEME_PRIMARY }}
            radius="md"
        >
            Add New Batch
        </Button>
      </Flex>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {isLoading ? (
            Array(6).fill(0).map((_, i) => (
                <Paper key={i} p="xl" radius="lg" style={{ border: `1px solid ${THEME_LIGHT}22` }}>
                    <Flex align="center" gap="md">
                        <Skeleton h={40} w={40} radius="md" />
                        <Box style={{ flex: 1 }}>
                            <Skeleton h={20} w="70%" mb={8} radius="xs" />
                            <Skeleton h={10} w="40%" radius="xs" />
                        </Box>
                    </Flex>
                </Paper>
            ))
        ) : (
            batches?.map((batch) => (
                <Paper 
                    key={batch.id} 
                    p="xl" 
                    radius="lg" 
                    style={{ 
                        backgroundColor: "#ffffff", 
                        border: `1px solid ${THEME_LIGHT}22`,
                        transition: "transform 0.2s"
                    }}
                >
                    <Flex align="center" justify="space-between">
                        <Group gap="md">
                            <ActionIcon variant="light" color="blueId" size="lg" radius="md">
                                <IconFolders size={20} />
                            </ActionIcon>
                            <Box>
                                <Text fw={700} color={THEME_DARK}>{batch.name}</Text>
                                <Text size="xs" color="dimmed">ID: #{batch.id}</Text>
                            </Box>
                        </Group>

                        <Group gap="xs">
                            <ActionIcon 
                                variant="subtle" 
                                color="blueId" 
                                onClick={() => handleOpen(batch)}
                            >
                                <IconEdit size={18} />
                            </ActionIcon>
                            <ActionIcon 
                                variant="subtle" 
                                color="red" 
                                onClick={() => handleDeleteClick(batch)}
                            >
                                <IconTrash size={18} />
                            </ActionIcon>
                        </Group>
                    </Flex>
                </Paper>
            ))
        )}
      </SimpleGrid>

      <Modal 
        opened={opened} 
        onClose={handleClose} 
        title={<Text fw={700}>{editingId ? "Update Batch" : "Create New Batch"}</Text>}
        centered
        radius="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Batch Name"
              placeholder="e.g. 2024-2025"
              required
              {...form.getInputProps("name")}
            />
            <Flex justify="flex-end" gap="sm" mt="lg">
                <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
                <Button 
                    type="submit" 
                    loading={createMutation.isPending || updateMutation.isPending}
                    style={{ backgroundColor: THEME_PRIMARY }}
                >
                    {editingId ? "Update Batch" : "Create Batch"}
                </Button>
            </Flex>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={<Text fw={700} style={{ color: "#fa5252" }}>Remove Batch</Text>}
        centered
        radius="lg"
      >
        <Stack p="sm">
            <Text size="sm" color={THEME_DARK}>
                Are you sure you want to delete the batch <b>{batchToDelete?.name}</b>? This action cannot be undone.
            </Text>
            <Flex justify="flex-end" gap="sm" mt="lg">
                <Button variant="subtle" color="gray" onClick={() => setDeleteModalOpened(false)}>Cancel</Button>
                <Button 
                    color="red" 
                    radius="md"
                    loading={deleteMutation.isPending}
                    onClick={confirmDelete}
                >
                    Delete Batch
                </Button>
            </Flex>
        </Stack>
      </Modal>
    </Box>
  );
};

export default ManageBatches;
