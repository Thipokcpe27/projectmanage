# 🚀 Deployment Checklist

## ก่อน Deploy

### ✅ Code Quality

- [ ] ไม่มี TypeScript errors
- [ ] ไม่มี ESLint warnings ที่สำคัญ
- [ ] ทดสอบ features หลักทั้งหมดแล้ว
- [ ] ลบ console.log ที่ไม่จำเป็น
- [ ] ลบ commented code
- [ ] อัปเดต README.md

### ✅ Security

- [ ] ไม่มี sensitive data ใน code
- [ ] `.env.local` อยู่ใน `.gitignore`
- [ ] Service Account JSON ไม่ได้ commit
- [ ] API keys ทั้งหมดอยู่ใน environment variables
- [ ] ตั้งค่า CORS ถูกต้อง
- [ ] ตั้งค่า rate limiting (ถ้ามี)

### ✅ Database

- [ ] Prisma schema ถูกต้อง
- [ ] Migrations ทั้งหมดทำงานได้
- [ ] Seed data พร้อมใช้งาน
- [ ] Backup strategy กำหนดแล้ว
- [ ] Connection pooling เปิดใช้งาน

### ✅ Google Cloud Platform

- [ ] OAuth Consent Screen approved
- [ ] Production redirect URIs เพิ่มแล้ว
- [ ] Drive API enabled
- [ ] Service Account สร้างแล้ว
- [ ] Root folder แชร์ให้ Service Account แล้ว
- [ ] Quotas เพียงพอ

---

## Deploy บน Vercel

### 1. เตรียม Repository

```bash
# Commit ทุกอย่าง
git add .
git commit -m "Ready for production"
git push origin main
```

### 2. สร้าง Project ใน Vercel

- [ ] Import repository จาก GitHub
- [ ] เลือก framework: Next.js
- [ ] ตั้งค่า root directory (ถ้าจำเป็น)

### 3. ตั้งค่า Environment Variables

คัดลอกจาก `.env.local` ไปยัง Vercel:

```
DATABASE_URL
NEXTAUTH_URL (เปลี่ยนเป็น production URL)
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_SERVICE_ACCOUNT_JSON
DRIVE_ROOT_FOLDER_ID
APP_DEFAULT_DOMAIN
UPLOAD_MAX_MB
```

**สำคัญ**: 
- [ ] `NEXTAUTH_URL` ต้องเป็น `https://your-domain.vercel.app`
- [ ] ตรวจสอบ `DATABASE_URL` ใช้ production database

### 4. Deploy

- [ ] คลิก "Deploy"
- [ ] รอ build เสร็จ (2-3 นาที)
- [ ] ตรวจสอบ build logs ไม่มี errors

### 5. Run Database Migration

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull env variables
vercel env pull .env.production

# Run migration
npx prisma migrate deploy

# (Optional) Seed production data
npm run prisma:seed
```

### 6. อัปเดต Google OAuth

- [ ] เพิ่ม production URL ใน Authorized JavaScript origins:
  ```
  https://your-domain.vercel.app
  ```
- [ ] เพิ่ม production callback URL:
  ```
  https://your-domain.vercel.app/api/auth/callback/google
  ```

### 7. ทดสอบ Production

- [ ] เปิด production URL
- [ ] ทดสอบ login ด้วย Google
- [ ] สร้างโครงการทดสอบ
- [ ] อัปโหลดเอกสารทดสอบ
- [ ] ตรวจสอบ Drive folder ถูกสร้าง
- [ ] ทดสอบ permissions ต่าง ๆ

---

## หลัง Deploy

### ✅ Monitoring

- [ ] ตั้งค่า Vercel Analytics
- [ ] ตั้งค่า Error Tracking (Sentry)
- [ ] ตั้งค่า Uptime Monitoring
- [ ] ตั้งค่า Database Monitoring

### ✅ Performance

- [ ] ตรวจสอบ Lighthouse score
- [ ] ตรวจสอบ Core Web Vitals
- [ ] ทดสอบ load time
- [ ] ตรวจสอบ API response time

### ✅ Security

- [ ] ตรวจสอบ HTTPS ทำงาน
- [ ] ตรวจสอบ Security Headers
- [ ] ทดสอบ authentication flow
- [ ] ทดสอบ authorization (RBAC)

### ✅ Backup

- [ ] ตั้งค่า automated database backup
- [ ] ทดสอบ restore process
- [ ] เก็บ backup ของ environment variables

### ✅ Documentation

- [ ] อัปเดต README.md ด้วย production URL
- [ ] เขียน deployment notes
- [ ] บันทึก known issues
- [ ] สร้าง user guide (ถ้าจำเป็น)

---

## Production Maintenance

### รายวัน

- [ ] ตรวจสอบ error logs
- [ ] ตรวจสอบ API usage
- [ ] ตรวจสอบ database performance

### รายสัปดาห์

- [ ] Review activity logs
- [ ] ตรวจสอบ disk usage
- [ ] ตรวจสอบ Drive quota
- [ ] อัปเดต dependencies (ถ้ามี security patches)

### รายเดือน

- [ ] Review และ optimize database
- [ ] ตรวจสอบ backup integrity
- [ ] Review user feedback
- [ ] Plan feature updates

---

## Rollback Plan

หากมีปัญหาหลัง deploy:

### 1. Quick Rollback

```bash
# ใน Vercel Dashboard
# ไปที่ Deployments > เลือก deployment ก่อนหน้า > Promote to Production
```

### 2. Database Rollback

```bash
# Restore จาก backup
# Run specific migration down (ถ้าจำเป็น)
npx prisma migrate resolve --rolled-back <migration_name>
```

### 3. แจ้งผู้ใช้

- [ ] แจ้งผ่าน email/notification
- [ ] อัปเดต status page
- [ ] ประกาศ maintenance window

---

## Scaling Considerations

### เมื่อผู้ใช้เพิ่มขึ้น

- [ ] อัปเกรด Vercel plan (Hobby → Pro)
- [ ] อัปเกรด Database plan
- [ ] เพิ่ม connection pooling
- [ ] ใช้ CDN สำหรับ static assets
- [ ] พิจารณา caching strategy

### เมื่อไฟล์เยอะขึ้น

- [ ] ตรวจสอบ Drive quota
- [ ] พิจารณา file cleanup policy
- [ ] ใช้ resumable uploads
- [ ] พิจารณา compression

### เมื่อ API calls เยอะขึ้น

- [ ] ใช้ SWR/React Query caching
- [ ] Implement rate limiting
- [ ] พิจารณา API caching
- [ ] Optimize database queries

---

## Emergency Contacts

```
Database: [Supabase/Neon Support]
Hosting: [Vercel Support]
Domain: [Domain Registrar]
Team Lead: [Contact Info]
```

---

## Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# Promote deployment
vercel promote <deployment-url>

# Environment variables
vercel env ls
vercel env add <name>
vercel env rm <name>

# Database
npx prisma studio --browser none
npx prisma db push
npx prisma migrate deploy
```

---

## Success Criteria

Deploy ถือว่าสำเร็จเมื่อ:

- ✅ ไม่มี errors ใน production
- ✅ ผู้ใช้ login ได้
- ✅ สร้างโครงการได้
- ✅ อัปโหลดไฟล์ได้
- ✅ Drive integration ทำงาน
- ✅ Performance ตามเป้า (< 3s load time)
- ✅ Mobile responsive ทำงานดี
- ✅ All RBAC rules ทำงานถูกต้อง

---

**Last Updated**: 2024

**Deployed By**: _____________

**Deployment Date**: _____________

**Production URL**: _____________
