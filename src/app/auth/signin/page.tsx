'use client'

import { signIn } from 'next-auth/react'
import { Container, Segment, Header, Button, Icon } from 'semantic-ui-react'

export default function SignInPage() {
  return (
    <Container style={{ marginTop: '5rem' }}>
      <Segment placeholder textAlign="center" style={{ minHeight: '400px' }}>
        <Header icon>
          <Icon name="folder open" size="huge" color="blue" />
          <div style={{ marginTop: '1rem' }}>
            ระบบจัดการโครงการและเอกสารงวดงาน
          </div>
          <Header.Subheader style={{ marginTop: '1rem' }}>
            Project Management & Document Tracking System
          </Header.Subheader>
        </Header>

        <Segment.Inline>
          <Button
            color="google plus"
            size="large"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            <Icon name="google" />
            เข้าสู่ระบบด้วย Google
          </Button>
        </Segment.Inline>

        <div style={{ marginTop: '2rem', color: '#6c757d' }}>
          <p>กรุณาใช้บัญชี Google ขององค์กรในการเข้าสู่ระบบ</p>
        </div>
      </Segment>
    </Container>
  )
}
