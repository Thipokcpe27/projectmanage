'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Container,
  Step,
  Form,
  Button,
  Header,
  Icon,
  Segment,
  Message,
  Grid,
  Table,
  Input,
  Dropdown,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'

export default function NewProjectPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  // Form data
  const [projectData, setProjectData] = useState({
    code: '',
    name: '',
    description: '',
    departmentId: '',
    fiscal_year: new Date().getFullYear() + 543,
    ownerId: '',
    start_date: '',
    end_date: '',
    budget: '',
    createDriveFolders: true,
  })

  const [milestones, setMilestones] = useState([
    {
      index_no: 1,
      name: '',
      description: '',
      due_date: '',
      weight_percent: 0,
    },
  ])

  useEffect(() => {
    fetchDepartments()
    fetchUsers()
  }, [])

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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const result = await response.json()
      if (result.ok) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleProjectChange = (field: string, value: any) => {
    setProjectData({ ...projectData, [field]: value })
  }

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        index_no: milestones.length + 1,
        name: '',
        description: '',
        due_date: '',
        weight_percent: 0,
      },
    ])
  }

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      const updated = milestones.filter((_, i) => i !== index)
      // Re-index
      updated.forEach((m, i) => (m.index_no = i + 1))
      setMilestones(updated)
    }
  }

  const validateStep1 = () => {
    return (
      projectData.code &&
      projectData.name &&
      projectData.departmentId &&
      projectData.start_date &&
      projectData.end_date
    )
  }

  const validateStep2 = () => {
    return milestones.every((m) => m.name && m.due_date)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...projectData,
        budget: projectData.budget ? parseFloat(projectData.budget) : undefined,
        ownerId: projectData.ownerId || session?.user.id,
        milestones,
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.ok) {
        alert('สร้างโครงการสำเร็จ!')
        router.push(`/projects/${result.data.id}`)
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error?.message || 'ไม่สามารถสร้างโครงการได้'}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('เกิดข้อผิดพลาดในการสร้างโครงการ')
    } finally {
      setLoading(false)
    }
  }

  const departmentOptions = departments.map((d) => ({
    key: d.id,
    text: d.name,
    value: d.id,
  }))

  const userOptions = users.map((u) => ({
    key: u.id,
    text: `${u.name} (${u.email})`,
    value: u.id,
  }))

  return (
    <AppLayout>
      <Container>
        <Header as="h1">
          <Icon name="plus circle" />
          <Header.Content>
            สร้างโครงการใหม่
            <Header.Subheader>กรอกข้อมูลโครงการและงวดงาน</Header.Subheader>
          </Header.Content>
        </Header>

        {/* Steps */}
        <Step.Group ordered fluid style={{ marginTop: '2rem' }}>
          <Step active={currentStep === 1} completed={currentStep > 1}>
            <Step.Content>
              <Step.Title>ข้อมูลโครงการ</Step.Title>
              <Step.Description>รายละเอียดพื้นฐาน</Step.Description>
            </Step.Content>
          </Step>

          <Step active={currentStep === 2} completed={currentStep > 2}>
            <Step.Content>
              <Step.Title>งวดงาน</Step.Title>
              <Step.Description>กำหนดงวดงาน</Step.Description>
            </Step.Content>
          </Step>

          <Step active={currentStep === 3}>
            <Step.Content>
              <Step.Title>ยืนยัน</Step.Title>
              <Step.Description>ตรวจสอบข้อมูล</Step.Description>
            </Step.Content>
          </Step>
        </Step.Group>

        {/* Step 1: Project Info */}
        {currentStep === 1 && (
          <Segment>
            <Header as="h3">ข้อมูลโครงการ</Header>
            <Form>
              <Form.Group widths="equal">
                <Form.Field required>
                  <label>รหัสโครงการ</label>
                  <Input
                    placeholder="P-2026-001"
                    value={projectData.code}
                    onChange={(e: any) => handleProjectChange('code', e.target.value)}
                  />
                </Form.Field>
                <Form.Field required>
                  <label>ปีงบประมาณ</label>
                  <Input
                    type="number"
                    value={projectData.fiscal_year}
                    onChange={(e: any) =>
                      handleProjectChange('fiscal_year', parseInt(e.target.value))
                    }
                  />
                </Form.Field>
              </Form.Group>

              <Form.Field required>
                <label>ชื่อโครงการ</label>
                <Input
                  placeholder="ชื่อโครงการ"
                  value={projectData.name}
                  onChange={(e: any) => handleProjectChange('name', e.target.value)}
                />
              </Form.Field>

              <Form.Field>
                <label>คำอธิบาย</label>
                <Form.TextArea
                  placeholder="รายละเอียดโครงการ..."
                  value={projectData.description}
                  onChange={(e: any) => handleProjectChange('description', e.target.value)}
                />
              </Form.Field>

              <Form.Group widths="equal">
                <Form.Field required>
                  <label>แผนก</label>
                  <Dropdown
                    placeholder="เลือกแผนก"
                    fluid
                    selection
                    options={departmentOptions}
                    value={projectData.departmentId}
                    onChange={(_: any, { value }: any) =>
                      handleProjectChange('departmentId', value)
                    }
                  />
                </Form.Field>
                <Form.Field>
                  <label>เจ้าของโครงการ</label>
                  <Dropdown
                    placeholder="เลือกผู้รับผิดชอบ (ค่าเริ่มต้น: คุณ)"
                    fluid
                    selection
                    clearable
                    options={userOptions}
                    value={projectData.ownerId}
                    onChange={(_: any, { value }: any) =>
                      handleProjectChange('ownerId', value)
                    }
                  />
                </Form.Field>
              </Form.Group>

              <Form.Group widths="equal">
                <Form.Field required>
                  <label>วันที่เริ่ม</label>
                  <Input
                    type="date"
                    value={projectData.start_date}
                    onChange={(e: any) => handleProjectChange('start_date', e.target.value)}
                  />
                </Form.Field>
                <Form.Field required>
                  <label>วันที่สิ้นสุด</label>
                  <Input
                    type="date"
                    value={projectData.end_date}
                    onChange={(e: any) => handleProjectChange('end_date', e.target.value)}
                  />
                </Form.Field>
              </Form.Group>

              <Form.Field>
                <label>งบประมาณ (บาท)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={projectData.budget}
                  onChange={(e: any) => handleProjectChange('budget', e.target.value)}
                />
              </Form.Field>

              <Form.Checkbox
                label="สร้างโฟลเดอร์ Google Drive อัตโนมัติ"
                checked={projectData.createDriveFolders}
                onChange={(_: any, { checked }: any) =>
                  handleProjectChange('createDriveFolders', checked)
                }
              />
            </Form>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <Button
                primary
                onClick={() => setCurrentStep(2)}
                disabled={!validateStep1()}
              >
                ถัดไป <Icon name="arrow right" />
              </Button>
            </div>
          </Segment>
        )}

        {/* Step 2: Milestones */}
        {currentStep === 2 && (
          <Segment>
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Header as="h3">งวดงาน</Header>
                </Grid.Column>
                <Grid.Column width={4} textAlign="right">
                  <Button icon labelPosition="left" onClick={addMilestone} size="small">
                    <Icon name="plus" />
                    เพิ่มงวด
                  </Button>
                </Grid.Column>
              </Grid.Row>
            </Grid>

            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={1}>งวดที่</Table.HeaderCell>
                  <Table.HeaderCell width={4}>ชื่องวด *</Table.HeaderCell>
                  <Table.HeaderCell width={5}>คำอธิบาย</Table.HeaderCell>
                  <Table.HeaderCell width={3}>กำหนดส่ง *</Table.HeaderCell>
                  <Table.HeaderCell width={2}>น้ำหนัก (%)</Table.HeaderCell>
                  <Table.HeaderCell width={1}></Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {milestones.map((milestone, index) => (
                  <Table.Row key={index}>
                    <Table.Cell textAlign="center">
                      <strong>{milestone.index_no}</strong>
                    </Table.Cell>
                    <Table.Cell>
                      <Input
                        fluid
                        placeholder="ชื่องวด"
                        value={milestone.name}
                        onChange={(e: any) =>
                          handleMilestoneChange(index, 'name', e.target.value)
                        }
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Input
                        fluid
                        placeholder="คำอธิบาย (ถ้ามี)"
                        value={milestone.description}
                        onChange={(e: any) =>
                          handleMilestoneChange(index, 'description', e.target.value)
                        }
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Input
                        fluid
                        type="date"
                        value={milestone.due_date}
                        onChange={(e: any) =>
                          handleMilestoneChange(index, 'due_date', e.target.value)
                        }
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Input
                        fluid
                        type="number"
                        min="0"
                        max="100"
                        value={milestone.weight_percent}
                        onChange={(e: any) =>
                          handleMilestoneChange(
                            index,
                            'weight_percent',
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {milestones.length > 1 && (
                        <Button
                          icon="trash"
                          size="mini"
                          negative
                          onClick={() => removeMilestone(index)}
                        />
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <Message info>
              <Message.Header>คำแนะนำ</Message.Header>
              <p>
                - น้ำหนักรวมควรไม่เกิน 100%<br />
                - กำหนดส่งต้องอยู่ในช่วงวันที่โครงการ<br />
                - สามารถเพิ่มงวดได้ภายหลัง
              </p>
            </Message>

            <div style={{ marginTop: '2rem' }}>
              <Button onClick={() => setCurrentStep(1)}>
                <Icon name="arrow left" /> ย้อนกลับ
              </Button>
              <Button
                primary
                floated="right"
                onClick={() => setCurrentStep(3)}
                disabled={!validateStep2()}
              >
                ถัดไป <Icon name="arrow right" />
              </Button>
            </div>
          </Segment>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 3 && (
          <Segment>
            <Header as="h3">ยืนยันข้อมูล</Header>

            <Header as="h4">ข้อมูลโครงการ</Header>
            <Table definition>
              <Table.Body>
                <Table.Row>
                  <Table.Cell width={4}>รหัสโครงการ</Table.Cell>
                  <Table.Cell>{projectData.code}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>ชื่อโครงการ</Table.Cell>
                  <Table.Cell>{projectData.name}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>แผนก</Table.Cell>
                  <Table.Cell>
                    {departments.find((d) => d.id === projectData.departmentId)?.name}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>ปีงบประมาณ</Table.Cell>
                  <Table.Cell>{projectData.fiscal_year}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>ระยะเวลา</Table.Cell>
                  <Table.Cell>
                    {new Date(projectData.start_date).toLocaleDateString('th-TH')} -{' '}
                    {new Date(projectData.end_date).toLocaleDateString('th-TH')}
                  </Table.Cell>
                </Table.Row>
                {projectData.budget && (
                  <Table.Row>
                    <Table.Cell>งบประมาณ</Table.Cell>
                    <Table.Cell>
                      {parseFloat(projectData.budget).toLocaleString()} บาท
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>

            <Header as="h4">งวดงาน ({milestones.length} งวด)</Header>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>งวดที่</Table.HeaderCell>
                  <Table.HeaderCell>ชื่องวด</Table.HeaderCell>
                  <Table.HeaderCell>กำหนดส่ง</Table.HeaderCell>
                  <Table.HeaderCell>น้ำหนัก</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {milestones.map((m) => (
                  <Table.Row key={m.index_no}>
                    <Table.Cell>{m.index_no}</Table.Cell>
                    <Table.Cell>{m.name}</Table.Cell>
                    <Table.Cell>
                      {new Date(m.due_date).toLocaleDateString('th-TH')}
                    </Table.Cell>
                    <Table.Cell>{m.weight_percent}%</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <div style={{ marginTop: '2rem' }}>
              <Button onClick={() => setCurrentStep(2)}>
                <Icon name="arrow left" /> ย้อนกลับ
              </Button>
              <Button
                primary
                floated="right"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                <Icon name="check" /> สร้างโครงการ
              </Button>
            </div>
          </Segment>
        )}
      </Container>
    </AppLayout>
  )
}
