# 🚀 Quick Start Guide

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. ติดตั้ง Dependencies
```bash
✓ npm install - สำเร็จ (500 packages)
✓ npx prisma generate - สำเร็จ
```

### 2. Git Setup
```bash
✓ git init
✓ git add .
✓ git commit
✓ git push to https://github.com/Thipokcpe27/projectmanage.git
```

### 3. ไฟล์ที่สร้างแล้ว
- ✅ Configuration files (package.json, tsconfig.json, next.config.js)
- ✅ Prisma schema + seed
- ✅ NextAuth setup
- ✅ API routes (Projects, Milestones, Documents)
- ✅ UI components (Dashboard, Projects, Auth)
- ✅ Google Drive integration
- ✅ RBAC system
- ✅ Documentation (README, SETUP_GUIDE, etc.)

---

## 📋 ขั้นตอนถัดไป

### ขั้นตอนที่ 1: ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env.local`:

```bash
# 1. Database (Supabase/Neon)
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require&pgbouncer=true"

# 2. NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="สร้างด้วย: openssl rand -base64 32"

# 3. Google OAuth (จาก Google Cloud Console)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# 4. Google Service Account (JSON ทั้งหมดในบรรทัดเดียว)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# 5. Drive Root Folder ID (คัดลอกจาก URL โฟลเดอร์)
DRIVE_ROOT_FOLDER_ID="xxx"

# 6. Optional
APP_DEFAULT_DOMAIN="your-company.com"
UPLOAD_MAX_MB="50"
```

### ขั้นตอนที่ 2: Setup Google Cloud Platform

#### 2.1 สร้าง OAuth Credentials
1. ไปที่ https://console.cloud.google.com
2. สร้าง/เลือก Project
3. เปิดใช้ **Google Drive API**
4. สร้าง **OAuth 2.0 Client ID** (Web application)
5. เพิ่ม Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. คัดลอก Client ID และ Client Secret

#### 2.2 สร้าง Service Account
1. สร้าง Service Account
2. สร้าง JSON Key และดาวน์โหลด
3. แปลง JSON เป็นบรรทัดเดียว:
   ```bash
   # Windows PowerShell
   (Get-Content service-account.json -Raw) -replace "`r`n",""
   ```

#### 2.3 สร้างโฟลเดอร์บน Google Drive
1. สร้างโฟลเดอร์ใหม่ เช่น "Project Management System"
2. แชร์ให้กับ Service Account email (จาก JSON)
3. คัดลอก Folder ID จาก URL

### ขั้นตอนที่ 3: Setup Database (Supabase)

1. สร้าง Project ที่ https://supabase.com
2. คัดลอก Connection String (Transaction mode)
3. เพิ่ม `?sslmode=require&pgbouncer=true`
4. วางใน `.env.local`

### ขั้นตอนที่ 4: Run Database Migration

```bash
# Generate Prisma Client (ทำแล้ว)
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed ข้อมูลเริ่มต้น
npm run prisma:seed
```

### ขั้นตอนที่ 5: รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์: http://localhost:3000

---

## 🔧 คำสั่งที่ใช้บ่อย

```bash
# Development
npm run dev                    # รัน dev server
npm run build                  # Build production
npm run start                  # รัน production server

# Database
npx prisma studio              # เปิด Prisma Studio (GUI)
npx prisma migrate dev         # สร้าง migration ใหม่
npx prisma migrate deploy      # Deploy migrations (production)
npx prisma generate            # Generate Prisma Client
npm run prisma:seed            # Seed ข้อมูล

# Git
git status                     # ดูสถานะ
git add .                      # เพิ่มไฟล์ทั้งหมด
git commit -m "message"        # Commit
git push                       # Push ไป GitHub
```

---

## 🐛 Troubleshooting

### ปัญหา: ไม่สามารถเชื่อมต่อ Database

```bash
# ตรวจสอบ DATABASE_URL ใน .env.local
# ตรวจสอบว่า Supabase/Neon ทำงานอยู่
# ลอง restart dev server
```

### ปัญหา: Google OAuth error

```bash
# ตรวจสอบ GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET
# ตรวจสอบ Authorized redirect URIs
# ตรวจสอบว่า NEXTAUTH_URL ถูกต้อง
```

### ปัญหา: Drive API error

```bash
# ตรวจสอบว่าเปิดใช้ Drive API แล้ว
# ตรวจสอบ Service Account JSON
# ตรวจสอบว่าแชร์โฟลเดอร์ให้ Service Account แล้ว
```

### ปัญหา: พื้นที่ดิสก์เต็ม (ENOSPC)

```bash
# ลบ node_modules และติดตั้งใหม่
Remove-Item -Path "node_modules" -Recurse -Force
npm install

# หรือย้ายโปรเจกต์ไปไดรฟ์อื่นที่มีพื้นที่มากกว่า
```

---

## 📚 เอกสารเพิ่มเติม

- **README.md** - คู่มือหลักและภาพรวมระบบ
- **SETUP_GUIDE.md** - คำแนะนำติดตั้งแบบละเอียด
- **PROJECT_STRUCTURE.md** - โครงสร้างไฟล์และโฟลเดอร์
- **DEPLOYMENT_CHECKLIST.md** - Checklist สำหรับ deploy

---

## 🚀 Deploy บน Vercel

### 1. เชื่อมต่อ GitHub
1. ไปที่ https://vercel.com
2. Import repository: https://github.com/Thipokcpe27/projectmanage.git

### 2. ตั้งค่า Environment Variables
ใส่ Environment Variables ทั้งหมดจาก `.env.local`

**สำคัญ**: เปลี่ยน `NEXTAUTH_URL` เป็น production URL

### 3. Deploy
คลิก Deploy และรอ 2-3 นาที

### 4. อัปเดต Google OAuth
เพิ่ม production URL ใน Authorized redirect URIs:
```
https://your-domain.vercel.app/api/auth/callback/google
```

### 5. Run Migration
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

---

## ✅ Checklist ก่อนใช้งาน

- [ ] ติดตั้ง dependencies แล้ว (`npm install`)
- [ ] ตั้งค่า `.env.local` ครบถ้วน
- [ ] Setup Google Cloud Platform (OAuth + Service Account)
- [ ] Setup Database (Supabase/Neon)
- [ ] Run migrations (`npx prisma migrate dev`)
- [ ] Seed ข้อมูล (`npm run prisma:seed`)
- [ ] ทดสอบรัน dev server (`npm run dev`)
- [ ] ทดสอบ login ด้วย Google
- [ ] Push code ไป GitHub (✅ ทำแล้ว)

---

## 🎯 Features ที่พร้อมใช้งาน

- ✅ Authentication (Google OAuth)
- ✅ Dashboard
- ✅ จัดการโครงการ (CRUD)
- ✅ จัดการงวดงาน
- ✅ อัปโหลดเอกสารไป Google Drive
- ✅ RBAC (5 roles)
- ✅ Activity Logs
- ✅ Document Compliance
- ✅ Responsive Design

---

## 📞 ต้องการความช่วยเหลือ?

- 📖 อ่านเอกสารใน `README.md` และ `SETUP_GUIDE.md`
- 🐛 เปิด Issue ใน GitHub
- 💬 ติดต่อทีมพัฒนา

---

**Repository**: https://github.com/Thipokcpe27/projectmanage.git

**สถานะ**: ✅ Code พร้อมใช้งาน | ⏳ รอตั้งค่า Environment Variables

**Next Step**: ตั้งค่า `.env.local` และ Google Cloud Platform
