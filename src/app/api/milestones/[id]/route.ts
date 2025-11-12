import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { canManageProject } from '@/lib/rbac'

/**
 * PATCH /api/milestones/:id - อัปเดตงวดงาน
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

  try {
    const milestoneId = params.id

    // ตรวจสอบสิทธิ์
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        project: {
          include: { department: true },
        },
      },
    })

    if (!milestone) {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, due_date, weight_percent, status } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (due_date) updateData.due_date = new Date(due_date)
    if (weight_percent !== undefined) updateData.weight_percent = weight_percent
    if (status) updateData.status = status

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData,
    })

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: 'UPDATE_MILESTONE',
        entity_type: 'milestone',
        entity_id: milestoneId,
        metadata: updateData,
      },
    })

    return NextResponse.json({ ok: true, data: updatedMilestone })
  } catch (error: any) {
    console.error('Update milestone error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/milestones/:id - ลบงวดงาน
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

  try {
    const milestoneId = params.id

    // ตรวจสอบสิทธิ์
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        project: {
          include: { department: true },
        },
      },
    })

    if (!milestone) {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN' } },
        { status: 403 }
      )
    }

    // ลบ milestone (cascade จะลบ documents และ requirements)
    await prisma.milestone.delete({
      where: { id: milestoneId },
    })

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: 'DELETE_MILESTONE',
        entity_type: 'milestone',
        entity_id: milestoneId,
        metadata: { name: milestone.name, projectId: milestone.projectId },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Delete milestone error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      },
      { status: 500 }
    )
  }
}
