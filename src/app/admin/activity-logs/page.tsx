'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Container,
  Header,
  Icon,
  Table,
  Message,
  Dropdown,
  Input,
  Button,
  Pagination,
  Label,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'

export default function ActivityLogsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    actor_id: '',
  })

  useEffect(() => {
    if (session && !['ADMIN', 'DEPT_LEAD'].includes(session.user.role)) {
      router.push('/dashboard')
    } else {
      fetchLogs()
    }
  }, [session, pagination.page, filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.action) params.append('action', filters.action)
      if (filters.entity_type) params.append('entity_type', filters.entity_type)
      if (filters.actor_id) params.append('actor_id', filters.actor_id)

      const response = await fetch(`/api/activity-logs?${params}`)
      const result = await response.json()

      if (result.ok) {
        setLogs(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE_PROJECT':
      case 'CREATE_MILESTONE':
      case 'CREATE_DEPARTMENT':
        return 'green'
      case 'UPDATE_PROJECT':
      case 'UPDATE_MILESTONE':
      case 'UPDATE_USER':
        return 'blue'
      case 'DELETE_PROJECT':
      case 'DELETE_MILESTONE':
        return 'red'
      case 'UPLOAD_DOCUMENT':
        return 'purple'
      case 'LOGIN':
        return 'teal'
      default:
        return 'grey'
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE_PROJECT':
        return 'สร้างโครงการ'
      case 'UPDATE_PROJECT':
        return 'แก้ไขโครงการ'
      case 'DELETE_PROJECT':
        return 'ลบโครงการ'
      case 'CREATE_MILESTONE':
        return 'สร้างงวดงาน'
      case 'UPDATE_MILESTONE':
        return 'แก้ไขงวดงาน'
      case 'DELETE_MILESTONE':
        return 'ลบงวดงาน'
      case 'UPLOAD_DOCUMENT':
        return 'อัปโหลดเอกสาร'
      case 'CREATE_DEPARTMENT':
        return 'สร้างแผนก'
      case 'UPDATE_USER':
        return 'แก้ไขผู้ใช้'
      case 'LOGIN':
        return 'เข้าสู่ระบบ'
      default:
        return action
    }
  }

  const actionOptions = [
    { key: '', text: 'ทุกการกระทำ', value: '' },
    { key: 'CREATE_PROJECT', text: 'สร้างโครงการ', value: 'CREATE_PROJECT' },
    { key: 'UPDATE_PROJECT', text: 'แก้ไขโครงการ', value: 'UPDATE_PROJECT' },
    { key: 'DELETE_PROJECT', text: 'ลบโครงการ', value: 'DELETE_PROJECT' },
    { key: 'CREATE_MILESTONE', text: 'สร้างงวดงาน', value: 'CREATE_MILESTONE' },
    { key: 'UPDATE_MILESTONE', text: 'แก้ไขงวดงาน', value: 'UPDATE_MILESTONE' },
    { key: 'DELETE_MILESTONE', text: 'ลบงวดงาน', value: 'DELETE_MILESTONE' },
    { key: 'UPLOAD_DOCUMENT', text: 'อัปโหลดเอกสาร', value: 'UPLOAD_DOCUMENT' },
    { key: 'LOGIN', text: 'เข้าสู่ระบบ', value: 'LOGIN' },
  ]

  const entityOptions = [
    { key: '', text: 'ทุกประเภท', value: '' },
    { key: 'project', text: 'โครงการ', value: 'project' },
    { key: 'milestone', text: 'งวดงาน', value: 'milestone' },
    { key: 'document', text: 'เอกสาร', value: 'document' },
    { key: 'user', text: 'ผู้ใช้', value: 'user' },
    { key: 'department', text: 'แผนก', value: 'department' },
  ]

  if (!session || !['ADMIN', 'DEPT_LEAD'].includes(session.user.role)) {
    return (
      <AppLayout>
        <Container>
          <Message negative>
            <Message.Header>ไม่มีสิทธิ์เข้าถึง</Message.Header>
            <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
          </Message>
        </Container>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Container>
        <Header as="h1">
          <Icon name="history" />
          <Header.Content>
            Activity Logs
            <Header.Subheader>ประวัติการใช้งานระบบ</Header.Subheader>
          </Header.Content>
        </Header>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Dropdown
              placeholder="การกระทำ"
              fluid
              selection
              options={actionOptions}
              value={filters.action}
              onChange={(_: any, { value }: any) =>
                setFilters({ ...filters, action: value as string })
              }
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <Dropdown
              placeholder="ประเภท"
              fluid
              selection
              options={entityOptions}
              value={filters.entity_type}
              onChange={(_: any, { value }: any) =>
                setFilters({ ...filters, entity_type: value as string })
              }
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <Input
              placeholder="User ID..."
              value={filters.actor_id}
              onChange={(e: any) =>
                setFilters({ ...filters, actor_id: e.target.value })
              }
            />
          </div>
          <Button onClick={() => setFilters({ action: '', entity_type: '', actor_id: '' })}>
            ล้างตัวกรอง
          </Button>
        </div>

        {/* Logs Table */}
        {loading ? (
          <Message>กำลังโหลด...</Message>
        ) : (
          <>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={3}>วันที่/เวลา</Table.HeaderCell>
                  <Table.HeaderCell width={3}>ผู้ใช้</Table.HeaderCell>
                  <Table.HeaderCell width={3}>การกระทำ</Table.HeaderCell>
                  <Table.HeaderCell width={2}>ประเภท</Table.HeaderCell>
                  <Table.HeaderCell width={5}>รายละเอียด</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {logs.map((log) => (
                  <Table.Row key={log.id}>
                    <Table.Cell>
                      {new Date(log.created_at).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </Table.Cell>
                    <Table.Cell>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {log.actor?.image && (
                          <img
                            src={log.actor.image}
                            alt={log.actor.name}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              marginRight: '8px',
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{log.actor?.name}</div>
                          <div style={{ fontSize: '0.8em', color: '#666' }}>
                            {log.actor?.email}
                          </div>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Label color={getActionColor(log.action)} size="small">
                        {getActionLabel(log.action)}
                      </Label>
                    </Table.Cell>
                    <Table.Cell>
                      <Label basic size="small">
                        {log.entity_type}
                      </Label>
                    </Table.Cell>
                    <Table.Cell>
                      <div style={{ fontSize: '0.9em' }}>
                        <strong>ID:</strong> {log.entity_id}
                        {log.metadata && (
                          <div style={{ marginTop: '4px', color: '#666' }}>
                            {JSON.stringify(log.metadata, null, 0)}
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Pagination
                  activePage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={(_: any, { activePage }: any) =>
                    setPagination({ ...pagination, page: activePage as number })
                  }
                />
                <div style={{ marginTop: '1rem', color: '#666' }}>
                  แสดง {logs.length} จาก {pagination.total} รายการ
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </AppLayout>
  )
}
