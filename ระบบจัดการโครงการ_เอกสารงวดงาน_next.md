# ระบบจัดการโครงการ + เอกสารงวดงานบน Google Drive (สเปกฉบับเต็ม)

> Tech stack เป้าหมาย: **Next.js (App Router) + Semantic UI React + Vercel (Hobby/Free)**, ฐานข้อมูล **PostgreSQL** (เช่น Supabase/Neon), **Google OAuth & Google Drive API**. ไม่มี Approval Workflow (คุณดูแลเอง) แต่มี **Document Compliance** ครบ/ขาด/ไม่ใช้

---

## 0) TL;DR
- ผู้ใช้ที่มีสิทธิ์สามารถ **สร้างโครงการด้วยตนเอง**: ระบุปีงบประมาณ/แผนก/วันเริ่ม–สิ้นสุด/จำนวนงวด/เช็กลิสต์เอกสารต่องวด
- ระบบสร้าง **โฟลเดอร์ Google Drive อัตโนมัติ** ตามโครงสร้าง: `FY{ปีงบประมาณ}/{แผนก}/{รหัส-ชื่อโครงการ}/งวดที่ {n}` และบันทึก `drive_folder_id`
- อัปโหลดเอกสารงวดงาน → ไปยังโฟลเดอร์ของงวดนั้นบน Drive พร้อมเก็บเมตาดาต้า + link ใน DB
- Dashboard แสดงภาพรวมความคืบหน้า งวดที่ค้าง เอกสารครบ/ขาด, รายงาน Export ได้
- รองรับ RBAC พื้นฐาน (Admin/DepartmentLead/PM/Member/ReadOnly)
- **Deploy บน Vercel (Free/Hobby ได้)** แต่มีข้อจำกัดด้านเวลาทำงานของ Serverless, ไม่มีงาน background ยาว ๆ, ใช้บริการ DB ภายนอก, และต้องควบคุมขนาดไฟล์/ปริมาณอัปโหลด

---

## 1) โมดูลของระบบ (เรียงตามความสำคัญ)

### A. Core Project Management (สูงสุด)
1. **Projects**: CRUD, ค้นหา, ฟิลเตอร์ (ปีงบ/แผนก/สถานะ)
2. **Milestones (งวดงาน)**: สร้าง/แก้ไขลำดับงวด, เส้นตาย, น้ำหนัก%
3. **Document Compliance**: เช็กลิสต์เอกสารต่องวด (Full/Missing/NA)
4. **Google Drive Integration**: สร้างโฟลเดอร์, อัปโหลดไฟล์, ตั้ง permissions, เก็บ link

### B. Visibility & Reporting (สูง)
5. **Dashboard**: KPI รวม, การ์ดโครงการเสี่ยง/ค้าง, ปฏิทินเส้นตาย
6. **Reports**: ความคืบหน้าแยกแผนก/โครงการ, Document readiness, งวดค้าง, Export CSV/PDF

### C. Collaboration (กลาง)
7. **Tasks (Optional ใน MVP)**: งานย่อย+ผู้รับผิดชอบ+สถานะ
8. **Comments/Activity Log**: บันทึกเหตุการณ์และโน้ตโครงการ/งวด

### D. Admin & Settings (กลาง)
9. **RBAC**: บทบาท–สิทธิ์ตามแผนก/โครงการ
10. **Templates**: เทมเพลตงวดงาน/เช็กลิสต์เอกสารรายแผนก/ประเภทโครงการ
11. **Drive Naming/Policy**: เทมเพลตชื่อโฟลเดอร์, นโยบายแชร์ (domain-only / link)

### E. Convenience (หลังบ้าน/ภายหลัง)
12. **Notifications**: เตือนใกล้ครบกำหนด (Email/Webhook/Line) — ใช้ Vercel Scheduled Functions ได้แบบเบา ๆ
13. **Bulk Import**: สร้างโครงการจาก CSV/Excel

---

