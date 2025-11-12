'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Container,
  Header,
  Icon,
  Table,
  Button,
  Message,
  Modal,
  Form,
  Input,
  Tab,
  Label,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'

export default function AdminTemplatesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [requirements, setRequirements] = useState<any[]>([])
  const [milestoneTemplates, setMilestoneTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [modalType, setModalType] = useState<'requirement' | 'milestone'>('requirement')
  const [creating, setCreating] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', description: '', file_pattern: '' })

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    } else {
      fetchTemplates()
    }
  }, [session])

  const fetchTemplates = async () => {
    try {
      // Mock data for now - will implement API later
      setRequirements([
        { id: '1', name: 'แบบฟอร์มขออนุมัติโครงการ', file_pattern: '*อนุมัติ*.pdf', description: 'เอกสารขออนุมัติโครงการ' },
        { id: '2', name: 'รายงานความคืบหน้า', file_pattern: '*รายงาน*.pdf', description: 'รายงานความคืบหน้าประจำงวด' },
        { id: '3', name: 'ใบเสร็จรับเงิน', file_pattern: '*ใบเสร็จ*.pdf', description: 'หลักฐานการจ่ายเงิน' },
      ])
      
      setMilestoneTemplates([
        { id: '1', name: 'งวดที่ 1 - เริ่มโครงการ', weight_percent: 20, description: 'การเริ่มต้นโครงการ' },
        { id: '2', name: 'งวดที่ 2 - ดำเนินการ 50%', weight_percent: 30, description: 'ความคืบหน้า 50%' },
        { id: '3', name: 'งวดที่ 3 - เสร็จสิ้น', weight_percent: 50, description: 'การส่งมอบโครงการ' },
      ])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newItem.name) {
      alert('กรุณากรอกชื่อ')
      return
    }

    setCreating(true)
    try {
      // Mock create - will implement API later
      const newTemplate = {
        id: Date.now().toString(),
        ...newItem,
      }

      if (modalType === 'requirement') {
        setRequirements([...requirements, newTemplate])
      } else {
        setMilestoneTemplates([...milestoneTemplates, newTemplate])
      }

      alert('สร้างเทมเพลตสำเร็จ!')
      setCreateModal(false)
      setNewItem({ name: '', description: '', file_pattern: '' })
    } catch (error) {
      console.error('Create error:', error)
      alert('เกิดข้อผิดพลาดในการสร้างเทมเพลต')
    } finally {
      setCreating(false)
    }
  }

  const openCreateModal = (type: 'requirement' | 'milestone') => {
    setModalType(type)
    setNewItem({ name: '', description: '', file_pattern: '' })
    setCreateModal(true)
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <AppLayout>
        <Container>
          <Message negative>
            <Message.Header>ไม่มีสิทธิ์เข้าถึง</Message.Header>
            <p>เฉพาะผู้ดูแลระบบเท่านั้นที่เข้าถึงได้</p>
          </Message>
        </Container>
      </AppLayout>
    )
  }

  const panes = [
    {
      menuItem: 'เทมเพลตเอกสาร',
      render: () => (
        <Tab.Pane>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Header as="h3">เทมเพลตเอกสารที่ต้องการ</Header>
            <Button
              primary
              size="small"
              icon
              labelPosition="left"
              onClick={() => openCreateModal('requirement')}
            >
              <Icon name="plus" />
              เพิ่มเทมเพลต
            </Button>
          </div>

          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>ชื่อเอกสาร</Table.HeaderCell>
                <Table.HeaderCell>รูปแบบไฟล์</Table.HeaderCell>
                <Table.HeaderCell>คำอธิบาย</Table.HeaderCell>
                <Table.HeaderCell width={2}>การดำเนินการ</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {requirements.map((req) => (
                <Table.Row key={req.id}>
                  <Table.Cell>
                    <strong>{req.name}</strong>
                  </Table.Cell>
                  <Table.Cell>
                    <Label color="blue" size="small">
                      {req.file_pattern}
                    </Label>
                  </Table.Cell>
                  <Table.Cell>{req.description}</Table.Cell>
                  <Table.Cell textAlign="center">
                    <Button size="mini" icon="edit" />
                    <Button size="mini" icon="trash" negative />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tab.Pane>
      ),
    },
    {
      menuItem: 'เทมเพลตงวดงาน',
      render: () => (
        <Tab.Pane>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Header as="h3">เทมเพลตงวดงาน</Header>
            <Button
              primary
              size="small"
              icon
              labelPosition="left"
              onClick={() => openCreateModal('milestone')}
            >
              <Icon name="plus" />
              เพิ่มเทมเพลต
            </Button>
          </div>

          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>ชื่องวด</Table.HeaderCell>
                <Table.HeaderCell>น้ำหนัก (%)</Table.HeaderCell>
                <Table.HeaderCell>คำอธิบาย</Table.HeaderCell>
                <Table.HeaderCell width={2}>การดำเนินการ</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {milestoneTemplates.map((template) => (
                <Table.Row key={template.id}>
                  <Table.Cell>
                    <strong>{template.name}</strong>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Label color="green" size="small">
                      {template.weight_percent}%
                    </Label>
                  </Table.Cell>
                  <Table.Cell>{template.description}</Table.Cell>
                  <Table.Cell textAlign="center">
                    <Button size="mini" icon="edit" />
                    <Button size="mini" icon="trash" negative />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tab.Pane>
      ),
    },
  ]

  return (
    <AppLayout>
      <Container>
        <Header as="h1">
          <Icon name="file alternate outline" />
          <Header.Content>
            เทมเพลตเอกสาร
            <Header.Subheader>Document Templates Management</Header.Subheader>
          </Header.Content>
        </Header>

        {loading ? (
          <Message>กำลังโหลด...</Message>
        ) : (
          <Tab panes={panes} style={{ marginTop: '2rem' }} />
        )}

        {/* Create Modal */}
        <Modal open={createModal} onClose={() => setCreateModal(false)} size="small">
          <Modal.Header>
            เพิ่ม{modalType === 'requirement' ? 'เทมเพลตเอกสาร' : 'เทมเพลตงวดงาน'}
          </Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field required>
                <label>ชื่อ</label>
                <Input
                  placeholder={modalType === 'requirement' ? 'ชื่อเอกสาร' : 'ชื่องวดงาน'}
                  value={newItem.name}
                  onChange={(e: any) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
              </Form.Field>

              {modalType === 'requirement' && (
                <Form.Field>
                  <label>รูปแบบไฟล์</label>
                  <Input
                    placeholder="*รายงาน*.pdf"
                    value={newItem.file_pattern}
                    onChange={(e: any) =>
                      setNewItem({ ...newItem, file_pattern: e.target.value })
                    }
                  />
                </Form.Field>
              )}

              <Form.Field>
                <label>คำอธิบาย</label>
                <Form.TextArea
                  placeholder="รายละเอียด..."
                  value={newItem.description}
                  onChange={(e: any) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setCreateModal(false)}>ยกเลิก</Button>
            <Button
              primary
              onClick={handleCreate}
              loading={creating}
              disabled={creating}
            >
              สร้าง
            </Button>
          </Modal.Actions>
        </Modal>
      </Container>
    </AppLayout>
  )
}
