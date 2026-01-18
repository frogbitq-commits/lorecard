import { Title, Table, Group, Text, ActionIcon, Stack, Skeleton, Button, Box, Card, Badge } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import type { Credential } from '../types';
import { useModals } from '@mantine/modals';
import { formatDate } from '../utils/formatDate';
import { useCredentials } from '../hooks/useCredentials';
import { CredentialModal } from '../components/credentials/CredentialModal';
import { useDeleteCredential } from '../hooks/useCredentialsMutations';

function CredentialCard({
  credential,
  onEdit,
  onDelete,
}: {
  credential: Credential;
  onEdit: (credential: Credential) => void;
  onDelete: (credential: Credential) => void;
}) {
  return (
    <Card withBorder p="sm">
      <Group justify="space-between" mb="xs">
        <Text fw={500} truncate style={{ flex: 1 }}>
          {credential.name}
        </Text>
        <Badge variant="light" size="sm">
          {credential.provider_type}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed" mb="sm">
        Updated: {formatDate(credential.updated_at)}
      </Text>

      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={() => onEdit(credential)} aria-label={`Edit ${credential.name}`}>
          <IconPencil size={16} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => onDelete(credential)}
          aria-label={`Delete ${credential.name}`}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Card>
  );
}

export function CredentialsPage() {
  const { data: credentials, isLoading, error } = useCredentials();
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const modals = useModals();
  const deleteCredentialMutation = useDeleteCredential();

  const openDeleteModal = (credential: Credential) =>
    modals.openConfirmModal({
      title: 'Delete Credential',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the credential "<strong>{credential.name}</strong>"? This action is
          irreversible.
        </Text>
      ),
      labels: { confirm: 'Delete Credential', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteCredentialMutation.mutate(credential.id),
    });

  const handleOpenCreateModal = () => {
    setSelectedCredential(null);
    openModal();
  };

  const handleOpenEditModal = (credential: Credential) => {
    setSelectedCredential(credential);
    openModal();
  };

  const rows = credentials?.map((cred) => (
    <Table.Tr key={cred.id}>
      <Table.Td>
        <Text fw={500}>{cred.name}</Text>
      </Table.Td>
      <Table.Td>{cred.provider_type}</Table.Td>
      <Table.Td>{formatDate(cred.updated_at)}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleOpenEditModal(cred)} aria-label={`Edit ${cred.name}`}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => openDeleteModal(cred)}
            aria-label={`Delete ${cred.name}`}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const loadingRows = Array.from({ length: 3 }).map((_, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={8} mt={6} width="50%" radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={8} mt={6} width="60%" radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={16} width={16} radius="sm" />
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <CredentialModal opened={modalOpened} onClose={closeModal} credential={selectedCredential} />
      <Stack>
        <Group justify="space-between">
          <Title order={1}>Credentials</Title>
          <Button onClick={handleOpenCreateModal}>Add New Credential</Button>
        </Group>

        {error && <Text color="red">Failed to load credentials: {error.message}</Text>}

        {/* Mobile card view */}
        <Box hiddenFrom="sm">
          {isLoading ? (
            <Stack gap="sm">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} withBorder p="sm">
                  <Skeleton height={16} width="70%" mb="xs" />
                  <Skeleton height={12} width="50%" mb="sm" />
                  <Group gap="xs">
                    <Skeleton height={28} width={28} radius="sm" />
                    <Skeleton height={28} width={28} radius="sm" />
                  </Group>
                </Card>
              ))}
            </Stack>
          ) : credentials?.length ? (
            <Stack gap="sm">
              {credentials.map((credential) => (
                <CredentialCard
                  key={credential.id}
                  credential={credential}
                  onEdit={handleOpenEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" ta="center" p="md">
              No credentials found. Create one to get started!
            </Text>
          )}
        </Box>

        {/* Desktop table view */}
        <Box visibleFrom="sm">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Provider Type</Table.Th>
                <Table.Th>Last Updated</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                loadingRows
              ) : rows?.length ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" ta="center">
                      No credentials found. Create one to get started!
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Stack>
    </>
  );
}
