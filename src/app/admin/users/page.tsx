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
  Label,
  Dropdown,
  Input,
  Message,
  Modal,
  Form,
} from 'semantic-ui-react'
import AppLayout from '@/components/layout/AppLayout'

export default function AdminUsersPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editModal, setEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (session && !['ADMIN', 'DEPT_LEAD'].includes(session.user.role)) {
      router.push('/dashboard')
    } else {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/departments'),
      ])

      const usersResult = await usersRes.json()
      const deptsResult = await deptsRes.json()

      if (usersResult.ok) setUsers(usersResult.data)
      if (deptsResult.ok) setDepartments(deptsResult.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: any) => {
    setSelectedUser({
      userId: user.id,
      role: user.role,
      departmentId: user.departmentId,
      is_active: user.is_active,
    })
    setEditModal(true)
  }

  const handleUpdate = async () => {
    if (!selectedUser) return

    setUpdating(true)
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser),
      })

      const result = await response.json()

      if (result.ok) {
        alert('อัปเดตข้อมูลสำเร็จ!')
        setEditModal(false)
        fetchData()
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดต')
    } finally {
      setUpdating(false)
    }
  }

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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const roleOptions = [
    { key: 'ADMIN', text: 'ผู้ดูแลระบบ', value: 'ADMIN' },
    { key: 'DEPT_LEAD', text: 'หัวหน้าแผนก', value: 'DEPT_LEAD' },
    { key: 'PM', text: 'ผู้จัดการโครงการ', value: 'PM' },
    { key: 'MEMBER', text: 'สมาชิก', value: 'MEMBER' },
    { key: 'READONLY', text: 'ดูอย่างเดียว', value: 'READONLY' },
  ]

  const departmentOptions = departments.map((d) => ({
    key: d.id,
    text: d.name,
    value: d.id,
  }))

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
          <Icon name="users" />
          <Header.Content>
            จัดการผู้ใช้งาน
            <Header.Subheader>User Management</Header.Subheader>
          </Header.Content>
        </Header>

        {/* Search */}
        <Input
          icon="search"
          placeholder="ค้นหาผู้ใช้..."
          fluid
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />

        {/* Users Table */}
        {loading ? (
          <Message>กำลังโหลด...</Message>
        ) : (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>ชื่อ</Table.HeaderCell>
                <Table.HeaderCell>อีเมล</Table.HeaderCell>
                <Table.HeaderCell>บทบาท</Table.HeaderCell>
                <Table.HeaderCell>แผนก</Table.HeaderCell>
                <Table.HeaderCell>โครงการ</Table.HeaderCell>
                <Table.HeaderCell>สถานะ</Table.HeaderCell>
                <Table.HeaderCell width={2}>การดำเนินการ</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {filteredUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    {user.image && (
                      <img
                        src={user.image}
                        alt={user.name}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          marginRight: '10px',
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                    {user.name}
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <Label color={getRoleColor(user.role)} size="small">
                      {getRoleLabel(user.role)}
                    </Label>
                  </Table.Cell>
                  <Table.Cell>{user.department?.name || '-'}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {user._count?.projectsOwned || 0}
                  </Table.Cell>
                  <Table.Cell>
                    <Label color={user.is_active ? 'green' : 'grey'} size="small">
                      {user.is_active ? 'ใช้งาน' : 'ระงับ'}
                    </Label>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {session.user.role === 'ADMIN' && (
                      <Button
                        size="mini"
                        icon="edit"
                        onClick={() => handleEdit(user)}
                      />
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        {/* Edit Modal */}
        <Modal open={editModal} onClose={() => setEditModal(false)} size="small">
          <Modal.Header>แก้ไขข้อมูลผู้ใช้</Modal.Header>
          <Modal.Content>
            {selectedUser && (
              <Form>
                <Form.Field>
                  <label>บทบาท</label>
                  <Dropdown
                    fluid
                    selection
                    options={roleOptions}
                    value={selectedUser.role}
                    onChange={(_: any, { value }: any) =>
                      setSelectedUser({ ...selectedUser, role: value })
                    }
                  />
                </Form.Field>

                <Form.Field>
                  <label>แผนก</label>
                  <Dropdown
                    fluid
                    selection
                    clearable
                    options={departmentOptions}
                    value={selectedUser.departmentId}
                    onChange={(_: any, { value }: any) =>
                      setSelectedUser({ ...selectedUser, departmentId: value })
                    }
                  />
                </Form.Field>

                <Form.Checkbox
                  label="เปิดใช้งาน"
                  checked={selectedUser.is_active}
                  onChange={(_: any, { checked }: any) =>
                    setSelectedUser({ ...selectedUser, is_active: checked })
                  }
                />
              </Form>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setEditModal(false)}>ยกเลิก</Button>
            <Button
              primary
              onClick={handleUpdate}
              loading={updating}
              disabled={updating}
            >
              บันทึก
            </Button>
          </Modal.Actions>
        </Modal>
      </Container>
    </AppLayout>
  )
}
