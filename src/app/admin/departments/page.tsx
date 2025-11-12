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
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'

export default function AdminDepartmentsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newDept, setNewDept] = useState({ code: '', name: '' })

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
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newDept.code || !newDept.name) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDept),
      })

      const result = await response.json()

      if (result.ok) {
        alert('สร้างแผนกสำเร็จ!')
        setCreateModal(false)
        setNewDept({ code: '', name: '' })
        fetchDepartments()
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('Create error:', error)
      alert('เกิดข้อผิดพลาดในการสร้างแผนก')
    } finally {
      setCreating(false)
    }
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Header as="h1">
            <Icon name="building" />
            <Header.Content>
              จัดการแผนก
              <Header.Subheader>Department Management</Header.Subheader>
            </Header.Content>
          </Header>

          {session.user.role === 'ADMIN' && (
            <Button
              primary
              icon
              labelPosition="left"
              onClick={() => setCreateModal(true)}
            >
              <Icon name="plus" />
              เพิ่มแผนก
            </Button>
          )}
        </div>

        {/* Departments Table */}
        {loading ? (
          <Message>กำลังโหลด...</Message>
        ) : (
          <Table celled style={{ marginTop: '2rem' }}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>รหัส</Table.HeaderCell>
                <Table.HeaderCell>ชื่อแผนก</Table.HeaderCell>
                <Table.HeaderCell>จำนวนผู้ใช้</Table.HeaderCell>
                <Table.HeaderCell>จำนวนโครงการ</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {departments.map((dept) => (
                <Table.Row key={dept.id}>
                  <Table.Cell>
                    <strong>{dept.code}</strong>
                  </Table.Cell>
                  <Table.Cell>{dept.name}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {dept._count?.users || 0}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {dept._count?.projects || 0}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        {/* Create Modal */}
        <Modal open={createModal} onClose={() => setCreateModal(false)} size="small">
          <Modal.Header>เพิ่มแผนกใหม่</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field required>
                <label>รหัสแผนก</label>
                <Input
                  placeholder="ENG, IT, HR..."
                  value={newDept.code}
                  onChange={(e: any) =>
                    setNewDept({ ...newDept, code: e.target.value.toUpperCase() })
                  }
                />
              </Form.Field>

              <Form.Field required>
                <label>ชื่อแผนก</label>
                <Input
                  placeholder="ชื่อแผนก"
                  value={newDept.name}
                  onChange={(e: any) =>
                    setNewDept({ ...newDept, name: e.target.value })
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
