# ระบบจัดการโครงการและเอกสารงวดงาน

Project Management & Document Tracking System with Google Drive Integration

## 🚀 คุณสมบัติหลัก

- ✅ **จัดการโครงการ**: สร้าง แก้ไข และติดตามโครงการตามปีงบประมาณและแผนก
- 📁 **Google Drive Integration**: สร้างโฟลเดอร์อัตโนมัติและอัปโหลดเอกสารตรงไป Drive
- 📊 **Dashboard**: ภาพรวมสถิติและความคืบหน้าโครงการ
- 📝 **งวดงาน (Milestones)**: จัดการงวดงานพร้อมเช็กลิสต์เอกสาร
- 🔐 **RBAC**: ระบบสิทธิ์แบบ Role-Based (Admin, DeptLead, PM, Member, ReadOnly)
- 📄 **Document Compliance**: ติดตามเอกสารครบ/ขาด/ไม่ใช้
- 🔍 **Activity Logs**: บันทึกการเปลี่ยนแปลงทั้งหมด
- 🌐 **Google OAuth**: เข้าสู่ระบบด้วยบัญชี Google

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Semantic UI React
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL (Supabase/Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Google OAuth)
- **File Storage**: Google Drive API
- **Deployment**: Vercel (Free/Hobby plan supported)

## 📋 ข้อกำหนดเบื้องต้น

- Node.js 18+ และ npm/pnpm/yarn
- บัญชี Google Cloud Platform (สำหรับ OAuth และ Drive API)
- บัญชี Supabase หรือ Neon (PostgreSQL)
- บัญชี Vercel (สำหรับ deployment)

## 🔧 การติดตั้ง

### 1. Clone และติดตั้ง dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd project_management

# ติดตั้ง dependencies
npm install
# หรือ
pnpm install
```

### 2. ตั้งค่า Google Cloud Platform

#### 2.1 สร้าง OAuth 2.0 Credentials

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่
3. เปิดใช้งาน **Google Drive API**
4. ไปที่ **APIs & Services > Credentials**
5. สร้าง **OAuth 2.0 Client ID** (Web application)
6. เพิ่ม Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`
7. คัดลอก **Client ID** และ **Client Secret**

#### 2.2 สร้าง Service Account (สำหรับ Drive API)

1. ไปที่ **APIs & Services > Credentials**
2. สร้าง **Service Account**
3. สร้าง **JSON Key** และดาวน์โหลด
4. เปิดใช้ **Domain-wide Delegation** (ถ้าต้องการ)
5. แชร์โฟลเดอร์รากบน Drive ให้กับ Service Account email

### 3. ตั้งค่า Database (Supabase)

1. สร้าง Project ที่ [Supabase](https://supabase.com)
2. ไปที่ **Settings > Database**
3. คัดลอก **Connection String** (Transaction mode)
4. เปิดใช้ **Connection Pooling** (แนะนำ)

### 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require&pgbouncer=true"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google Service Account (JSON ทั้งหมดในบรรทัดเดียว)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"..."}'

# Drive Root Folder ID (สร้างโฟลเดอร์บน Drive และคัดลอก ID จาก URL)
DRIVE_ROOT_FOLDER_ID="your-drive-folder-id"

# Optional
APP_DEFAULT_DOMAIN="your-company.com"
UPLOAD_MAX_MB="50"
```

### 5. ตั้งค่า Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed ข้อมูลเริ่มต้น
npm run prisma:seed
```

### 6. รันโปรเจกต์

```bash
# Development
npm run dev

# เปิดเบราว์เซอร์ที่ http://localhost:3000
```

## 📦 โครงสร้างโปรเจกต์

```
project_management/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── projects/      # Project APIs
│   │   │   └── milestones/    # Milestone APIs
│   │   ├── dashboard/         # Dashboard page
│   │   ├── projects/          # Projects pages
│   │   ├── auth/              # Auth pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities
│   │   ├── prisma.ts          # Prisma client
│   │   ├── drive.ts           # Google Drive functions
│   │   ├── auth-options.ts    # NextAuth config
│   │   ├── rbac.ts            # Role-based access control
│   │   └── validation.ts      # Zod schemas
│   └── types/                 # TypeScript types
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 บทบาทและสิทธิ์

| บทบาท | สิทธิ์ |
|--------|--------|
| **ADMIN** | เข้าถึงและจัดการทุกอย่างในระบบ |
| **DEPT_LEAD** | จัดการโครงการในแผนกตัวเอง |
| **PM** | สร้างและจัดการโครงการที่เป็นเจ้าของ |
| **MEMBER** | ดูและอัปโหลดเอกสารในโครงการที่เกี่ยวข้อง |
| **READONLY** | ดูข้อมูลเท่านั้น |

## 🚀 Deployment บน Vercel

### 1. เชื่อมต่อ GitHub

1. Push โค้ดขึ้น GitHub
2. ไปที่ [Vercel Dashboard](https://vercel.com)
3. Import Project จาก GitHub

### 2. ตั้งค่า Environment Variables

ใส่ Environment Variables ทั้งหมดใน Vercel Project Settings

### 3. Deploy

```bash
# Vercel จะ deploy อัตโนมัติเมื่อ push ไป main branch
git push origin main
```

### 4. Run Database Migration

หลัง deploy ครั้งแรก ให้รัน migration:

```bash
# ใช้ Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

## 📝 การใช้งาน

### สร้างโครงการใหม่

1. เข้าสู่ระบบด้วย Google
2. ไปที่ **โครงการ > สร้างโครงการใหม่**
3. กรอกข้อมูล:
   - รหัสโครงการ
   - ชื่อโครงการ
   - แผนก
   - ปีงบประมาณ
   - วันเริ่ม-สิ้นสุด
   - งวดงาน (อย่างน้อย 1 งวด)
4. เลือก "สร้างโฟลเดอร์ Google Drive อัตโนมัติ"
5. บันทึก

### อัปโหลดเอกสาร

1. เข้าไปที่โครงการ
2. เลือกงวดงาน
3. Drag & Drop ไฟล์หรือคลิกเพื่ออัปโหลด
4. ระบบจะอัปโหลดไป Google Drive อัตโนมัติ

### ติดตามความคืบหน้า

- Dashboard แสดงสถิติรวม
- ดูรายละเอียดโครงการแต่ละตัว
- ตรวจสอบเอกสารครบ/ขาด

## 🐛 Troubleshooting

### ปัญหา: Cannot connect to database

```bash
# ตรวจสอบ DATABASE_URL
# ตรวจสอบว่า Supabase/Neon ทำงานอยู่
# ลอง restart dev server
```

### ปัญหา: Google Drive API error

```bash
# ตรวจสอบว่าเปิดใช้ Drive API แล้ว
# ตรวจสอบ Service Account JSON
# ตรวจสอบว่าแชร์โฟลเดอร์ให้ Service Account แล้ว
```

### ปัญหา: NextAuth error

```bash
# ตรวจสอบ NEXTAUTH_SECRET
# ตรวจสอบ Authorized redirect URIs
# ตรวจสอบ NEXTAUTH_URL
```

## 📚 เอกสารเพิ่มเติม

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)
- [Semantic UI React](https://react.semantic-ui.com)

## 🤝 Contributing

Pull requests are welcome! สำหรับการเปลี่ยนแปลงใหญ่ กรุณาเปิด issue ก่อน

## 📄 License

MIT License

## 👥 Support

หากมีปัญหาหรือคำถาม กรุณาเปิด issue ใน GitHub

---

Made with ❤️ using Next.js and Semantic UI React
