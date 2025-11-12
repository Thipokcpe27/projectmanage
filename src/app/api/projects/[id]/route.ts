import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { updateProjectSchema } from '@/lib/validation'
import { canViewProject, canEditProject } from '@/lib/rbac'

/**
 * GET /api/projects/:id - ดึงข้อมูลโครงการ
 */
export async function GET(
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

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      department: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      milestones: {
        include: {
          documents: {
            select: {
              id: true,
              file_name: true,
              file_type: true,
              url: true,
              size_bytes: true,
              uploaded_at: true,
              uploader: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          compliance: true,
        },
        orderBy: { index_no: 'asc' },
      },
    },
  })

  if (!project) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND' } },
      { status: 404 }
    )
  }

  // ตรวจสอบสิทธิ์
  if (!canViewProject(session, project)) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  return NextResponse.json({ ok: true, data: project })
}

/**
 * PATCH /api/projects/:id - แก้ไขโครงการ
 */
export async function PATCH(
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

  const project = await prisma.project.findUnique({
    where: { id: params.id },
  })

  if (!project) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND' } },
      { status: 404 }
    )
  }

  if (!canEditProject(session, project)) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const validated = updateProjectSchema.parse(body)

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...validated,
        start_date: validated.start_date
          ? new Date(validated.start_date)
          : undefined,
        end_date: validated.end_date ? new Date(validated.end_date) : undefined,
      },
      include: {
        department: true,
        owner: true,
        milestones: true,
      },
    })

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: 'UPDATE_PROJECT',
        entity_type: 'project',
        entity_id: project.id,
        metadata: validated,
      },
    })

    return NextResponse.json({ ok: true, data: updated })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/projects/:id - ลบโครงการ
 */
export async function DELETE(
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

  const project = await prisma.project.findUnique({
    where: { id: params.id },
  })

  if (!project) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND' } },
      { status: 404 }
    )
  }

  if (!canEditProject(session, project)) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  await prisma.project.delete({
    where: { id: params.id },
  })

  // บันทึก Activity Log
  await prisma.activityLog.create({
    data: {
      actorId: session.user.id,
      action: 'DELETE_PROJECT',
      entity_type: 'project',
      entity_id: project.id,
      metadata: { code: project.code, name: project.name },
    },
  })

  return NextResponse.json({ ok: true })
}