## 2) สถาปัตยกรรมโดยสรุป
```
Next.js (App Router) + Semantic UI
  ├─ UI Pages & API Routes (/app, /api/*)
  ├─ Auth: Google OAuth (NextAuth.js)
  ├─ Drive Service (server-side, fetch Google APIs)
  ├─ DB Access: Prisma + Postgres (Supabase/Neon)
  └─ Edge/Serverless Functions (Vercel)
```
- **เหตุผล**: ใช้ API Routes ของ Next.js แยกชั้น backend บน Vercel serverless; เรียก Google Drive API ด้วย service account หรือ user delegated (ผ่าน OAuth) ตามนโยบายสิทธิ์องค์กร

---

## 3) โครงสร้างโฟลเดอร์บน Google Drive
```
Drive/
└── FY2569/
    └── แผนกวิศวกรรม/
        └── P-2026-001 - โครงการระบบน้ำมันโรงงาน/
            ├── งวดที่ 1 - ออกแบบ/
            │   ├── ใบตรวจรับงวดงาน.pdf
            │   ├── ใบส่งมอบงาน.docx
            │   └── รูปถ่ายหน้างาน.zip
            └── งวดที่ 2 - จัดหา/
```
- บันทึก `drive_folder_id` ทั้งระดับโครงการและงวดงานไว้ใน DB

---

## 4) แบบจำลองข้อมูล (ERD + ตาราง)

### 4.1 ERD (ASCII)
```
DEPARTMENTS (id) 1----* PROJECTS (id) 1----* MILESTONES (id) 1----* DOCUMENTS (id)
         |                             |                           
         |                             └----* TASKS (optional)     
         └----* USERS (id)

MILESTONES 1----* DOC_REQUIREMENTS_MILESTONE (* requirement per milestone instance)
DOC_REQUIREMENTS (template) -> materialize -> DOC_REQUIREMENTS_MILESTONE
MILESTONES 1----* DOC_COMPLIANCE (status per requirement)

ACTIVITY_LOGS (audit), PERMISSIONS_OVERRIDES (granular RBAC, optional)
```

### 4.2 คำจำกัดความคอลัมน์หลัก
- **departments**: id, code, name
- **users**: id, name, email, role, department_id, is_active
- **projects**: id, code (unique), name, department_id, fiscal_year, owner_id, start_date, end_date, budget, status, drive_folder_id, created_at, updated_at
- **milestones**: id, project_id, index_no, name, due_date, weight_percent, status, drive_folder_id, created_at, updated_at
- **documents**: id, milestone_id, drive_file_id, file_name, file_type, version, url, uploaded_by, uploaded_at, size_bytes, meta_json
- **doc_requirements** (template): id, scope (global/department/project_type), scope_ref, code, name, is_required_default, note
- **doc_requirements_milestone**: id, milestone_id, requirement_code, name, is_required, note
- **doc_compliance**: id, milestone_id, requirement_code, status (full/missing/na), checked_by, checked_at, note
- **tasks** (optional): id, milestone_id, title, assignee_id, status, due_date, last_update_at
- **activity_logs**: id, actor_id, action, entity_type, entity_id, metadata, created_at, ip
- **permissions_overrides** (optional): id, entity_type, entity_id, subject_type (user/role), subject_id, scope (view/edit/upload/admin)

### 4.3 ตัวอย่างสคีมา SQL (PostgreSQL)
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN','DEPT_LEAD','PM','MEMBER','READONLY')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  fiscal_year INT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget NUMERIC(14,2),
  status TEXT NOT NULL DEFAULT 'active',
  drive_folder_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_projects_code UNIQUE (code)
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  index_no INT NOT NULL,
  name TEXT NOT NULL,
  due_date DATE NOT NULL,
  weight_percent INT CHECK (weight_percent BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'open',
  drive_folder_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_milestone_order UNIQUE (project_id, index_no)
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  drive_file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  version INT,
  url TEXT NOT NULL,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta_json JSONB
);

CREATE TABLE doc_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('global','department','project_type')),
  scope_ref TEXT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_required_default BOOLEAN NOT NULL DEFAULT true,
  note TEXT
);

CREATE TABLE doc_requirements_milestone (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  requirement_code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  note TEXT
);

CREATE TABLE doc_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  requirement_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('full','missing','na')),
  checked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  checked_at TIMESTAMPTZ,
  note TEXT,
  CONSTRAINT uq_compliance UNIQUE (milestone_id, requirement_code)
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

