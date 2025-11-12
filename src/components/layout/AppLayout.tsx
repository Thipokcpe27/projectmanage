'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Container, Menu, Dropdown, Icon, Label } from 'semantic-ui-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Icon loading name="spinner" size="huge" />
        <p>กำลังโหลด...</p>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const getRoleBadgeColor = (role: string) => {
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

  return (
    <div>
      <Menu fixed="top" inverted>
        <Container>
          <Menu.Item header onClick={() => router.push('/dashboard')}>
            <Icon name="folder open" />
            ระบบจัดการโครงการ
          </Menu.Item>

          <Menu.Item
            name="dashboard"
            active={pathname === '/dashboard'}
            onClick={() => router.push('/dashboard')}
          >
            <Icon name="dashboard" />
            Dashboard
          </Menu.Item>

          <Menu.Item
            name="projects"
            active={pathname?.startsWith('/projects')}
            onClick={() => router.push('/projects')}
          >
            <Icon name="briefcase" />
            โครงการ
          </Menu.Item>

          {(session.user.role === 'ADMIN' || session.user.role === 'DEPT_LEAD') && (
            <Menu.Item
              name="admin"
              active={pathname?.startsWith('/admin')}
              onClick={() => router.push('/admin')}
            >
              <Icon name="settings" />
              จัดการระบบ
            </Menu.Item>
          )}

          <Menu.Menu position="right">
            <Dropdown
              item
              trigger={
                <span>
                  <Icon name="user" />
                  {session.user.name}
                  <Label
                    color={getRoleBadgeColor(session.user.role)}
                    size="mini"
                    style={{ marginLeft: '0.5rem' }}
                  >
                    {getRoleLabel(session.user.role)}
                  </Label>
                </span>
              }
            >
              <Dropdown.Menu>
                <Dropdown.Item>
                  <Icon name="building" />
                  {session.user.department?.name || 'ไม่มีแผนก'}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => router.push('/profile')}>
                  <Icon name="user" />
                  โปรไฟล์
                </Dropdown.Item>
                <Dropdown.Item onClick={() => signOut()}>
                  <Icon name="sign out" />
                  ออกจากระบบ
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        </Container>
      </Menu>

      <Container style={{ marginTop: '5rem', minHeight: 'calc(100vh - 8rem)' }}>
        {children}
      </Container>

      <div
        style={{
          marginTop: '3rem',
          padding: '2rem',
          textAlign: 'center',
          background: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
        }}
      >
        <p style={{ margin: 0, color: '#6c757d' }}>
          © 2024 ระบบจัดการโครงการและเอกสารงวดงาน | Powered by Next.js
        </p>
      </div>
    </div>
  )
}
