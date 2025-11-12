import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { isAdminOrDeptLead } from '@/lib/rbac'

/**
 * GET /api/users - ดึงรายการผู้ใช้
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !isAdminOrDeptLead(session)) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const departmentId = searchParams.get('department_id')
  const role = searchParams.get('role')

  const where: any = {}

  // ถ้าเป็น DeptLead ให้เห็นเฉพาะแผนกตัวเอง
  if (session.user.role === 'DEPT_LEAD' && session.user.departmentId) {
    where.departmentId = session.user.departmentId
  }

  // Filter ตาม query params
  if (departmentId) where.departmentId = departmentId
  if (role) where.role = role

  const users = await prisma.user.findMany({
    where,
    include: {
      department: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      _count: {
        select: {
          projectsOwned: true,
          documents: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ ok: true, data: users })
}

/**
 * PATCH /api/users/:id - อัปเดตข้อมูลผู้ใช้ (Admin only)
 */
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { userId, role, departmentId, is_active } = body

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'กรุณาระบุ userId' },
        },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (role) updateData.role = role
    if (departmentId !== undefined) updateData.departmentId = departmentId
    if (is_active !== undefined) updateData.is_active = is_active

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        department: true,
      },
    })

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: 'UPDATE_USER',
        entity_type: 'user',
        entity_id: user.id,
        metadata: updateData,
      },
    })

    return NextResponse.json({ ok: true, data: user })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      },
      { status: 500 }
    )
  }
}
