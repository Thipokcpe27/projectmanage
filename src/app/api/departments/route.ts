import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { isAdminOrDeptLead } from '@/lib/rbac'

/**
 * GET /api/departments - ดึงรายการแผนกทั้งหมด
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: {
          users: true,
          projects: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ ok: true, data: departments })
}

/**
 * POST /api/departments - สร้างแผนกใหม่ (Admin only)
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !isAdminOrDeptLead(session)) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { code, name } = body

    if (!code || !name) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกข้อมูลให้ครบ' },
        },
        { status: 400 }
      )
    }

    // ตรวจสอบว่า code ไม่ซ้ำ
    const existing = await prisma.department.findUnique({
      where: { code },
    })

    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'DUPLICATE_CODE', message: 'รหัสแผนกซ้ำ' },
        },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: { code, name },
    })

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: 'CREATE_DEPARTMENT',
        entity_type: 'department',
        entity_id: department.id,
        metadata: { code, name },
      },
    })

    return NextResponse.json({ ok: true, data: department }, { status: 201 })
  } catch (error: any) {
    console.error('Create department error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      },
      { status: 500 }
    )
  }
}
