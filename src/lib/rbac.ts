import { Role } from '@prisma/client'
import { Session } from 'next-auth'

/**
 * ตรวจสอบว่าผู้ใช้มีบทบาทที่อนุญาตหรือไม่
 */
export function hasRole(session: Session | null, allowedRoles: Role[]): boolean {
  if (!session?.user) return false
  return allowedRoles.includes(session.user.role)
}

/**
 * ตรวจสอบว่าผู้ใช้เป็น Admin
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, [Role.ADMIN])
}

/**
 * ตรวจสอบว่าผู้ใช้เป็น Admin หรือ DeptLead
 */
export function isAdminOrDeptLead(session: Session | null): boolean {
  return hasRole(session, [Role.ADMIN, Role.DEPT_LEAD])
}

/**
 * ตรวจสอบว่าผู้ใช้สามารถจัดการโครงการได้
 */
export function canManageProject(session: Session | null): boolean {
  return hasRole(session, [Role.ADMIN, Role.DEPT_LEAD, Role.PM])
}

/**
 * ตรวจสอบว่าผู้ใช้สามารถดูโครงการได้
 */
export function canViewProject(
  session: Session | null,
  project: { departmentId: string; ownerId?: string | null }
): boolean {
  if (!session?.user) return false

  // Admin ดูได้ทั้งหมด
  if (isAdmin(session)) return true

  // DeptLead ดูได้ในแผนกตัวเอง
  if (
    session.user.role === Role.DEPT_LEAD &&
    session.user.departmentId === project.departmentId
  ) {
    return true
  }

  // PM/Member ดูได้ถ้าเป็นเจ้าของหรืออยู่ในแผนกเดียวกัน
  if (
    session.user.role === Role.PM ||
    session.user.role === Role.MEMBER
  ) {
    return (
      project.ownerId === session.user.id ||
      session.user.departmentId === project.departmentId
    )
  }

  return false
}

/**
 * ตรวจสอบว่าผู้ใช้สามารถแก้ไขโครงการได้
 */
export function canEditProject(
  session: Session | null,
  project: { departmentId: string; ownerId?: string | null }
): boolean {
  if (!session?.user) return false

  // Admin แก้ไขได้ทั้งหมด
  if (isAdmin(session)) return true

  // DeptLead แก้ไขได้ในแผนกตัวเอง
  if (
    session.user.role === Role.DEPT_LEAD &&
    session.user.departmentId === project.departmentId
  ) {
    return true
  }

  // PM แก้ไขได้ถ้าเป็นเจ้าของ
  if (session.user.role === Role.PM && project.ownerId === session.user.id) {
    return true
  }

  return false
}

/**
 * ตรวจสอบว่าผู้ใช้สามารถอัปโหลดเอกสารได้
 */
export function canUploadDocument(
  session: Session | null,
  project: { departmentId: string; ownerId?: string | null }
): boolean {
  if (!session?.user) return false

  // Admin, DeptLead, PM, Member อัปโหลดได้
  if (
    hasRole(session, [Role.ADMIN, Role.DEPT_LEAD, Role.PM, Role.MEMBER])
  ) {
    // ต้องอยู่ในแผนกเดียวกันหรือเป็นเจ้าของ
    return (
      isAdmin(session) ||
      session.user.departmentId === project.departmentId ||
      project.ownerId === session.user.id
    )
  }

  return false
}
