import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/rbac'

/**
 * GET /api/reports/progress - รายงานความคืบหน้าโครงการ
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

  try {
    const where: any = {}

    // ถ้าไม่ใช่ Admin ให้เห็นเฉพาะแผนกตัวเอง
    if (!isAdmin(session) && session.user.departmentId) {
      where.departmentId = session.user.departmentId
    }

    if (fiscalYear) where.fiscal_year = parseInt(fiscalYear)
    if (departmentId) where.departmentId = departmentId

    const projects = await prisma.project.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        milestones: {
          include: {
            documents: {
              select: {
                id: true,
              },
            },
            compliance: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    // คำนวณสถิติ
    const report = projects.map((project: any) => {
      const totalMilestones = project.milestones.length
      const completedMilestones = project.milestones.filter(
        (m: any) => m.status === 'completed'
      ).length
      const progress =
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0

      const totalDocuments = project.milestones.reduce(
        (sum: number, m: any) => sum + m.documents.length,
        0
      )

      const complianceStats = project.milestones.reduce(
        (acc: any, m: any) => {
          m.compliance.forEach((c: any) => {
            if (c.status === 'full') acc.full++
            else if (c.status === 'missing') acc.missing++
            else if (c.status === 'na') acc.na++
          })
          return acc
        },
        { full: 0, missing: 0, na: 0 }
      )

      return {
        projectId: project.id,
        projectCode: project.code,
        projectName: project.name,
        department: project.department.name,
        owner: project.owner?.name || '-',
        fiscalYear: project.fiscal_year,
        status: project.status,
        startDate: project.start_date,
        endDate: project.end_date,
        totalMilestones,
        completedMilestones,
        progress,
        totalDocuments,
        compliance: complianceStats,
      }
    })

    return NextResponse.json({ ok: true, data: report })
  } catch (error: any) {
    console.error('Progress report error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      },
      { status: 500 }
    )
  }
}