> หมายเหตุ: ใช้ `gen_random_uuid()` จาก `pgcrypto`; ถ้าไม่พร้อมให้ใช้ `uuid-ossp` หรือสร้างที่แอป

---

## 5) API Design (ตัวอย่างสำคัญ)

### Auth & User
- `GET /api/me` – ข้อมูลผู้ใช้ผ่าน OAuth
- `GET /api/users` – เฉพาะ Admin/DeptLead

### Projects
- `POST /api/projects` – สร้างโครงการ + งวด + (option) Drive folders
- `GET /api/projects?fiscal_year=&department_id=&status=`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`

### Milestones
- `POST /api/projects/:id/milestones` – เพิ่มงวดใหม่ (พร้อมสร้างโฟลเดอร์)
- `PATCH /api/milestones/:id`
- `PUT /api/milestones/:id/requirements` – เซ็ตเช็กลิสต์เอกสารของงวด
- `PUT /api/milestones/:id/compliance` – อัปเดต Full/Missing/NA เป็นชุด

### Documents
- `POST /api/milestones/:id/documents/upload` – multipart → อัปโหลดไป Drive → บันทึก DB
- `GET /api/milestones/:id/documents` – รายการไฟล์ + เมตาดาต้า

### Admin
- `GET/POST /api/admin/templates/requirements` – เทมเพลตเอกสาร
- `GET/POST /api/admin/templates/milestones` – เทมเพลตงวดงานตามประเภทโปรเจกต์/แผนก
- `GET/POST /api/admin/drive-policy` – เทมเพลตตั้งชื่อ/สิทธิ์แชร์

**รูปแบบ Response (ย่อ)**
```json
{
  "ok": true,
  "data": { /* ...ตาม resource... */ }
}
```
หรือ error:
```json
{
  "ok": false,
  "error": {"code":"VALIDATION_ERROR","message":"milestone.due_date out of range"}
}
```

---

## 6) Workflow การทำงาน (End-to-End)

### 6.1 สร้างโครงการ (โดย PM/DeptLead/Admin)
1) กรอกฟอร์ม: code, name, department, fiscal_year, owner, start/end, จำนวนงวด หรือเลือกเทมเพลตงวด
2) ระบุรายละเอียดงวด: ชื่อ, due_date, weight%, เช็กลิสต์เอกสารต่องวด
3) Submit → API บันทึก DB
4) ถ้าเปิด option “สร้างโฟลเดอร์ Drive”:
   - Ensure FY folder → Department folder → Project folder → Milestone folders
   - บันทึก `drive_folder_id` ทั้งหมด
5) กลับหน้า **Project Detail** พร้อมลิงก์ “เปิดโฟลเดอร์ใน Drive”

### 6.2 อัปโหลดเอกสารงวดงาน
1) ผู้ใช้เข้า **Milestone Documents** → Drag & Drop
2) Serverless รับไฟล์ (ขนาดจำกัด) แล้วอัปโหลดต่อไป Google Drive (Resumable upload)
3) บันทึกข้อมูลเอกสารลง `documents` + อัปเดต compliance auto (ถ้าตั้ง rule ตามชื่อไฟล์/แท็ก)

### 6.3 ติดตามความคืบหน้า & เอกสารครบถ้วน
- Dashboard แสดงสรุป: โครงการ/งวดที่ใกล้ครบกำหนด, เอกสารขาด, % รวม (ถ่วงน้ำหนัก)
- รายงาน Export CSV/PDF สำหรับผู้บริหาร/หัวหน้าแผนก

### 6.4 การเปลี่ยนทีม/สิทธิ์
- เมื่อ PM/สมาชิกเปลี่ยน → Sync permissions กับ Drive (ปรับแบบเบา ๆ เฉพาะโฟลเดอร์โครงการ)

---

## 7) UI/UX (Next.js + Semantic UI React)

### 7.1 โครงหน้าหลัก (App Router)
```
/app
  /dashboard
  /projects
    /new (Wizard 3 ขั้น)
    /[projectId]
      /overview
      /milestones
      /documents
      /reports
  /admin
    /templates
    /drive-policy
