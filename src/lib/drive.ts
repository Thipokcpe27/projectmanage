import { google } from 'googleapis'

/**
 * สร้าง Drive client ด้วย Service Account
 */
export async function getDriveClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not configured')
  }

  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  const drive = google.drive({ version: 'v3', auth })
  return drive
}

/**
 * ค้นหาโฟลเดอร์ตามชื่อและ parent
 */
export async function findFolder(
  drive: any,
  name: string,
  parentId?: string
): Promise<string | null> {
  const query = [
    `name='${name.replace(/'/g, "\\'")}'`,
    "mimeType='application/vnd.google-apps.folder'",
    'trashed=false',
    parentId ? `'${parentId}' in parents` : undefined,
  ]
    .filter(Boolean)
    .join(' and ')

  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    pageSize: 1,
  })

  return res.data.files?.[0]?.id || null
}

/**
 * สร้างโฟลเดอร์ (ถ้ายังไม่มี)
 */
export async function ensureFolder(
  drive: any,
  name: string,
  parentId?: string
): Promise<string> {
  // ค้นหาก่อน
  const existingId = await findFolder(drive, name, parentId)
  if (existingId) return existingId

  // สร้างใหม่
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    },
    fields: 'id, name',
  })

  return res.data.id as string
}

/**
 * สร้างโครงสร้างโฟลเดอร์สำหรับโครงการ
 * FY{year}/{department}/{projectCode-projectName}/งวดที่ {n}
 */
export async function createProjectFolderStructure(
  fiscalYear: number,
  departmentName: string,
  projectCode: string,
  projectName: string,
  milestones: Array<{ index_no: number; name: string }>
): Promise<{
  projectFolderId: string
  milestoneFolderIds: Record<number, string>
}> {
  const drive = await getDriveClient()
  const rootFolderId = process.env.DRIVE_ROOT_FOLDER_ID

  // 1. FY folder
  const fyFolderId = await ensureFolder(drive, `FY${fiscalYear}`, rootFolderId)

  // 2. Department folder
  const deptFolderId = await ensureFolder(drive, departmentName, fyFolderId)

  // 3. Project folder
  const projectFolderName = `${projectCode} - ${projectName}`
  const projectFolderId = await ensureFolder(drive, projectFolderName, deptFolderId)

  // 4. Milestone folders
  const milestoneFolderIds: Record<number, string> = {}
  for (const milestone of milestones) {
    const milestoneFolderName = `งวดที่ ${milestone.index_no} - ${milestone.name}`
    const milestoneFolderId = await ensureFolder(
      drive,
      milestoneFolderName,
      projectFolderId
    )
    milestoneFolderIds[milestone.index_no] = milestoneFolderId
  }

  return { projectFolderId, milestoneFolderIds }
}

/**
 * อัปโหลดไฟล์ไปยัง Drive (Resumable Upload)
 */
export async function uploadFileToDrive(
  folderId: string,
  file: File
): Promise<{
  fileId: string
  webViewLink: string
  webContentLink?: string
}> {
  const drive = await getDriveClient()

  const buffer = Buffer.from(await file.arrayBuffer())

  const res = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: [folderId],
    },
    media: {
      mimeType: file.type || 'application/octet-stream',
      body: buffer,
    },
    fields: 'id, webViewLink, webContentLink',
  })

  return {
    fileId: res.data.id!,
    webViewLink: res.data.webViewLink!,
    webContentLink: res.data.webContentLink,
  }
}

/**
 * ตั้งค่าสิทธิ์โฟลเดอร์ (แชร์ให้ domain)
 */
export async function setFolderPermissions(
  folderId: string,
  domain?: string
): Promise<void> {
  const drive = await getDriveClient()
  const targetDomain = domain || process.env.APP_DEFAULT_DOMAIN

  if (!targetDomain) return

  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      type: 'domain',
      role: 'reader',
      domain: targetDomain,
    },
  })
}
