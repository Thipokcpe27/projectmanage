import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { canManageProject } from '@/lib/rbac'

/**
 * POST /api/projects/:id/milestones - สร้างงวดงานใหม่
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  try {
    const projectId = params.id

    // ตรวจสอบสิทธิ์
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { department: true },
    })

    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, due_date, weight_percent, requirements } = body

    if (!name || !due_date) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกข้อมูลให้ครบ' },
        },
        { status: 400 }
      )
    }

    // หา index_no ถัดไป
    const lastMilestone = await prisma.milestone.findFirst({
      where: { projectId },
      orderBy: { index_no: 'desc' },
    })

    const index_no = (lastMilestone?.index_no || 0) + 1

    // สร้าง milestone
    const milestone = await prisma.milestone.create({
      data: {
        projectId,
        index_no,
        name,
        description,
        due_date: new Date(due_date),
        weight_percent: weight_percent || 0,
        status: 'open',
      },
    })

    // สร้าง requirements ถ้ามี (ข้าม - จะทำใน version ถัดไป)
    // if (requirements && Array.isArray(requirements)) {
    //   await prisma.documentRequirement.createMany({
    //     data: requirements.map((req: any) => ({
    //       milestoneId: milestone.id,
    //       name: req.name,
    //       file_pattern: req.file_pattern,
    //       is_required: req.is_required || true,
    //     })),
    //   })
    // }

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: 'CREATE_MILESTONE',
        entity_type: 'milestone',
        entity_id: milestone.id,
        metadata: { projectId, name, index_no },
      },
    })

    return NextResponse.json({ ok: true, data: milestone }, { status: 201 })
  } catch (error: any) {
    console.error('Create milestone error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      },
      { status: 500 }
    )
  }
}
