'use client'

import { useSearchParams } from 'next/navigation'
import { Container, Segment, Header, Icon, Button, Message } from 'semantic-ui-react'
import { useRouter } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'มีปัญหาในการตั้งค่าระบบ กรุณาติดต่อผู้ดูแลระบบ'
      case 'AccessDenied':
        return 'คุณไม่มีสิทธิ์เข้าถึงระบบ'
      case 'Verification':
        return 'การยืนยันตัวตนล้มเหลว'
      default:
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    }
  }

  return (
    <Container style={{ marginTop: '5rem' }}>
      <Segment placeholder textAlign="center" style={{ minHeight: '400px' }}>
        <Header icon>
          <Icon name="warning sign" color="red" size="huge" />
          <div style={{ marginTop: '1rem' }}>เกิดข้อผิดพลาด</div>
        </Header>

        <Message negative>
          <Message.Header>ไม่สามารถเข้าสู่ระบบได้</Message.Header>
          <p>{getErrorMessage(error)}</p>
        </Message>

        <Segment.Inline>
          <Button primary size="large" onClick={() => router.push('/auth/signin')}>
            <Icon name="arrow left" />
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </Segment.Inline>
      </Segment>
    </Container>
  )
}
