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
  Message,
  Breadcrumb,
  Card,
  List,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'
import { useCallback } from 'react'

export default function MilestoneDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [milestone, setMilestone] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (params.milestoneId) {
      fetchMilestoneData()
    }
  }, [params.milestoneId])

  const fetchMilestoneData = async () => {
    try {
      // Fetch milestone details from project
      const projectResponse = await fetch(`/api/projects/${params.id}`)
      const projectResult = await projectResponse.json()

      if (projectResult.ok) {
        const foundMilestone = projectResult.data.milestones?.find(
          (m: any) => m.id === params.milestoneId
        )
        setMilestone(foundMilestone)
      }

      // Fetch documents
      const docsResponse = await fetch(
        `/api/milestones/${params.milestoneId}/documents/upload`
      )
      const docsResult = await docsResponse.json()

      if (docsResult.ok) {
        setDocuments(docsResult.data)
      }
    } catch (error) {
      console.error('Failed to fetch milestone data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: any) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `/api/milestones/${params.milestoneId}/documents/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const result = await response.json()

      if (result.ok) {
        alert('อัปโหลดไฟล์สำเร็จ!')
        fetchMilestoneData() // Refresh data
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error?.message || 'ไม่สามารถอัปโหลดได้'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('เกิดข้อผิดพลาดในการอัปโหลด')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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

  if (loading) {
    return (
      <AppLayout>
        <Container>
          <Segment loading style={{ minHeight: '400px' }} />
        </Container>
      </AppLayout>
    )
  }

  if (!milestone) {
    return (
      <AppLayout>
        <Container>
          <Message negative>
            <Message.Header>ไม่พบงวดงาน</Message.Header>
            <p>งวดงานที่คุณค้นหาไม่มีอยู่ในระบบ</p>
          </Message>
        </Container>
      </AppLayout>
    )
  }

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
          <Breadcrumb.Section
            link
            onClick={() => router.push(`/projects/${params.id}`)}
          >
            รายละเอียดโครงการ
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section active>
            งวดที่ {milestone.index_no}
          </Breadcrumb.Section>
        </Breadcrumb>

        {/* Header */}
        <Header as="h1" style={{ marginTop: '1rem' }}>
          <Icon name="tasks" />
          <Header.Content>
            งวดที่ {milestone.index_no}: {milestone.name}
            <Header.Subheader>
              <Label color={getMilestoneStatusColor(milestone.status)}>
                {milestone.status}
              </Label>
            </Header.Subheader>
          </Header.Content>
        </Header>

        {/* Milestone Info */}
        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <Segment>
                <Header as="h3">
                  <Icon name="info circle" />
                  ข้อมูลงวดงาน
                </Header>
                <List>
                  <List.Item>
                    <List.Icon name="calendar" />
                    <List.Content>
                      <strong>กำหนดส่ง:</strong>{' '}
                      {new Date(milestone.due_date).toLocaleDateString('th-TH')}
                    </List.Content>
                  </List.Item>
                  {milestone.weight_percent && (
                    <List.Item>
                      <List.Icon name="percent" />
                      <List.Content>
                        <strong>น้ำหนัก:</strong> {milestone.weight_percent}%
                      </List.Content>
                    </List.Item>
                  )}
                  {milestone.description && (
                    <List.Item>
                      <List.Icon name="file text" />
                      <List.Content>
                        <strong>คำอธิบาย:</strong> {milestone.description}
                      </List.Content>
                    </List.Item>
                  )}
                  {milestone.drive_folder_id && (
                    <List.Item>
                      <List.Icon name="google drive" />
                      <List.Content>
                        <Button
                          as="a"
                          href={`https://drive.google.com/drive/folders/${milestone.drive_folder_id}`}
                          target="_blank"
                          size="small"
                          color="google plus"
                        >
                          เปิดโฟลเดอร์ใน Drive
                        </Button>
                      </List.Content>
                    </List.Item>
                  )}
                </List>
              </Segment>
            </Grid.Column>

            <Grid.Column width={8}>
              <Segment>
                <Header as="h3">
                  <Icon name="chart pie" />
                  สถิติเอกสาร
                </Header>
                <Card.Group itemsPerRow={2}>
                  <Card>
                    <Card.Content textAlign="center">
                      <Icon name="file" size="big" color="blue" />
                      <Card.Header>{documents.length}</Card.Header>
                      <Card.Meta>ไฟล์ทั้งหมด</Card.Meta>
                    </Card.Content>
                  </Card>
                  <Card>
                    <Card.Content textAlign="center">
                      <Icon name="check circle" size="big" color="green" />
                      <Card.Header>
                        {milestone.compliance?.filter((c: any) => c.status === 'full')
                          .length || 0}
                      </Card.Header>
                      <Card.Meta>เอกสารครบ</Card.Meta>
                    </Card.Content>
                  </Card>
                </Card.Group>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Documents */}
        <Segment>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Header as="h3">
                  <Icon name="file alternate" />
                  เอกสารทั้งหมด
                </Header>
              </Grid.Column>
              <Grid.Column width={4} textAlign="right">
                <Button
                  primary
                  icon
                  labelPosition="left"
                  as="label"
                  htmlFor="file-upload"
                  loading={uploading}
                  disabled={uploading}
                >
                  <Icon name="upload" />
                  อัปโหลดเอกสาร
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          {documents.length === 0 ? (
            <Message info>
              <Message.Header>ยังไม่มีเอกสาร</Message.Header>
              <p>เริ่มต้นอัปโหลดเอกสารแรกของงวดนี้</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>ชื่อไฟล์</Table.HeaderCell>
                  <Table.HeaderCell width={2}>ประเภท</Table.HeaderCell>
                  <Table.HeaderCell width={2}>ขนาด</Table.HeaderCell>
                  <Table.HeaderCell width={3}>อัปโหลดโดย</Table.HeaderCell>
                  <Table.HeaderCell width={3}>วันที่อัปโหลด</Table.HeaderCell>
                  <Table.HeaderCell width={2}>การดำเนินการ</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {documents.map((doc: any) => (
                  <Table.Row key={doc.id}>
                    <Table.Cell>
                      <Icon name="file" />
                      {doc.file_name}
                    </Table.Cell>
                    <Table.Cell>{doc.file_type || '-'}</Table.Cell>
                    <Table.Cell>
                      {doc.size_bytes ? formatFileSize(Number(doc.size_bytes)) : '-'}
                    </Table.Cell>
                    <Table.Cell>{doc.uploader?.name || '-'}</Table.Cell>
                    <Table.Cell>
                      {new Date(doc.uploaded_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        as="a"
                        href={doc.url}
                        target="_blank"
                        size="mini"
                        icon
                        primary
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
