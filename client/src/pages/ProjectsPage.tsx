import { Title, Table, Group, Text, ActionIcon, Badge, Stack, Skeleton, Button, Box, Card } from '@mantine/core';
import { useProjects } from '../hooks/useProjects';
import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { ProjectModal } from '../components/projects/ProjectModal';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import type { Project } from '../types';
import { useModals } from '@mantine/modals';
import { useDeleteProject } from '../hooks/useProjectMutations';

const statusColors: Record<string, string> = {
  draft: 'gray',
  selector_generated: 'blue',
  links_extracted: 'cyan',
  processing: 'yellow',
  completed: 'green',
  failed: 'red',
};

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  return (
    <Card withBorder p="sm">
      <Group justify="space-between" mb="xs">
        <Text fw={500} truncate style={{ flex: 1 }}>
          {project.name}
        </Text>
        <Badge color={statusColors[project.status]} variant="light" size="sm">
          {project.status.replace('_', ' ')}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed" mb="xs" truncate>
        {project.id}
      </Text>

      <Text size="xs" c="dimmed" mb="sm">
        Updated: {formatDate(project.updated_at)}
      </Text>

      <Group gap="xs">
        <ActionIcon
          component={Link}
          to={`/projects/${project.id}`}
          variant="subtle"
          aria-label={`View project ${project.name}`}
        >
          <IconEye size={16} />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => onEdit(project)} aria-label={`Edit project ${project.name}`}>
          <IconPencil size={16} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => onDelete(project)}
          aria-label={`Delete project ${project.name}`}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Card>
  );
}

export function ProjectsPage() {
  const { data, isLoading, error } = useProjects();
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const modals = useModals();
  const deleteProjectMutation = useDeleteProject();

  const openDeleteModal = (project: Project) =>
    modals.openConfirmModal({
      title: 'Delete Project',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the project "<strong>{project.name}</strong>"? This action is irreversible and
          will delete all associated data.
        </Text>
      ),
      labels: { confirm: 'Delete Project', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteProjectMutation.mutate(project.id),
    });

  const handleOpenCreateModal = () => {
    setSelectedProject(null);
    openModal();
  };

  const handleOpenEditModal = (project: Project) => {
    setSelectedProject(project);
    openModal();
  };

  const rows = data?.data.map((project) => (
    <Table.Tr key={project.id}>
      <Table.Td>
        <Text fw={500}>{project.name}</Text>
        <Text size="xs" c="dimmed">
          {project.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={statusColors[project.status]} variant="light">
          {project.status.replace('_', ' ')}
        </Badge>
      </Table.Td>
      <Table.Td>{formatDate(project.updated_at)}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            component={Link}
            to={`/projects/${project.id}`}
            variant="subtle"
            aria-label={`View project ${project.name}`}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            onClick={() => handleOpenEditModal(project)}
            aria-label={`Edit project ${project.name}`}
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => openDeleteModal(project)}
            aria-label={`Delete project ${project.name}`}
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
        <Skeleton height={8} mt={6} width="40%" radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={12} mt={6} width="50px" radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={8} mt={6} width="60%" radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={16} width={16} radius="sm" />
        <Skeleton height={16} ml={8} width={16} radius="sm" />
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <ProjectModal opened={modalOpened} onClose={closeModal} project={selectedProject} />
      <Stack>
        <Group justify="space-between">
          <Title order={1}>Projects</Title>
          <Button onClick={handleOpenCreateModal}>Create New Project</Button>
        </Group>

        {error && <Text color="red">Failed to load projects: {error.message}</Text>}

        {/* Mobile card view */}
        <Box hiddenFrom="sm">
          {isLoading ? (
            <Stack gap="sm">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} withBorder p="sm">
                  <Skeleton height={16} width="70%" mb="xs" />
                  <Skeleton height={12} width="40%" mb="xs" />
                  <Skeleton height={12} width="50%" mb="sm" />
                  <Group gap="xs">
                    <Skeleton height={28} width={28} radius="sm" />
                    <Skeleton height={28} width={28} radius="sm" />
                    <Skeleton height={28} width={28} radius="sm" />
                  </Group>
                </Card>
              ))}
            </Stack>
          ) : data?.data.length ? (
            <Stack gap="sm">
              {data.data.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleOpenEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" ta="center" p="md">
              No projects found. Create one to get started!
            </Text>
          )}
        </Box>

        {/* Desktop table view */}
        <Box visibleFrom="sm">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name / ID</Table.Th>
                <Table.Th>Status</Table.Th>
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
                      No projects found. Create one to get started!
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
