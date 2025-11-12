'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Container,
  Header,
  Icon,
  Table,
  Label,
  Segment,
  Input,
  Dropdown,
  Grid,
  Message,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'
import { useSession } from 'next-auth/react'

export default function ProjectsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fiscalYearFilter, setFiscalYearFilter] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [statusFilter, fiscalYearFilter])

  const fetchProjects = async () => {
    try {
      let url = '/api/projects?'
      if (statusFilter) url += `status=${statusFilter}&`
      if (fiscalYearFilter) url += `fiscal_year=${fiscalYearFilter}&`

      const response = await fetch(url)
      const result = await response.json()

      if (result.ok) {
        setProjects(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'completed':
        return 'blue'
      case 'on_hold':
        return 'yellow'
      case 'cancelled':
        return 'red'
      default:
        return 'grey'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'ดำเนินการ'
      case 'completed':
        return 'เสร็จสิ้น'
      case 'on_hold':
        return 'พักไว้'
      case 'cancelled':
        return 'ยกเลิก'
      default:
        return status
    }
  }

  const canCreateProject = session?.user.role && ['ADMIN', 'DEPT_LEAD', 'PM'].includes(session.user.role)

  return (
    <AppLayout>
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <Header as="h1">
                <Icon name="briefcase" />
                <Header.Content>
                  โครงการทั้งหมด
                  <Header.Subheader>จัดการและติดตามโครงการ</Header.Subheader>
                </Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={4} textAlign="right">
              {canCreateProject && (
                <Button
                  primary
                  icon
                  labelPosition="left"
                  onClick={() => router.push('/projects/new')}
                >
                  <Icon name="plus" />
                  สร้างโครงการใหม่
                </Button>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Filters */}
        <Segment>
          <Grid>
            <Grid.Row>
              <Grid.Column width={8}>
                <Input
                  icon="search"
                  placeholder="ค้นหาโครงการ..."
                  fluid
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid.Column>
              <Grid.Column width={4}>
                <Dropdown
                  placeholder="สถานะ"
                  fluid
                  selection
                  clearable
                  options={[
                    { key: 'active', text: 'ดำเนินการ', value: 'active' },
                    { key: 'completed', text: 'เสร็จสิ้น', value: 'completed' },
                    { key: 'on_hold', text: 'พักไว้', value: 'on_hold' },
                    { key: 'cancelled', text: 'ยกเลิก', value: 'cancelled' },
                  ]}
                  value={statusFilter}
                  onChange={(_, { value }) => setStatusFilter(value as string)}
                />
              </Grid.Column>
              <Grid.Column width={4}>
                <Dropdown
                  placeholder="ปีงบประมาณ"
                  fluid
                  selection
                  clearable
                  options={[
                    { key: '2567', text: '2567', value: '2567' },
                    { key: '2568', text: '2568', value: '2568' },
                    { key: '2569', text: '2569', value: '2569' },
                  ]}
                  value={fiscalYearFilter}
                  onChange={(_, { value }) => setFiscalYearFilter(value as string)}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>

        {/* Projects Table */}
        <Segment loading={loading}>
          {filteredProjects.length === 0 ? (
            <Message info>
              <Message.Header>ไม่พบโครงการ</Message.Header>
              <p>
                {canCreateProject
                  ? 'เริ่มต้นสร้างโครงการแรกของคุณได้เลย'
                  : 'ยังไม่มีโครงการในระบบ'}
              </p>
            </Message>
          ) : (
            <Table celled selectable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>รหัส</Table.HeaderCell>
                  <Table.HeaderCell>ชื่อโครงการ</Table.HeaderCell>
                  <Table.HeaderCell>แผนก</Table.HeaderCell>
                  <Table.HeaderCell>ปีงบประมาณ</Table.HeaderCell>
                  <Table.HeaderCell>เจ้าของโครงการ</Table.HeaderCell>
                  <Table.HeaderCell>สถานะ</Table.HeaderCell>
                  <Table.HeaderCell>จำนวนงวด</Table.HeaderCell>
                  <Table.HeaderCell>การดำเนินการ</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {filteredProjects.map((project) => (
                  <Table.Row
                    key={project.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <Table.Cell>
                      <strong>{project.code}</strong>
                    </Table.Cell>
                    <Table.Cell>{project.name}</Table.Cell>
                    <Table.Cell>{project.department?.name}</Table.Cell>
                    <Table.Cell>{project.fiscal_year}</Table.Cell>
                    <Table.Cell>{project.owner?.name || '-'}</Table.Cell>
                    <Table.Cell>
                      <Label color={getStatusColor(project.status)} size="small">
                        {getStatusLabel(project.status)}
                      </Label>
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {project.milestones?.length || 0}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        icon
                        size="mini"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/projects/${project.id}`)
                        }}
                      >
                        <Icon name="eye" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Segment>
      </Container>
    </AppLayout>
  )
}
