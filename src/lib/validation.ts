import { z } from 'zod'

/**
 * Schema สำหรับสร้างโครงการ
 */
export const createProjectSchema = z.object({
  code: z.string().min(1, 'รหัสโครงการต้องไม่ว่าง').max(50),
  name: z.string().min(1, 'ชื่อโครงการต้องไม่ว่าง').max(255),
  description: z.string().optional(),
  departmentId: z.string().uuid('แผนกไม่ถูกต้อง'),
  fiscal_year: z.number().int().min(2000).max(2100),
  ownerId: z.string().uuid().optional(),
  start_date: z.string().or(z.date()),
  end_date: z.string().or(z.date()),
  budget: z.number().optional(),
  createDriveFolders: z.boolean().default(true),
  milestones: z
    .array(
      z.object({
        index_no: z.number().int().min(1),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        due_date: z.string().or(z.date()),
        weight_percent: z.number().int().min(0).max(100).optional(),
      })
    )
    .min(1, 'ต้องมีอย่างน้อย 1 งวด'),
})

/**
 * Schema สำหรับแก้ไขโครงการ
 */
export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'on_hold', 'cancelled']).optional(),
  ownerId: z.string().uuid().optional(),
  start_date: z.string().or(z.date()).optional(),
  end_date: z.string().or(z.date()).optional(),
  budget: z.number().optional(),
})

/**
 * Schema สำหรับสร้างงวดงาน
 */
export const createMilestoneSchema = z.object({
  index_no: z.number().int().min(1),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  due_date: z.string().or(z.date()),
  weight_percent: z.number().int().min(0).max(100).optional(),
  createDriveFolder: z.boolean().default(true),
})

/**
 * Schema สำหรับอัปเดตสถานะงวดงาน
 */
export const updateMilestoneStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'completed', 'overdue']),
})

/**
 * Schema สำหรับอัปเดต Document Compliance
 */
export const updateComplianceSchema = z.object({
  requirement_code: z.string(),
  status: z.enum(['full', 'missing', 'na']),
  note: z.string().optional(),
})

/**
 * ตรวจสอบว่าวันที่ถูกต้อง
 */
export function validateDateRange(
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return start <= end
}

/**
 * ตรวจสอบว่างวดงานอยู่ในช่วงโครงการ
 */
export function validateMilestoneInProjectRange(
  milestoneDate: Date | string,
  projectStart: Date | string,
  projectEnd: Date | string
): boolean {
  const milestone = new Date(milestoneDate)
  const start = new Date(projectStart)
  const end = new Date(projectEnd)
  return milestone >= start && milestone <= end
}

/**
 * ตรวจสอบว่าน้ำหนักรวมไม่เกิน 100%
 */
export function validateTotalWeight(weights: (number | null | undefined)[]): boolean {
  const total = weights.reduce((sum, w) => sum + (w || 0), 0)
  return total <= 100
}

/**
 * Sanitize ชื่อไฟล์/โฟลเดอร์
 */
export function sanitizeFolderName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 255)
}
