'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Header,
  Icon,
  Segment,
  Table,
  Label,
  Message,
  Card,
  Statistic,
  Grid,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [userStats, setUserStats] = useState({
    projectsOwned: 0,
    documentsUploaded: 0,
    activitiesCount: 0,
  })

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
    } else {
      // Mock stats - จะเชื่อมต่อ API จริงภายหลัง
      setUserStats({
        projectsOwned: 5,
        documentsUploaded: 23,
        activitiesCount: 47,
      })
    }
  }, [session, router])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'red'
      case 'DEPT_LEAD':
        return 'orange'
      case 'PM':
        return 'blue'
      case 'MEMBER':
        return 'green'
      default:
        return 'grey'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'ผู้ดูแลระบบ'
      case 'DEPT_LEAD':
        return 'หัวหน้าแผนก'
      case 'PM':
        return 'ผู้จัดการโครงการ'
      case 'MEMBER':
        return 'สมาชิก'
      case 'READONLY':
        return 'ดูอย่างเดียว'
      default:
        return role
    }
  }

  if (!session) {
    return (
      <AppLayout>
        <Container>
          <Message>กำลังโหลด...</Message>
        </Container>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Container>
        <Header as="h1">
          <Icon name="user" />
          <Header.Content>
            โปรไฟล์ของฉัน
            <Header.Subheader>ข้อมูลส่วนตัวและสถิติการใช้งาน</Header.Subheader>
          </Header.Content>
        </Header>

        <Grid>
          <Grid.Row>
            {/* Profile Info */}
            <Grid.Column width={10}>
              <Segment>
                <Header as="h3">
                  <Icon name="info circle" />
                  ข้อมูลส่วนตัว
                </Header>

                <Table definition>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell width={4}>รูปโปรไฟล์</Table.Cell>
                      <Table.Cell>
                        {session.user.image && (
                          <img
                            src={session.user.image}
                            alt={session.user.name}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                            }}
                          />
                        )}
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>ชื่อ</Table.Cell>
                      <Table.Cell>
                        <strong>{session.user.name}</strong>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>อีเมล</Table.Cell>
                      <Table.Cell>{session.user.email}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>บทบาท</Table.Cell>
                      <Table.Cell>
                        <Label color={getRoleColor(session.user.role)} size="medium">
                          {getRoleLabel(session.user.role)}
                        </Label>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>แผนก</Table.Cell>
                      <Table.Cell>
                        {session.user.department?.name || 'ไม่ได้ระบุ'}
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>สถานะ</Table.Cell>
                      <Table.Cell>
                        <Label color={session.user.is_active ? 'green' : 'grey'}>
                          {session.user.is_active ? 'ใช้งาน' : 'ระงับ'}
                        </Label>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>เข้าร่วมเมื่อ</Table.Cell>
                      <Table.Cell>
                        {session.user.created_at
                          ? new Date(session.user.created_at).toLocaleDateString('th-TH')
                          : '-'}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Segment>
            </Grid.Column>

            {/* Statistics */}
            <Grid.Column width={6}>
              <Segment>
                <Header as="h3">
                  <Icon name="chart bar" />
                  สถิติการใช้งาน
                </Header>

                <Card.Group itemsPerRow={1}>
                  <Card>
                    <Card.Content textAlign="center">
                      <Statistic size="small" color="blue">
                        <Statistic.Value>
                          <Icon name="folder" />
                          {userStats.projectsOwned}
                        </Statistic.Value>
                        <Statistic.Label>โครงการที่รับผิดชอบ</Statistic.Label>
                      </Statistic>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Content textAlign="center">
                      <Statistic size="small" color="green">
                        <Statistic.Value>
                          <Icon name="file" />
                          {userStats.documentsUploaded}
                        </Statistic.Value>
                        <Statistic.Label>เอกสารที่อัปโหลด</Statistic.Label>
                      </Statistic>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Content textAlign="center">
                      <Statistic size="small" color="orange">
                        <Statistic.Value>
                          <Icon name="history" />
                          {userStats.activitiesCount}
                        </Statistic.Value>
                        <Statistic.Label>กิจกรรมทั้งหมด</Statistic.Label>
                      </Statistic>
                    </Card.Content>
                  </Card>
                </Card.Group>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Permissions */}
        <Segment style={{ marginTop: '2rem' }}>
          <Header as="h3">
            <Icon name="key" />
            สิทธิ์การใช้งาน
          </Header>

          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>ฟีเจอร์</Table.HeaderCell>
                <Table.HeaderCell width={3}>สิทธิ์</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row>
                <Table.Cell>ดูโครงการ</Table.Cell>
                <Table.Cell>
                  <Icon name="check" color="green" /> อนุญาต
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>สร้างโครงการ</Table.Cell>
                <Table.Cell>
                  {['ADMIN', 'DEPT_LEAD', 'PM'].includes(session.user.role) ? (
                    <><Icon name="check" color="green" /> อนุญาต</>
                  ) : (
                    <><Icon name="times" color="red" /> ไม่อนุญาต</>
                  )}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>อัปโหลดเอกสาร</Table.Cell>
                <Table.Cell>
                  {session.user.role !== 'READONLY' ? (
                    <><Icon name="check" color="green" /> อนุญาต</>
                  ) : (
                    <><Icon name="times" color="red" /> ไม่อนุญาต</>
                  )}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>จัดการผู้ใช้</Table.Cell>
                <Table.Cell>
                  {['ADMIN', 'DEPT_LEAD'].includes(session.user.role) ? (
                    <><Icon name="check" color="green" /> อนุญาต</>
                  ) : (
                    <><Icon name="times" color="red" /> ไม่อนุญาต</>
                  )}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>ดูรายงาน</Table.Cell>
                <Table.Cell>
                  {['ADMIN', 'DEPT_LEAD'].includes(session.user.role) ? (
                    <><Icon name="check" color="green" /> อนุญาต</>
                  ) : (
                    <><Icon name="times" color="red" /> ไม่อนุญาต</>
                  )}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>จัดการระบบ</Table.Cell>
                <Table.Cell>
                  {session.user.role === 'ADMIN' ? (
                    <><Icon name="check" color="green" /> อนุญาต</>
                  ) : (
                    <><Icon name="times" color="red" /> ไม่อนุญาต</>
                  )}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Segment>
      </Container>
    </AppLayout>
  )
}