```

### 7.2 คอมโพเนนต์สำคัญ (Semantic UI)
- **DataTable + Filters**: `<Table>`, `<Dropdown>`, `<Input icon='search'>`, `<Pagination>`
- **Wizard**: `<Step.Group>` + `<Form>` + `<Progress>`
- **Cards & KPIs**: `<Card.Group>` สำหรับสรุป KPI, โครงการเสี่ยง
- **Uploads**: `<Segment placeholder>` + drag & drop (react-dropzone) + status `<List>`
- **Badges/Labels**: `<Label color='green'|'red'|'grey'>` สำหรับ compliance
- **Breadcrumb**: FY → Department → Project → Milestone (<Breadcrumb>)

### 7.3 ตัวอย่างฟอร์มสร้างโครงการ (ฟิลด์หลัก)
- รหัส/ชื่อโครงการ (required)
- แผนก (Dropdown)
- ปีงบประมาณ (Number / Dropdown)
- วันเริ่ม–สิ้นสุด (Date pickers)
- จำนวนงวด (Number) หรือ เลือกเทมเพลตงวด
- สำหรับแต่ละงวด: ชื่อ, due_date, weight%, เช็กลิสต์เอกสาร (multiple select + toggle required)
- Checkbox: "สร้างโฟลเดอร์ Google Drive อัตโนมัติ"

---

## 8) การเชื่อมต่อ Google Drive

### 8.1 รูปแบบการยืนยันตัวตน
- **ทางเลือก A (แนะนำสำหรับองค์กร)**: Service Account + Domain-wide Delegation → ระบบเป็นเจ้าของโฟลเดอร์/ไฟล์, แชร์ให้ผู้ใช้ในโดเมน
- **ทางเลือก B**: OAuth ของผู้ใช้ (User consent) → ใช้โควต้า user และสิทธิ์ตามบัญชีผู้ใช้

### 8.2 Scopes ที่ต้องใช้ (อย่างน้อย)
- `drive.file` (อัปโหลด/เข้าถึงไฟล์ที่แอปสร้าง)
- `drive` (ถ้าต้องบริหารโฟลเดอร์/สิทธิ์อย่างยืดหยุ่น)

### 8.3 ฟังก์ชันหลังบ้าน (Pseudo)
```ts
async function ensureFiscalYearFolder(year) {}
async function ensureDepartmentFolder(parentId, department) {}
async function ensureProjectFolder(parentId, code, name) {}
async function ensureMilestoneFolder(parentId, idx, name) {}
async function uploadToMilestone(folderId, file, meta) {}
async function setFolderPermissions(folderId, policy) {}
```

### 8.4 ข้อควรระวังโควต้า/Rate Limit
- รวมอัปโหลดหลายไฟล์ควรเป็น **resumable uploads**
- จัดคิว (serialize) บางจุดเพื่อลด 429
- เก็บแคช mapping name→id ของโฟลเดอร์ เพื่อลด list/search ซ้ำ

---

## 9) ความปลอดภัย & สิทธิ์ (RBAC)
- บทบาท: `ADMIN`, `DEPT_LEAD`, `PM`, `MEMBER`, `READONLY`
- ขอบเขต: System / Department / Project / Milestone
- บังคับใช้ทั้งที่ UI และ API (middleware ตรวจ role/ownership)
- แชร์ Drive แบบ **domain-restricted** โดยค่าเริ่มต้น (เปลี่ยนได้ใน Admin)
- บันทึก **Activity Logs** ทุกการเปลี่ยนแปลงสำคัญ

---

## 10) การดีพลอยบน Vercel (Free/Hobby) และข้อจำกัด

### 10.1 ทำได้ไหม? — **ทำได้** สำหรับ MVP/ทีมขนาดเล็ก ด้วยข้อจำกัดต่อไปนี้
- **Serverless Function Timeout (Hobby): ~10s** → งานยาว (อัปโหลดไฟล์ใหญ่มาก/ซิงก์สิทธิ์จำนวนมาก) อาจ timeout
- **ไม่มี Background Workers ถาวร** → ใช้ *Vercel Scheduled Functions* สำหรับงานเตือนรายวัน/รายชั่วโมงแบบเบา ๆ หรือผลักงานหนักไปยัง external queue
- **ที่เก็บไฟล์**: ไม่เก็บบน Vercel → ส่งตรงไป Google Drive (client→Drive หรือ serverless proxy แบบสั้น)
- **ฐานข้อมูล**: ใช้ผู้ให้บริการภายนอก (Supabase/Neon) แทน Vercel Storage (ที่ยังไม่เหมาะสำหรับ relational ในแผนฟรี)
- **คอนเคอร์เรนซี/โควต้า**: ผู้ใช้งานพร้อมกันมาก ๆ อาจติดลิมิต → เฝ้าดูและปรับแต่ง cache/ลด round-trips

### 10.2 Best Practices บน Vercel Free
- ใช้ **Edge Runtime** สำหรับ endpoint เบา/อ่านอย่างเดียว, ใช้ **Node.js Serverless** สำหรับอัปโหลดไป Drive
- จำกัดขนาดอัปโหลด (เช่น ≤ 25–50MB ต่อไฟล์ ใน MVP) แล้วทำ **client-side resumable uploads** → ส่งตรงไป Drive เพื่อลดเวลาประมวลผลเซิร์ฟเวอร์
- ใช้ **NextAuth.js** + `@next-auth/prisma-adapter`
- แยก ENV: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `DRIVE_ROOT_FOLDER_ID`, `DATABASE_URL`
- ทำ Retry/Backoff กับ 429/5xx ของ Google API
- ใช้ **SWR/React Query** สำหรับ client caching ลดโหลด API

### 10.3 เมื่อควรอัปเกรด
- ต้องการ Scheduled Jobs หนัก/ถี่, หรืออัปโหลดไฟล์ใหญ่จำนวนมาก, หรือทีมผู้ใช้จำนวนสูง → พิจารณา Vercel Pro + คิวภายนอก (Upstash/Cloud Tasks)

---

## 11) Roadmap ตามลำดับความสำคัญ

### Phase 0 — Infra & Auth (สัปดาห์ 1)
- Setup Next.js + Semantic UI + NextAuth (Google) + Prisma + Postgres (Supabase)
- โครงสร้างตารางหลัก + Migration + Seed แผนก/บทบาท

### Phase 1 — Core & Drive (สัปดาห์ 2–3)
- สร้างโครงการ + งวด + เช็กลิสต์เอกสาร (Wizard)
- สร้างโฟลเดอร์บน Drive อัตโนมัติ + บันทึก `drive_folder_id`
- หน้าโครงการ/งวด + เอกสาร + อัปโหลดไป Drive (resumable)
- Dashboard พื้นฐาน + Activity Logs

### Phase 2 — Reporting & Templates (สัปดาห์ 4–5)
- รายงาน Progress / Document Readiness + Export CSV/PDF
- เทมเพลตงวดงาน/เอกสารระดับแผนก/ประเภทโครงการ

### Phase 3 — Notifications & Polish (สัปดาห์ 6+)
- แจ้งเตือนกำหนดส่ง/เอกสารขาด (Vercel Scheduled Functions)
- Bulk Import CSV, ปรับ UX (saved views, search เสถียร)
- Permission Sync เพิ่มเติมเมื่อมีการเปลี่ยนทีมบ่อย

---

## 12) Validation & Business Rules ที่สำคัญ
- รหัสโครงการ `code` ไม่ซ้ำ (ทั้งระบบหรือภายในปีงบเดียวกัน—กำหนดได้)
- `start_date ≤ end_date`, และ `milestone.due_date` อยู่ในช่วงโครงการ
- `weight_percent` รวม ≤ 100
- `index_no` ต่อโครงการไม่ซ้ำ
- ป้องกันลบงวดที่มีเอกสารถูกอัปโหลดแล้ว (หรือบังคับย้าย)
- ชื่อโฟลเดอร์/ไฟล์ sanitize (ไม่มีอักขระต้องห้าม)

---

## 13) ตัวอย่างโค้ดสั้น ๆ (โครง API Upload → Drive ด้วย Serverless)
```ts
// /app/api/milestones/[id]/documents/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { driveResumableUpload } from '@/lib/drive';

