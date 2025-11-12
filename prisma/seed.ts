import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // สร้างแผนก
  const departments = await prisma.department.createMany({
    data: [
      { code: 'ENG', name: 'แผนกวิศวกรรม' },
      { code: 'PRC', name: 'แผนกจัดซื้อ' },
      { code: 'FIN', name: 'แผนกการเงิน' },
      { code: 'IT', name: 'แผนกเทคโนโลยีสารสนเทศ' },
      { code: 'HR', name: 'แผนกทรัพยากรบุคคล' },
    ],
    skipDuplicates: true,
  })

  console.log(`✅ Created ${departments.count} departments`)

  // สร้างผู้ใช้ตัวอย่าง (ต้องมี email จริงสำหรับ OAuth)
  const engDept = await prisma.department.findUnique({ where: { code: 'ENG' } })
  const itDept = await prisma.department.findUnique({ where: { code: 'IT' } })

  if (engDept && itDept) {
    await prisma.user.upsert({
      where: { email: 'admin@company.com' },
      update: {},
      create: {
        email: 'admin@company.com',
        name: 'System Admin',
        role: Role.ADMIN,
        departmentId: itDept.id,
        is_active: true,
      },
    })

    await prisma.user.upsert({
      where: { email: 'pm@company.com' },
      update: {},
      create: {
        email: 'pm@company.com',
        name: 'Project Manager',
        role: Role.PM,
        departmentId: engDept.id,
        is_active: true,
      },
    })

    console.log('✅ Created sample users')
  }

  // สร้างเทมเพลตเอกสารทั่วไป
  const docTemplates = await prisma.docRequirementTemplate.createMany({
    data: [
      {
        scope: 'global',
        code: 'DOC-001',
        name: 'ใบตรวจรับงวดงาน',
        is_required_default: true,
        note: 'เอกสารบังคับสำหรับทุกงวด',
      },
      {
        scope: 'global',
        code: 'DOC-002',
        name: 'ใบส่งมอบงาน',
        is_required_default: true,
        note: 'เอกสารส่งมอบงานให้ผู้ว่าจ้าง',
      },
      {
        scope: 'global',
        code: 'DOC-003',
        name: 'รูปถ่ายหน้างาน',
        is_required_default: false,
        note: 'รูปถ่ายความคืบหน้า (ถ้ามี)',
      },
      {
        scope: 'department',
        scope_ref: 'ENG',
        code: 'DOC-ENG-001',
        name: 'แบบรูปทางวิศวกรรม',
        is_required_default: true,
        note: 'สำหรับแผนกวิศวกรรม',
      },
      {
        scope: 'department',
        scope_ref: 'PRC',
        code: 'DOC-PRC-001',
        name: 'ใบเสนอราคา',
        is_required_default: true,
        note: 'สำหรับแผนกจัดซื้อ',
      },
    ],
    skipDuplicates: true,
  })

  console.log(`✅ Created ${docTemplates.count} document templates`)

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
