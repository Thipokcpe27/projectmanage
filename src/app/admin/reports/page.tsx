'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Container,
  Header,
  Icon,
  Card,
  Button,
  Form,
  Dropdown,
  Table,
  Message,
  Statistic,
  Grid,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'

export default function AdminReportsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [departments, setDepartments] = useState<any[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    fiscal_year: new Date().getFullYear() + 543,
    department_id: '',
  })

  useEffect(() => {
    if (session && !['ADMIN', 'DEPT_LEAD'].includes(session.user.role)) {
      router.push('/dashboard')
    } else {
      fetchDepartments()
    }
  }, [session])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      const result = await response.json()
      if (result.ok) {
        setDepartments(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.fiscal_year) params.append('fiscal_year', filters.fiscal_year.toString())
      if (filters.department_id) params.append('department_id', filters.department_id)

      const response = await fetch(`/api/reports/progress?${params}`)
      const result = await response.json()

      if (result.ok) {
        setReportData(result.data)
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('Report error:', error)
      alert('เกิดข้อผิดพลาดในการสร้างรายงาน')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    if (reportData.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก')
      return
    }

    const headers = [
      'รหัสโครงการ',
      'ชื่อโครงการ',
      'แผนก',
      'เจ้าของโครงการ',
      'ปีงบประมาณ',
      'สถานะ',
      'ความคืบหน้า (%)',
      'งวดทั้งหมด',
      'งวดเสร็จ',
      'เอกสารทั้งหมด',
      'เอกสารครบ',
      'เอกสารขาด',
    ]

    const csvContent = [
      headers.join(','),
      ...reportData.map((row) =>
        [
          row.projectCode,
          `"${row.projectName}"`,
          `"${row.department}"`,
          `"${row.owner}"`,
          row.fiscalYear,
          row.status,
          row.progress,
          row.totalMilestones,
          row.completedMilestones,
          row.totalDocuments,
          row.compliance.full,
          row.compliance.missing,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `รายงานความคืบหน้า_${filters.fiscal_year}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const departmentOptions = [
    { key: '', text: 'ทุกแผนก', value: '' },
    ...departments.map((d) => ({
      key: d.id,
      text: d.name,
      value: d.id,
    })),
  ]

  const fiscalYearOptions = [
    { key: 2567, text: '2567', value: 2567 },
    { key: 2568, text: '2568', value: 2568 },
    { key: 2569, text: '2569', value: 2569 },
  ]

  const calculateSummary = () => {
    if (reportData.length === 0) return { total: 0, completed: 0, inProgress: 0, avgProgress: 0 }

    const total = reportData.length
    const completed = reportData.filter((p) => p.status === 'completed').length
    const inProgress = reportData.filter((p) => p.status === 'active').length
    const avgProgress = Math.round(
      reportData.reduce((sum, p) => sum + p.progress, 0) / total
    )

    return { total, completed, inProgress, avgProgress }
  }

  const summary = calculateSummary()

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
          <Icon name="chart bar" />
          <Header.Content>
            รายงาน
            <Header.Subheader>Reports Dashboard</Header.Subheader>
          </Header.Content>
        </Header>

        {/* Report Types */}
        <Card.Group itemsPerRow={3} style={{ marginTop: '2rem' }}>
          <Card>
            <Card.Content textAlign="center">
              <Icon name="chart line" size="huge" color="blue" />
              <Card.Header style={{ marginTop: '1rem' }}>
                รายงานความคืบหน้า
              </Card.Header>
              <Card.Meta>Progress Report</Card.Meta>
              <Card.Description>
                ความคืบหน้าโครงการแยกตามแผนกและปีงบประมาณ
              </Card.Description>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content textAlign="center">
              <Icon name="file alternate" size="huge" color="green" />
              <Card.Header style={{ marginTop: '1rem' }}>
                รายงานเอกสาร
              </Card.Header>
              <Card.Meta>Document Report</Card.Meta>
              <Card.Description>
                สถานะความครบถ้วนของเอกสารแต่ละงวด
              </Card.Description>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content textAlign="center">
              <Icon name="calendar times" size="huge" color="red" />
              <Card.Header style={{ marginTop: '1rem' }}>
                รายงานล่าช้า
              </Card.Header>
              <Card.Meta>Overdue Report</Card.Meta>
              <Card.Description>
                งวดงานที่เกินกำหนดส่ง
              </Card.Description>
            </Card.Content>
          </Card>
        </Card.Group>

        {/* Filters */}
        <Header as="h2" style={{ marginTop: '3rem' }}>
          รายงานความคืบหน้าโครงการ
        </Header>

        <Form style={{ marginBottom: '2rem' }}>
          <Form.Group widths="equal">
            <Form.Field>
              <label>ปีงบประมาณ</label>
              <Dropdown
                selection
                options={fiscalYearOptions}
                value={filters.fiscal_year}
                onChange={(_: any, { value }: any) =>
                  setFilters({ ...filters, fiscal_year: value as number })
                }
              />
            </Form.Field>
            <Form.Field>
              <label>แผนก</label>
              <Dropdown
                selection
                options={departmentOptions}
                value={filters.department_id}
                onChange={(_: any, { value }: any) =>
                  setFilters({ ...filters, department_id: value as string })
                }
              />
            </Form.Field>
            <Form.Field>
              <label>&nbsp;</label>
              <Button
                primary
                onClick={generateReport}
                loading={loading}
                disabled={loading}
              >
                สร้างรายงาน
              </Button>
            </Form.Field>
          </Form.Group>
        </Form>

        {/* Summary */}
        {reportData.length > 0 && (
          <>
            <Grid columns={4} stackable style={{ marginBottom: '2rem' }}>
              <Grid.Column>
                <Statistic size="small">
                  <Statistic.Value>{summary.total}</Statistic.Value>
                  <Statistic.Label>โครงการทั้งหมด</Statistic.Label>
                </Statistic>
              </Grid.Column>
              <Grid.Column>
                <Statistic size="small" color="green">
                  <Statistic.Value>{summary.completed}</Statistic.Value>
                  <Statistic.Label>เสร็จสิ้น</Statistic.Label>
                </Statistic>
              </Grid.Column>
              <Grid.Column>
                <Statistic size="small" color="blue">
                  <Statistic.Value>{summary.inProgress}</Statistic.Value>
                  <Statistic.Label>ดำเนินการ</Statistic.Label>
                </Statistic>
              </Grid.Column>
              <Grid.Column>
                <Statistic size="small" color="orange">
                  <Statistic.Value>{summary.avgProgress}%</Statistic.Value>
                  <Statistic.Label>ความคืบหน้าเฉลี่ย</Statistic.Label>
                </Statistic>
              </Grid.Column>
            </Grid>

            <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
              <Button icon labelPosition="left" onClick={exportCSV}>
                <Icon name="download" />
                ส่งออก CSV
              </Button>
            </div>

            {/* Report Table */}
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>รหัส</Table.HeaderCell>
                  <Table.HeaderCell>ชื่อโครงการ</Table.HeaderCell>
                  <Table.HeaderCell>แผนก</Table.HeaderCell>
                  <Table.HeaderCell>เจ้าของ</Table.HeaderCell>
                  <Table.HeaderCell>สถานะ</Table.HeaderCell>
                  <Table.HeaderCell>ความคืบหน้า</Table.HeaderCell>
                  <Table.HeaderCell>งวดงาน</Table.HeaderCell>
                  <Table.HeaderCell>เอกสาร</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {reportData.map((project) => (
                  <Table.Row key={project.projectId}>
                    <Table.Cell>
                      <strong>{project.projectCode}</strong>
                    </Table.Cell>
                    <Table.Cell>{project.projectName}</Table.Cell>
                    <Table.Cell>{project.department}</Table.Cell>
                    <Table.Cell>{project.owner}</Table.Cell>
                    <Table.Cell>
                      <Icon
                        name={
                          project.status === 'completed'
                            ? 'check circle'
                            : project.status === 'active'
                            ? 'play circle'
                            : 'pause circle'
                        }
                        color={
                          project.status === 'completed'
                            ? 'green'
                            : project.status === 'active'
                            ? 'blue'
                            : 'grey'
                        }
                      />
                      {project.status}
                    </Table.Cell>
                    <Table.Cell>
                      <strong>{project.progress}%</strong>
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {project.completedMilestones}/{project.totalMilestones}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Icon name="check" color="green" />
                      {project.compliance.full}
                      <Icon name="times" color="red" style={{ marginLeft: '10px' }} />
                      {project.compliance.missing}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </>
        )}
      </Container>
    </AppLayout>
  )
}