export async function POST(req: NextRequest, { params }: { params: { id: string }}) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ ok: false, error: { code: 'UNAUTH' }}, { status: 401 });

  const milestone = await prisma.milestones.findUnique({ where: { id: params.id }});
  if (!milestone?.drive_folder_id) return NextResponse.json({ ok: false, error: { code: 'NO_FOLDER' }}, { status: 400 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ ok: false, error: { code: 'NO_FILE' }}, { status: 400 });

  // Upload ตรงไปที่ Drive
  const { fileId, webViewLink } = await driveResumableUpload(milestone.drive_folder_id, file);

  // บันทึก DB
  await prisma.documents.create({
    data: {
      milestone_id: milestone.id,
      drive_file_id: fileId,
      file_name: file.name,
      file_type: file.type,
      url: webViewLink,
      uploaded_by: session.user.id
    }
  });

  return NextResponse.json({ ok: true, data: { fileId, url: webViewLink }});
}
```

---

## 14) การทดสอบและสังเกตการณ์
- Unit/Integration: ฟังก์ชัน Drive (mock), Validation, RBAC middleware
- E2E: Create Project Wizard, Upload Documents Flow
- Monitoring: Vercel Analytics + Log drains (Better Stack/Sentry) + DB logs

---

## 15) สิ่งที่ต้องเตรียม (Checklist ก่อนใช้งานจริง)
- Google Cloud Project + OAuth Consent + Credentials (Web + Service Account ถ้าใช้)
- เปิดใช้ Google Drive API
- กำหนดโฟลเดอร์ราก `DRIVE_ROOT_FOLDER_ID` สำหรับทั้งระบบ
- DB: สร้าง instance + ตั้งค่า `DATABASE_URL`
- ENV ทั้งหมดตั้งใน Vercel Project (Production/Preview/Dev)
- Seed แผนก/ผู้ใช้บทบาทหลัก, นโยบายแชร์เริ่มต้น

---

## 16) สรุปคำตอบคำถาม: ใช้บน Vercel Free ได้ไหม?
**ได้สำหรับ MVP และทีมไม่ใหญ่มาก** โดย:
- จำกัดขนาดไฟล์และจำนวนอัปโหลดต่อครั้ง
- ใช้ resumable uploads ตรงไป Google Drive เพื่อลดเวลา serverless
- ใช้ DB ภายนอก (Supabase/Neon)
- งานแจ้งเตือนให้ใช้ Scheduled Functions แบบเบา ๆ
- เมื่อใช้งานจริงหนักขึ้น → อัปเกรด Pro/ใช้คิวภายนอกตามความเหมาะสม

---

> พร้อมต่อ: หากต้องการ ผมสามารถแตก **Prisma schema**, **รายการ API แบบละเอียดทุกฟิลด์**, หรือ **ชุดหน้าจอ Figma Wireframe** ให้ต่อในรอบถัดไปได้ทันที



---

## 17) Prisma schema (พร้อมใช้งานกับ Supabase/Neon)
> วางไฟล์ที่ `prisma/schema.prisma` และใช้ Prisma Client บน API Routes (server-only)
```prisma
// prisma/schema.prisma

