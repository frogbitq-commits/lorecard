import { useState, Fragment } from 'react';
import {
  Modal,
  Table,
  Loader,
  Alert,
  Pagination,
  Group,
  Text,
  Tooltip,
  ActionIcon,
  Collapse,
  Code,
  Stack,
  Box,
  ScrollArea,
  Card,
  Badge,
  SimpleGrid,
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconCircleX, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { useProjectApiRequestLogs } from '../../hooks/useProjectApiRequestLogs';
import { formatDate } from '../../utils/formatDate';
import type { ApiRequestLog } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ApiRequestLogModalProps {
  opened: boolean;
  onClose: () => void;
  projectId: string;
}

const PAGE_SIZE = 30;

function LogRow({ log }: { log: ApiRequestLog }) {
  const [opened, setOpened] = useState(false);

  return (
    <Fragment>
      <Table.Tr>
        <Table.Td>
          <ActionIcon onClick={() => setOpened((o) => !o)} variant="subtle">
            <IconChevronRight
              size={16}
              style={{ transform: opened ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease' }}
            />
          </ActionIcon>
        </Table.Td>
        <Table.Td>
          <Tooltip label={log.error ? 'Failed' : 'Success'}>
            {log.error ? <IconCircleX color="red" /> : <IconCircleCheck color="green" />}
          </Tooltip>
        </Table.Td>
        <Table.Td>{formatDate(log.timestamp)}</Table.Td>
        <Table.Td>{log.model_used}</Table.Td>
        <Table.Td>{log.input_tokens ?? 'N/A'}</Table.Td>
        <Table.Td>{log.output_tokens ?? 'N/A'}</Table.Td>
        <Table.Td>
          {log.calculated_cost !== undefined && log.calculated_cost !== null && log.calculated_cost >= 0
            ? log.calculated_cost.toFixed(6)
            : 'N/A'}
        </Table.Td>
        <Table.Td>{log.latency_ms}</Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td colSpan={8} style={{ padding: 0, border: 0 }}>
          <Collapse in={opened}>
            <Box p="md" bg="dark.6">
              <Stack>
                <Text fw={500}>Request Payload</Text>
                <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(log.request, null, 2)}
                </Code>
                {log.response && (
                  <>
                    <Text fw={500} mt="sm">
                      Response Payload
                    </Text>
                    <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(log.response, null, 2)}
                    </Code>
                  </>
                )}
              </Stack>
            </Box>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </Fragment>
  );
}

function LogCard({ log }: { log: ApiRequestLog }) {
  const [opened, setOpened] = useState(false);

  const cost =
    log.calculated_cost !== undefined && log.calculated_cost !== null && log.calculated_cost >= 0
      ? `$${log.calculated_cost.toFixed(6)}`
      : 'N/A';

  return (
    <Card withBorder p="sm">
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          {log.error ? <IconCircleX color="red" size={20} /> : <IconCircleCheck color="green" size={20} />}
          <Badge color={log.error ? 'red' : 'green'} variant="light" size="sm">
            {log.error ? 'Failed' : 'Success'}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {formatDate(log.timestamp)}
        </Text>
      </Group>

      <Text fw={500} size="sm" mb="xs" truncate>
        {log.model_used}
      </Text>

      <SimpleGrid cols={2} spacing="xs">
        <Box>
          <Text size="xs" c="dimmed">
            Input
          </Text>
          <Text size="sm">{log.input_tokens ?? 'N/A'}</Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">
            Output
          </Text>
          <Text size="sm">{log.output_tokens ?? 'N/A'}</Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">
            Cost
          </Text>
          <Text size="sm">{cost}</Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">
            Latency
          </Text>
          <Text size="sm">{log.latency_ms} ms</Text>
        </Box>
      </SimpleGrid>

      <ActionIcon onClick={() => setOpened((o) => !o)} variant="subtle" size="sm" mt="xs">
        {opened ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
      </ActionIcon>

      <Collapse in={opened}>
        <Box mt="xs" p="xs" bg="dark.6" style={{ borderRadius: 4 }}>
          <Stack gap="xs">
            <Text fw={500} size="sm">
              Request
            </Text>
            <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 11 }}>
              {JSON.stringify(log.request, null, 2)}
            </Code>
            {log.response && (
              <>
                <Text fw={500} size="sm">
                  Response
                </Text>
                <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 11 }}>
                  {JSON.stringify(log.response, null, 2)}
                </Code>
              </>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Card>
  );
}

export function ApiRequestLogModal({ opened, onClose, projectId }: ApiRequestLogModalProps) {
  const [activePage, setPage] = useState(1);
  const isMobile = useIsMobile();
  const { data, isLoading, isError, error } = useProjectApiRequestLogs(projectId, {
    page: activePage,
    pageSize: PAGE_SIZE,
  });

  const logs = data?.data || [];
  const totalItems = data?.meta.total_items || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <Modal opened={opened} onClose={onClose} title="API Request Logs" size="90%" fullScreen={isMobile}>
      {isLoading && <Loader />}
      {isError && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
          Failed to load API logs: {error.message}
        </Alert>
      )}
      {!isLoading && !isError && (
        <>
          {/* Mobile card view */}
          <Box hiddenFrom="sm">
            <Stack gap="sm">
              {logs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </Stack>
          </Box>

          {/* Desktop table view */}
          <Box visibleFrom="sm">
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder style={{ minWidth: 700 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 40 }} />
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Timestamp</Table.Th>
                    <Table.Th>Model</Table.Th>
                    <Table.Th>Input Tokens</Table.Th>
                    <Table.Th>Output Tokens</Table.Th>
                    <Table.Th>Cost ($)</Table.Th>
                    <Table.Th>Latency (ms)</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {logs.map((log) => (
                    <LogRow key={log.id} log={log} />
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>

          {logs.length === 0 && (
            <Text c="dimmed" ta="center" p="md">
              No API requests have been logged for this project.
            </Text>
          )}
          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination value={activePage} onChange={setPage} total={totalPages} />
            </Group>
          )}
        </>
      )}
    </Modal>
  );
}
