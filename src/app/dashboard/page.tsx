'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Grid,
  Segment,
  Statistic,
  Header,
  Icon,
  Card,
  Label,
  Table,
  Message,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalProjects: number
  activeProjects: number
  overdueProjects: number
  completedProjects: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    overdueProjects: 0,
    completedProjects: 0,
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/projects')
      const result = await response.json()

      if (result.ok) {
        const projects = result.data
        setRecentProjects(projects.slice(0, 5))

        // คำนวณสถิติ
        setStats({
          totalProjects: projects.length,
          activeProjects: projects.filter((p: any) => p.status === 'active').length,
          overdueProjects: 0, // TODO: คำนวณจากงวดที่เลยกำหนด
          completedProjects: projects.filter((p: any) => p.status === 'completed')
            .length,
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
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

  return (
    <AppLayout>
      <div>
        <Header as="h1">
          <Icon name="dashboard" />
          <Header.Content>
            Dashboard
            <Header.Subheader>ภาพรวมระบบจัดการโครงการ</Header.Subheader>
          </Header.Content>
        </Header>

        {session && (
          <Message info>
            <Message.Header>ยินดีต้อนรับ, {session.user.name}!</Message.Header>
            <p>
              แผนก: {session.user.department?.name || 'ไม่มีแผนก'} | บทบาท:{' '}
              {session.user.role}
            </p>
          </Message>
        )}

        {/* สถิติรวม */}
        <Grid columns={4} stackable style={{ marginTop: '2rem' }}>
          <Grid.Column>
            <Segment textAlign="center">
              <Statistic size="small">
                <Statistic.Value>
                  <Icon name="folder" />
                  {stats.totalProjects}
                </Statistic.Value>
                <Statistic.Label>โครงการทั้งหมด</Statistic.Label>
              </Statistic>
            </Segment>
          </Grid.Column>

          <Grid.Column>
            <Segment textAlign="center" color="green">
              <Statistic size="small" color="green">
                <Statistic.Value>
                  <Icon name="play circle" />
                  {stats.activeProjects}
                </Statistic.Value>
                <Statistic.Label>กำลังดำเนินการ</Statistic.Label>
              </Statistic>
            </Segment>
          </Grid.Column>

          <Grid.Column>
            <Segment textAlign="center" color="red">
              <Statistic size="small" color="red">
                <Statistic.Value>
                  <Icon name="warning sign" />
                  {stats.overdueProjects}
                </Statistic.Value>
                <Statistic.Label>เลยกำหนด</Statistic.Label>
              </Statistic>
            </Segment>
          </Grid.Column>

          <Grid.Column>
            <Segment textAlign="center" color="blue">
              <Statistic size="small" color="blue">
                <Statistic.Value>
                  <Icon name="check circle" />
                  {stats.completedProjects}
                </Statistic.Value>
                <Statistic.Label>เสร็จสิ้น</Statistic.Label>
              </Statistic>
            </Segment>
          </Grid.Column>
        </Grid>

        {/* โครงการล่าสุด */}
        <Segment style={{ marginTop: '2rem' }}>
          <Header as="h2">
            <Icon name="clock outline" />
            <Header.Content>โครงการล่าสุด</Header.Content>
          </Header>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Icon loading name="spinner" size="large" />
            </div>
          ) : recentProjects.length === 0 ? (
            <Message info>
              <Message.Header>ยังไม่มีโครงการ</Message.Header>
              <p>เริ่มต้นสร้างโครงการแรกของคุณได้เลย</p>
            </Message>
          ) : (
            <Table celled selectable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>รหัส</Table.HeaderCell>
                  <Table.HeaderCell>ชื่อโครงการ</Table.HeaderCell>
                  <Table.HeaderCell>แผนก</Table.HeaderCell>
                  <Table.HeaderCell>ปีงบประมาณ</Table.HeaderCell>
                  <Table.HeaderCell>สถานะ</Table.HeaderCell>
                  <Table.HeaderCell>จำนวนงวด</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {recentProjects.map((project) => (
                  <Table.Row
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Table.Cell>{project.code}</Table.Cell>
                    <Table.Cell>
                      <strong>{project.name}</strong>
                    </Table.Cell>
                    <Table.Cell>{project.department?.name}</Table.Cell>
                    <Table.Cell>{project.fiscal_year}</Table.Cell>
                    <Table.Cell>
                      <Label color={getStatusColor(project.status)} size="small">
                        {getStatusLabel(project.status)}
                      </Label>
                    </Table.Cell>
                    <Table.Cell>{project.milestones?.length || 0}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Segment>
      </div>
    </AppLayout>
  )
}