// --- Generators & Datasource ---
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // ใช้พารามิเตอร์ pgbouncer/ssl จาก .env
}

// --- Enums ---
enum Role { ADMIN DEPT_LEAD PM MEMBER READONLY }
enum DocStatus { full missing na }

// --- Models ---
model Department {
  id    String  @id @default(uuid())
  code  String  @unique
  name  String
  users User[]
  projects Project[]
}

model User {
  id            String     @id @default(uuid())
  name          String
  email         String     @unique
  role          Role
  is_active     Boolean    @default(true)
  department    Department? @relation(fields: [departmentId], references: [id])
  departmentId  String?
  projectsOwned Project[]  @relation("ProjectOwner")
  documents     Document[] @relation("Uploader")
  activityLogs  ActivityLog[] @relation("Actor")
}

model Project {
  id             String      @id @default(uuid())
  code           String
  name           String
  fiscal_year    Int
  status         String      @default("active")
  budget         Decimal?
  start_date     DateTime
  end_date       DateTime
  drive_folder_id String?
  created_at     DateTime    @default(now())
  updated_at     DateTime    @updatedAt

  // relations
  department   Department @relation(fields: [departmentId], references: [id])
  departmentId String
  owner        User?      @relation("ProjectOwner", fields: [ownerId], references: [id])
  ownerId      String?
  milestones   Milestone[]

  @@unique([code])
}

