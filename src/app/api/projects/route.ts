import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { createProjectSchema } from '@/lib/validation'
import { canManageProject, isAdmin } from '@/lib/rbac'
import { createProjectFolderStructure } from '@/lib/drive'

/**
 * GET /api/projects - ดึงรายการโครงการ
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const fiscalYear = searchParams.get('fiscal_year')
  const departmentId = searchParams.get('department_id')
  const status = searchParams.get('status')

  // สร้าง where clause ตาม role
  const where: any = {}

  // ถ้าไม่ใช่ Admin ให้เห็นเฉพาะแผนกตัวเอง
  if (!isAdmin(session) && session.user.departmentId) {
    where.departmentId = session.user.departmentId
  }

  // Filter ตาม query params
  if (fiscalYear) where.fiscal_year = parseInt(fiscalYear)
  if (departmentId) where.departmentId = departmentId
  if (status) where.status = status

  const projects = await prisma.project.findMany({
    where,
    include: {
      department: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      milestones: {
        select: {
          id: true,
          index_no: true,
          name: true,
          status: true,
          due_date: true,
        },
        orderBy: { index_no: 'asc' },
      },
    },
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json({ ok: true, data: projects })
}

/**
 * POST /api/projects - สร้างโครงการใหม่
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canManageProject(session)) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const validated = createProjectSchema.parse(body)

    // ตรวจสอบว่า code ไม่ซ้ำ
    const existing = await prisma.project.findUnique({
      where: { code: validated.code },
    })

    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'DUPLICATE_CODE', message: 'รหัสโครงการซ้ำ' },
        },
        { status: 400 }
      )
    }

    // ตรวจสอบวันที่
    const startDate = new Date(validated.start_date)
    const endDate = new Date(validated.end_date)

    if (startDate > endDate) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'INVALID_DATE_RANGE', message: 'วันที่ไม่ถูกต้อง' },
        },
        { status: 400 }
      )
    }

    // สร้างโครงการและงวดงาน
    const project = await prisma.project.create({
      data: {
        code: validated.code,
        name: validated.name,
        description: validated.description,
        departmentId: validated.departmentId,
        fiscal_year: validated.fiscal_year,
        ownerId: validated.ownerId || session.user.id,
        start_date: startDate,
        end_date: endDate,
        budget: validated.budget,
        status: 'active',
        milestones: {
          create: validated.milestones.map((m: any) => ({
            index_no: m.index_no,
            name: m.name,
            description: m.description,
            due_date: new Date(m.due_date),
            weight_percent: m.weight_percent,
            status: 'open',
          })),
        },
      },
      include: {
        department: true,
        milestones: true,
      },
    })

    // สร้างโฟลเดอร์บน Google Drive (ถ้าเปิดใช้)
    if (validated.createDriveFolders) {
      try {
        const { projectFolderId, milestoneFolderIds } =
          await createProjectFolderStructure(
            validated.fiscal_year,
            project.department.name,
            validated.code,
            validated.name,
            validated.milestones
          )

        // อัปเดต drive_folder_id
        await prisma.project.update({
          where: { id: project.id },
          data: { drive_folder_id: projectFolderId },
        })

        // อัปเดต milestone folder ids
        for (const milestone of project.milestones) {
          const folderId = milestoneFolderIds[milestone.index_no]
          if (folderId) {
            await prisma.milestone.update({
              where: { id: milestone.id },
              data: { drive_folder_id: folderId },
            })
          }
        }
      } catch (driveError) {
        console.error('Failed to create Drive folders:', driveError)
        // ไม่ throw error เพื่อให้โครงการถูกสร้างได้
      }
    }

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: 'CREATE_PROJECT',
        entity_type: 'project',
        entity_id: project.id,
        metadata: { code: project.code, name: project.name },
      },
    })

    return NextResponse.json({ ok: true, data: project }, { status: 201 })
  } catch (error: any) {
    console.error('Create project error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Invalid data',
        },
      },
      { status: 400 }
    )
  }
}
