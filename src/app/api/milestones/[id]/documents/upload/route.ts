import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { uploadFileToDrive } from '@/lib/drive'
import { canUploadDocument } from '@/lib/rbac'

/**
 * POST /api/milestones/:id/documents/upload - อัปโหลดเอกสาร
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

  // ดึงข้อมูล milestone และ project
  const milestone = await prisma.milestone.findUnique({
    where: { id: params.id },
    include: {
      project: {
        include: {
          department: true,
        },
      },
    },
  })

  if (!milestone) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } },
      { status: 404 }
    )
  }

  if (!milestone.drive_folder_id) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'NO_FOLDER', message: 'Drive folder not configured' },
      },
      { status: 400 }
    )
  }

  // ตรวจสอบสิทธิ์
  if (!canUploadDocument(session, milestone.project)) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_FILE', message: 'No file provided' } },
        { status: 400 }
      )
    }

    // ตรวจสอบขนาดไฟล์
    const maxSizeMB = parseInt(process.env.UPLOAD_MAX_MB || '50')
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds ${maxSizeMB}MB`,
          },
        },
        { status: 400 }
      )
    }

    // อัปโหลดไป Google Drive
    const { fileId, webViewLink } = await uploadFileToDrive(
      milestone.drive_folder_id,
      file
    )

    // บันทึกลง DB
    const document = await prisma.document.create({
      data: {
        milestoneId: milestone.id,
        drive_file_id: fileId,
        file_name: file.name,
        file_type: file.type,
        url: webViewLink,
        size_bytes: BigInt(file.size),
        uploadedBy: session.user.id,
        meta_json: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: 'UPLOAD_DOCUMENT',
        entity_type: 'document',
        entity_id: document.id,
        metadata: {
          milestoneId: milestone.id,
          projectId: milestone.projectId,
          fileName: file.name,
          fileSize: file.size,
        },
      },
    })

    return NextResponse.json(
      {
        ok: true,
        data: {
          ...document,
          size_bytes: document.size_bytes?.toString(),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error.message || 'Failed to upload file',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/milestones/:id/documents - ดึงรายการเอกสาร
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

  const documents = await prisma.document.findMany({
    where: { milestoneId: params.id },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { uploaded_at: 'desc' },
  })

  return NextResponse.json({
    ok: true,
    data: documents.map((doc) => ({
      ...doc,
      size_bytes: doc.size_bytes?.toString(),
    })),
  })
}