model Milestone {
  id              String   @id @default(uuid())
  index_no        Int
  name            String
  due_date        DateTime
  weight_percent  Int?
  status          String   @default("open")
  drive_folder_id String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  project   Project @relation(fields: [projectId], references: [id])
  projectId String

  documents   Document[]
  requirements DocRequirementMilestone[]
  compliance  DocCompliance[]

  @@unique([projectId, index_no])
}

model Document {
  id            String   @id @default(uuid())
  drive_file_id String
  file_name     String
  file_type     String?
  version       Int?
  url           String
  size_bytes    BigInt?
  uploaded_at   DateTime @default(now())
  meta_json     Json?

  milestone   Milestone @relation(fields: [milestoneId], references: [id])
  milestoneId String

  uploader   User?     @relation("Uploader", fields: [uploadedBy], references: [id])
  uploadedBy String?
}

model DocRequirementTemplate {
  id                  String  @id @default(uuid())
  scope               String  // global | department | project_type
  scope_ref           String?
  code                String
  name                String
  is_required_default Boolean @default(true)
  note                String?
}

model DocRequirementMilestone {
  id              String   @id @default(uuid())
  milestone       Milestone @relation(fields: [milestoneId], references: [id])
  milestoneId     String
  requirement_code String
  name            String
  is_required     Boolean   @default(true)
  note            String?
}

model DocCompliance {
  id              String   @id @default(uuid())
  milestone       Milestone @relation(fields: [milestoneId], references: [id])
  milestoneId     String
  requirement_code String
  status          DocStatus
  checked_by      String?
  checked_at      DateTime?
  note            String?

  @@unique([milestoneId, requirement_code])
}

model ActivityLog {
  id         String   @id @default(uuid())
  action     String
  entity_type String
  entity_id  String?
  metadata   Json?
  ip         String?
  created_at DateTime @default(now())

  actor   User?   @relation("Actor", fields: [actorId], references: [id])
  actorId String?
}
```

---

## 18) .env.example (ตัวแปรสภาพแวดล้อม)
> สร้างไฟล์ `.env.example` แล้วคัดลอกไป `.env.local` / ตั้งใน Vercel → Project Settings
```dotenv
# Database (Supabase/Neon)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require&pgbouncer=true&connect_timeout=15"

# NextAuth (Google OAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-strong-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Google Service Account (ถ้าใช้แบบ SA)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"svc@project.iam.gserviceaccount.com","client_id":"...","token_uri":"https://oauth2.googleapis.com/token"}'
# โฟลเดอร์รากบน Drive สำหรับระบบนี้
DRIVE_ROOT_FOLDER_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"

# อื่น ๆ
APP_DEFAULT_DOMAIN="your-company.com"   # ใช้กำหนดนโยบายแชร์แบบ domain
UPLOAD_MAX_MB="50"                      # จำกัดขนาดไฟล์อัปโหลด
```

---

## 19) README (Dev Setup & Deploy บน Vercel)

### 19.1 เตรียมเครื่องมือ
- Node.js LTS, PNPM/Yarn/NPM
- บัญชี Supabase หรือ Neon (Postgres)
- บัญชี Google Cloud + เปิดใช้ Google Drive API

### 19.2 ตั้งค่า Database (Supabase แนะนำ)
1) สร้าง Project → คัดลอก Connection string (ใช้ `?sslmode=require&pgbouncer=true`)
2) ตั้ง **Connection Pooling/pgBouncer** เป็น `transaction` mode
3) ตั้งค่า `DATABASE_URL` ใน `.env.local`

### 19.3 ตั้ง Prisma & Migration
```bash
pnpm add -D prisma
pnpm add @prisma/client
npx prisma migrate dev --name init
npx prisma generate
```
> ถ้าใช้ CI/Prod: `npx prisma migrate deploy`

### 19.4 Seed ข้อมูลเบื้องต้น (ตัวอย่าง)
สร้างไฟล์ `prisma/seed.ts`
```ts
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  await db.department.createMany({ data: [
    { code: 'ENG', name: 'วิศวกรรม' },
    { code: 'PRC', name: 'จัดซื้อ' },
  ]});
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
```
รัน: `pnpm ts-node prisma/seed.ts` หรือกำหนดใน `package.json` เป็น `prisma db seed`

### 19.5 ตั้งค่า Google OAuth / Drive
- สร้าง OAuth Consent + Credentials (Web)
- ใส่ Authorized redirect URIs ของ NextAuth: `https://your-vercel-domain/api/auth/callback/google` และ `http://localhost:3000/api/auth/callback/google`
- ถ้าใช้ Service Account + Domain-wide Delegation: อนุญาต scopes ที่ Admin Console (เช่น `https://www.googleapis.com/auth/drive`)

