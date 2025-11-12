'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Container,
  Grid,
  Header,
  Icon,
  Segment,
  Button,
  Label,
  Table,
  Progress,
  Message,
  Tab,
  Breadcrumb,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      const result = await response.json()

      if (result.ok) {
        setProject(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'grey'
      case 'in_progress':
        return 'blue'
      case 'completed':
        return 'green'
      case 'overdue':
        return 'red'
      default:
        return 'grey'
    }
  }

  const calculateProgress = () => {
    if (!project?.milestones || project.milestones.length === 0) return 0
    const completed = project.milestones.filter(
      (m: any) => m.status === 'completed'
    ).length
    return Math.round((completed / project.milestones.length) * 100)
  }

  const canEdit = () => {
    if (!session?.user) return false
    const role = session.user.role
    return (
      role === 'ADMIN' ||
      (role === 'DEPT_LEAD' && session.user.departmentId === project?.departmentId) ||
      (role === 'PM' && session.user.id === project?.ownerId)
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <Container>
          <Segment loading style={{ minHeight: '400px' }} />
        </Container>
      </AppLayout>
    )
  }

  if (!project) {
    return (
      <AppLayout>
        <Container>
          <Message negative>
            <Message.Header>ไม่พบโครงการ</Message.Header>
            <p>โครงการที่คุณค้นหาไม่มีอยู่ในระบบ</p>
          </Message>
        </Container>
      </AppLayout>
    )
  }

  const panes = [
    {
      menuItem: 'ภาพรวม',
      render: () => (
        <Tab.Pane>
          <Grid>
            <Grid.Row>
              <Grid.Column width={16}>
                <Header as="h3">
                  <Icon name="info circle" />
                  <Header.Content>ข้อมูลโครงการ</Header.Content>
                </Header>
                <Table definition>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell width={4}>รหัสโครงการ</Table.Cell>
                      <Table.Cell>
                        <strong>{project.code}</strong>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>ชื่อโครงการ</Table.Cell>
                      <Table.Cell>{project.name}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>คำอธิบาย</Table.Cell>
                      <Table.Cell>{project.description || '-'}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>แผนก</Table.Cell>
                      <Table.Cell>{project.department?.name}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>ปีงบประมาณ</Table.Cell>
                      <Table.Cell>{project.fiscal_year}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>เจ้าของโครงการ</Table.Cell>
                      <Table.Cell>{project.owner?.name || '-'}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>งบประมาณ</Table.Cell>
                      <Table.Cell>
                        {project.budget
                          ? `${Number(project.budget).toLocaleString()} บาท`
                          : '-'}
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>วันที่เริ่ม - สิ้นสุด</Table.Cell>
                      <Table.Cell>
                        {new Date(project.start_date).toLocaleDateString('th-TH')} -{' '}
                        {new Date(project.end_date).toLocaleDateString('th-TH')}
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>สถานะ</Table.Cell>
                      <Table.Cell>
                        <Label color={getStatusColor(project.status)}>
                          {project.status}
                        </Label>
                      </Table.Cell>
                    </Table.Row>
                    {project.drive_folder_id && (
                      <Table.Row>
                        <Table.Cell>Google Drive</Table.Cell>
                        <Table.Cell>
                          <Button
                            as="a"
                            href={`https://drive.google.com/drive/folders/${project.drive_folder_id}`}
                            target="_blank"
                            size="small"
                            icon
                            labelPosition="left"
                          >
                            <Icon name="google drive" />
                            เปิดโฟลเดอร์
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Tab.Pane>
      ),
    },
    {
      menuItem: `งวดงาน (${project.milestones?.length || 0})`,
      render: () => (
        <Tab.Pane>
          <Header as="h3">
            <Icon name="tasks" />
            <Header.Content>งวดงานทั้งหมด</Header.Content>
          </Header>

          {project.milestones && project.milestones.length > 0 ? (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={1}>งวดที่</Table.HeaderCell>
                  <Table.HeaderCell>ชื่องวด</Table.HeaderCell>
                  <Table.HeaderCell width={2}>กำหนดส่ง</Table.HeaderCell>
                  <Table.HeaderCell width={2}>น้ำหนัก</Table.HeaderCell>
                  <Table.HeaderCell width={2}>สถานะ</Table.HeaderCell>
                  <Table.HeaderCell width={2}>เอกสาร</Table.HeaderCell>
                  <Table.HeaderCell width={2}>การดำเนินการ</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {project.milestones.map((milestone: any) => (
                  <Table.Row key={milestone.id}>
                    <Table.Cell textAlign="center">
                      <strong>{milestone.index_no}</strong>
                    </Table.Cell>
                    <Table.Cell>
                      <Header as="h5">{milestone.name}</Header>
                      {milestone.description && (
                        <p style={{ color: '#666', fontSize: '0.9em' }}>
                          {milestone.description}
                        </p>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(milestone.due_date).toLocaleDateString('th-TH')}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {milestone.weight_percent
                        ? `${milestone.weight_percent}%`
                        : '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <Label color={getMilestoneStatusColor(milestone.status)}>
                        {milestone.status}
                      </Label>
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {milestone.documents?.length || 0} ไฟล์
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        size="mini"
                        icon
                        onClick={() =>
                          router.push(
                            `/projects/${project.id}/milestones/${milestone.id}`
                          )
                        }
                      >
                        <Icon name="eye" />
                      </Button>
                      {milestone.drive_folder_id && (
                        <Button
                          as="a"
                          href={`https://drive.google.com/drive/folders/${milestone.drive_folder_id}`}
                          target="_blank"
                          size="mini"
                          icon
                          color="google plus"
                        >
                          <Icon name="google drive" />
                        </Button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <Message info>
              <Message.Header>ยังไม่มีงวดงาน</Message.Header>
              <p>เริ่มต้นสร้างงวดงานแรกของโครงการนี้</p>
            </Message>
          )}
        </Tab.Pane>
      ),
    },
  ]

  return (
    <AppLayout>
      <Container>
        {/* Breadcrumb */}
        <Breadcrumb>
          <Breadcrumb.Section link onClick={() => router.push('/dashboard')}>
            Dashboard
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section link onClick={() => router.push('/projects')}>
            โครงการ
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section active>{project.code}</Breadcrumb.Section>
        </Breadcrumb>

        {/* Header */}
        <Grid style={{ marginTop: '1rem' }}>
          <Grid.Row>
            <Grid.Column width={12}>
              <Header as="h1">
                <Icon name="folder open" />
                <Header.Content>
                  {project.name}
                  <Header.Subheader>{project.code}</Header.Subheader>
                </Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={4} textAlign="right">
              {canEdit() && (
                <Button
                  primary
                  icon
                  labelPosition="left"
                  onClick={() => router.push(`/projects/${project.id}/edit`)}
                >
                  <Icon name="edit" />
                  แก้ไข
                </Button>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Progress */}
        <Segment>
          <Header as="h4">
            <Icon name="chart line" />
            ความคืบหน้าโครงการ
          </Header>
          <Progress
            percent={calculateProgress()}
            indicating
            progress
            size="large"
          />
        </Segment>

        {/* Tabs */}
        <Tab panes={panes} />
      </Container>
    </AppLayout>
  )
}
