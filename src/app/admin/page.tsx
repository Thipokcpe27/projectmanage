'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Container,
  Header,
  Icon,
  Card,
  Statistic,
  Grid,
  Message,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    users: 0,
    departments: 0,
    projects: 0,
    documents: 0,
  })

  useEffect(() => {
    // ตรวจสอบสิทธิ์
    if (session && !['ADMIN', 'DEPT_LEAD'].includes(session.user.role)) {
      router.push('/dashboard')
    }
  }, [session, router])

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
          <Icon name="settings" />
          <Header.Content>
            จัดการระบบ
            <Header.Subheader>Admin Dashboard</Header.Subheader>
          </Header.Content>
        </Header>

        {/* Statistics */}
        <Grid columns={4} stackable style={{ marginTop: '2rem' }}>
          <Grid.Column>
            <Statistic size="small">
              <Statistic.Value>
                <Icon name="users" />
                {stats.users}
              </Statistic.Value>
              <Statistic.Label>ผู้ใช้งาน</Statistic.Label>
            </Statistic>
          </Grid.Column>
          <Grid.Column>
            <Statistic size="small">
              <Statistic.Value>
                <Icon name="building" />
                {stats.departments}
              </Statistic.Value>
              <Statistic.Label>แผนก</Statistic.Label>
            </Statistic>
          </Grid.Column>
          <Grid.Column>
            <Statistic size="small">
              <Statistic.Value>
                <Icon name="folder" />
                {stats.projects}
              </Statistic.Value>
              <Statistic.Label>โครงการ</Statistic.Label>
            </Statistic>
          </Grid.Column>
          <Grid.Column>
            <Statistic size="small">
              <Statistic.Value>
                <Icon name="file" />
                {stats.documents}
              </Statistic.Value>
              <Statistic.Label>เอกสาร</Statistic.Label>
            </Statistic>
          </Grid.Column>
        </Grid>

        {/* Admin Menu */}
        <Header as="h2" style={{ marginTop: '3rem' }}>
          <Icon name="list" />
          เมนูจัดการ
        </Header>

        <Card.Group itemsPerRow={3} stackable>
          <Card
            link
            onClick={() => router.push('/admin/users')}
            color="blue"
          >
            <Card.Content textAlign="center">
              <Icon name="users" size="huge" color="blue" />
              <Card.Header style={{ marginTop: '1rem' }}>
                จัดการผู้ใช้งาน
              </Card.Header>
              <Card.Meta>Users Management</Card.Meta>
              <Card.Description>
                จัดการบทบาท สิทธิ์ และข้อมูลผู้ใช้งาน
              </Card.Description>
            </Card.Content>
          </Card>

          <Card
            link
            onClick={() => router.push('/admin/departments')}
            color="green"
          >
            <Card.Content textAlign="center">
              <Icon name="building" size="huge" color="green" />
              <Card.Header style={{ marginTop: '1rem' }}>
                จัดการแผนก
              </Card.Header>
              <Card.Meta>Departments Management</Card.Meta>
              <Card.Description>
                เพิ่ม แก้ไข และจัดการแผนกต่าง ๆ
              </Card.Description>
            </Card.Content>
          </Card>

          <Card
            link
            onClick={() => router.push('/admin/templates')}
            color="orange"
          >
            <Card.Content textAlign="center">
              <Icon name="file alternate outline" size="huge" color="orange" />
              <Card.Header style={{ marginTop: '1rem' }}>
                เทมเพลตเอกสาร
              </Card.Header>
              <Card.Meta>Document Templates</Card.Meta>
              <Card.Description>
                จัดการเทมเพลตเอกสารและเช็กลิสต์
              </Card.Description>
            </Card.Content>
          </Card>

          <Card
            link
            onClick={() => router.push('/admin/reports')}
            color="purple"
          >
            <Card.Content textAlign="center">
              <Icon name="chart bar" size="huge" color="purple" />
              <Card.Header style={{ marginTop: '1rem' }}>
                รายงาน
              </Card.Header>
              <Card.Meta>Reports</Card.Meta>
              <Card.Description>
                ดูและส่งออกรายงานต่าง ๆ
              </Card.Description>
            </Card.Content>
          </Card>

          <Card
            link
            onClick={() => router.push('/admin/activity-logs')}
            color="teal"
          >
            <Card.Content textAlign="center">
              <Icon name="history" size="huge" color="teal" />
              <Card.Header style={{ marginTop: '1rem' }}>
                Activity Logs
              </Card.Header>
              <Card.Meta>System Logs</Card.Meta>
              <Card.Description>
                ดูประวัติการใช้งานระบบ
              </Card.Description>
            </Card.Content>
          </Card>

          <Card
            link
            onClick={() => router.push('/admin/settings')}
            color="grey"
          >
            <Card.Content textAlign="center">
              <Icon name="cog" size="huge" color="grey" />
              <Card.Header style={{ marginTop: '1rem' }}>
                ตั้งค่าระบบ
              </Card.Header>
              <Card.Meta>System Settings</Card.Meta>
              <Card.Description>
                ตั้งค่าทั่วไปของระบบ
              </Card.Description>
            </Card.Content>
          </Card>
        </Card.Group>
      </Container>
    </AppLayout>
  )
}