### 19.6 รัน Dev
```bash
pnpm dev
# เปิด http://localhost:3000
```

### 19.7 ดีพลอย Vercel (แผนฟรีได้)
1) เชื่อม GitHub → Import โปรเจกต์
2) ตั้งค่า ENV ทั้งหมดใน Vercel → Project Settings → Environment Variables
3) Build & Deploy; หลังดีพลอยให้รัน `npx prisma migrate deploy` ผ่าน Vercel build/cron หรือ CI
4) งานแจ้งเตือน → ใช้ Vercel **Scheduled Functions** (Edge Cron) สำหรับรายวัน/รายชั่วโมงแบบเบา ๆ

---

## 20) ตัวอย่างโค้ดเชื่อม Google Drive (Resumable Upload — แนวทาง)
> แนะนำแยก Lib ที่ `src/lib/drive.ts` และเรียกเฉพาะฝั่ง server
```ts
import { google } from 'googleapis';

export async function getDriveClient() {
  // ถ้าใช้ Service Account
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  const drive = google.drive({ version: 'v3', auth });
  return drive;
}

export async function ensureFolder(drive, name: string, parentId?: string) {
  // สร้างโฟลเดอร์ถ้าไม่พบ (ควรมี cache/mapping เพื่อลดการค้นหา)
  const res = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: parentId ? [parentId] : undefined },
    fields: 'id, name'
  });
  return res.data.id as string;
}

export async function uploadResumable(drive, folderId: string, file: File) {
  const res = await drive.files.create({
    requestBody: { name: file.name, parents: [folderId] },
    media: { mimeType: file.type, body: Buffer.from(await file.arrayBuffer()) },
    fields: 'id, webViewLink, webContentLink'
  });
  return { fileId: res.data.id!, webViewLink: res.data.webViewLink };
}
```
> สำหรับไฟล์ใหญ่/จำนวนมาก ให้ใช้ **resumable sessions** แบบแท้จริงด้วย `drive.files.create({ supportsAllDrives:true, uploadType:'resumable' ... })` และอัปโหลดเป็นชิ้น ๆ

---

## 21) Middleware / RBAC (แนวทาง)
- NextAuth Session → ใส่ role/department ลง session
- สร้าง `withAuthRole(roles: Role[])` สำหรับป้องกัน API/Pages
- ตรวจกรรมสิทธิ์โครงการก่อนแก้ไข (`ownerId` หรือ `departmentId` ตรงกันตามบทบาท)

---

## 22) Checklist ก่อน Production
- เปิด HTTPS ทุกสภาพแวดล้อม
- เปิด RLS (ถ้าใช้ Supabase) หรือบังคับ RBAC ที่แอปเข้มงวด
- เปิด pgBouncer, ตั้งค่า connection limit, ใช้ `prisma accelerate` (ถ้าพร้อม)
- จำกัดขนาดอัปโหลด (`UPLOAD_MAX_MB`) และ validate ประเภทไฟล์
- ติดตั้ง Error Tracking (Sentry) และ Log drains
- สำรองข้อมูล DB ตามรอบเวลา

---

## 23) คำตอบย้ำเรื่อง Vercel แผนฟรี
- **ทำได้** สำหรับ MVP/ทีมเล็ก
- ระวัง timeout ของ serverless (งานอัปโหลด/ซิงก์มาก ๆ ให้ส่งตรงไป Drive และ batch เป็นงานสั้น)
- ใช้ DB ภายนอก (Supabase/Neon) + Connection Pooling
- เมื่อการใช้งานโต: อัปเกรดแผน/แยก worker/คิวภายนอก

