# คู่มือการติดตั้งและตั้งค่าระบบ

## 📋 สารบัญ

1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [ตั้งค่า Google Cloud Platform](#ตั้งค่า-google-cloud-platform)
3. [ตั้งค่า Database](#ตั้งค่า-database)
4. [ติดตั้งและรันโปรเจกต์](#ติดตั้งและรันโปรเจกต์)
5. [Deploy บน Vercel](#deploy-บน-vercel)
6. [การตั้งค่าเพิ่มเติม](#การตั้งค่าเพิ่มเติม)

---

## ข้อกำหนดเบื้องต้น

### ซอฟต์แวร์ที่ต้องมี

- **Node.js** 18.0 ขึ้นไป ([ดาวน์โหลด](https://nodejs.org))
- **Git** ([ดาวน์โหลด](https://git-scm.com))
- **Package Manager**: npm, pnpm, หรือ yarn

### บัญชีที่ต้องมี

- ✅ Google Account (สำหรับ OAuth และ Drive)
- ✅ Supabase หรือ Neon Account (PostgreSQL)
- ✅ Vercel Account (สำหรับ deployment)

---

## ตั้งค่า Google Cloud Platform

### ขั้นตอนที่ 1: สร้าง Project

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. คลิก **Select a project** > **New Project**
3. ตั้งชื่อ Project เช่น "Project Management System"
4. คลิก **Create**

### ขั้นตอนที่ 2: เปิดใช้งาน APIs

1. ไปที่ **APIs & Services > Library**
2. ค้นหาและเปิดใช้งาน:
   - **Google Drive API**
   - **Google+ API** (สำหรับ OAuth)

### ขั้นตอนที่ 3: ตั้งค่า OAuth Consent Screen

1. ไปที่ **APIs & Services > OAuth consent screen**
2. เลือก **Internal** (ถ้าเป็นองค์กร) หรือ **External**
3. กรอกข้อมูล:
   - App name: "Project Management System"
   - User support email: อีเมลของคุณ
   - Developer contact: อีเมลของคุณ
4. เพิ่ม Scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.file`
5. คลิก **Save and Continue**

### ขั้นตอนที่ 4: สร้าง OAuth 2.0 Client ID

1. ไปที่ **APIs & Services > Credentials**
2. คลิก **Create Credentials > OAuth 2.0 Client ID**
3. เลือก **Web application**
4. ตั้งชื่อ: "Web Client"
5. เพิ่ม **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-domain.vercel.app
   ```
6. เพิ่ม **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-domain.vercel.app/api/auth/callback/google
   ```
7. คลิก **Create**
8. **บันทึก Client ID และ Client Secret**

### ขั้นตอนที่ 5: สร้าง Service Account

1. ไปที่ **APIs & Services > Credentials**
2. คลิก **Create Credentials > Service Account**
3. ตั้งชื่อ: "Drive Service Account"
4. คลิก **Create and Continue**
5. เลือก Role: **Editor** (หรือสร้าง custom role)
6. คลิก **Done**
7. คลิกที่ Service Account ที่สร้าง
8. ไปที่แท็บ **Keys**
9. คลิก **Add Key > Create new key**
10. เลือก **JSON**
11. **ดาวน์โหลดไฟล์ JSON** (เก็บไว้ปลอดภัย!)

### ขั้นตอนที่ 6: สร้างโฟลเดอร์รากบน Google Drive

1. เปิด [Google Drive](https://drive.google.com)
2. สร้างโฟลเดอร์ใหม่ เช่น "Project Management System"
3. คลิกขวาที่โฟลเดอร์ > **Share**
4. แชร์ให้กับ Service Account email (จากไฟล์ JSON: `client_email`)
5. ให้สิทธิ์ **Editor**
6. คัดลอก **Folder ID** จาก URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

---

## ตั้งค่า Database

### ตัวเลือก A: Supabase (แนะนำ)

1. ไปที่ [Supabase](https://supabase.com)
2. คลิก **New Project**
3. กรอกข้อมูล:
   - Name: "project-management"
   - Database Password: สร้าง password ที่แข็งแรง
   - Region: เลือกที่ใกล้ที่สุด
4. รอ project สร้างเสร็จ (2-3 นาที)
5. ไปที่ **Settings > Database**
6. คัดลอก **Connection string** (Transaction mode):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
7. เพิ่ม query parameters:
   ```
   ?sslmode=require&pgbouncer=true&connect_timeout=15
   ```

### ตัวเลือก B: Neon

1. ไปที่ [Neon](https://neon.tech)
2. สร้าง Project ใหม่
3. คัดลอก Connection String
4. เพิ่ม `?sslmode=require`

---

## ติดตั้งและรันโปรเจกต์

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd project_management
```

### 2. ติดตั้ง Dependencies

```bash
npm install
# หรือ
pnpm install
# หรือ
yarn install
```

### 3. สร้างไฟล์ .env.local

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@host:5432/db?sslmode=require&pgbouncer=true"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# Google Service Account (วางเนื้อหาไฟล์ JSON ทั้งหมดในบรรทัดเดียว)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"xxx",...}'

# Drive Root Folder ID
DRIVE_ROOT_FOLDER_ID="xxx"

# Optional
APP_DEFAULT_DOMAIN="your-company.com"
UPLOAD_MAX_MB="50"
```

**วิธีสร้าง NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**วิธีแปลง Service Account JSON:**
```bash
# บน Linux/Mac
cat service-account.json | tr -d '\n'

# บน Windows PowerShell
(Get-Content service-account.json -Raw) -replace "`r`n",""
```

### 4. ตั้งค่า Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed ข้อมูลเริ่มต้น
npm run prisma:seed
```

### 5. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่: http://localhost:3000

### 6. ทดสอบเข้าสู่ระบบ

1. คลิก "เข้าสู่ระบบด้วย Google"
2. เลือกบัญชี Google
3. อนุญาตสิทธิ์
4. ควรเข้าสู่ Dashboard

---

## Deploy บน Vercel

### 1. เตรียม Repository

```bash
# สร้าง Git repository (ถ้ายังไม่มี)
git init
git add .
git commit -m "Initial commit"

# Push ไป GitHub
git remote add origin https://github.com/your-username/project-management.git
git push -u origin main
```

### 2. Import Project ใน Vercel

1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. คลิก **Add New > Project**
3. Import repository จาก GitHub
4. เลือก repository ที่สร้าง

### 3. ตั้งค่า Environment Variables

ใน Vercel Project Settings > Environment Variables, เพิ่ม:

```
DATABASE_URL
NEXTAUTH_URL (ใช้ https://your-domain.vercel.app)
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_SERVICE_ACCOUNT_JSON
DRIVE_ROOT_FOLDER_ID
APP_DEFAULT_DOMAIN
UPLOAD_MAX_MB
```

**สำคัญ**: อย่าลืมอัปเดต `NEXTAUTH_URL` เป็น domain ของ Vercel

### 4. Deploy

1. คลิก **Deploy**
2. รอ build เสร็จ (2-3 นาที)
3. เปิด URL ที่ได้

### 5. Run Database Migration

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migration
npx prisma migrate deploy
```

### 6. อัปเดต Google OAuth Redirect URI

1. กลับไปที่ Google Cloud Console
2. เพิ่ม Vercel domain ใน Authorized redirect URIs:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

---

## การตั้งค่าเพิ่มเติม

### ตั้งค่าผู้ใช้เป็น Admin

```bash
# เชื่อมต่อ Prisma Studio
npx prisma studio

# หรือใช้ SQL
# UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@company.com';
```

### ตั้งค่าแผนก

1. เข้า Prisma Studio: `npx prisma studio`
2. เปิดตาราง `departments`
3. เพิ่มแผนกตามต้องการ

### ตั้งค่าเทมเพลตเอกสาร

1. เข้าระบบด้วยบัญชี Admin
2. ไปที่ **จัดการระบบ > เทมเพลตเอกสาร**
3. เพิ่มเทมเพลตตามต้องการ

### ตั้งค่า Domain แชร์ Drive

ใน `.env.local`:
```
APP_DEFAULT_DOMAIN="your-company.com"
```

ระบบจะแชร์โฟลเดอร์ให้กับทุกคนในโดเมนนี้อัตโนมัติ

---

## 🎉 เสร็จสิ้น!

ระบบพร้อมใช้งานแล้ว! ลองสร้างโครงการแรกของคุณได้เลย

### ขั้นตอนถัดไป

- [ ] เพิ่มผู้ใช้และกำหนดบทบาท
- [ ] สร้างแผนกและโครงการ
- [ ] ตั้งค่าเทมเพลตเอกสาร
- [ ] ทดสอบอัปโหลดไฟล์
- [ ] ตรวจสอบ Activity Logs

### ต้องการความช่วยเหลือ?

- 📖 อ่าน [README.md](README.md)
- 🐛 เปิด Issue ใน GitHub
- 💬 ติดต่อทีมพัฒนา

---

**หมายเหตุ**: เก็บไฟล์ Service Account JSON ไว้ปลอดภัย และอย่า commit ลง Git!
