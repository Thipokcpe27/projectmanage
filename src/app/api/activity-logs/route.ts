import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { isAdminOrDeptLead } from '@/lib/rbac'

/**
 * GET /api/activity-logs - ดึงประวัติการทำงาน
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
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const action = searchParams.get('action')
  const entity_type = searchParams.get('entity_type')
  const actorId = searchParams.get('actor_id')

  try {
    const where: any = {}

    // ถ้าเป็น DeptLead ให้เห็นเฉพาะแผนกตัวเอง
    if (session.user.role === 'DEPT_LEAD' && session.user.departmentId) {
      // จำกัดให้เห็นเฉพาะ activities ที่เกี่ยวข้องกับแผนกตัวเอง
      where.OR = [
        {
          actor: {
            departmentId: session.user.departmentId,
          },
        },
        {
          entity_type: 'project',
          // TODO: Join กับ project table เพื่อ filter ตาม department
        },
      ]
    }

    // Filters
    if (action) where.action = action
    if (entity_type) where.entity_type = entity_type
    if (actorId) where.actorId = actorId

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ])

    return NextResponse.json({
      ok: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Activity logs error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      },
      { status: 500 }
    )
  }
}
