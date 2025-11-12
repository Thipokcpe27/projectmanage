# โครงสร้างไฟล์โปรเจกต์

## 📁 โครงสร้างหลัก

```
project_management/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies และ scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.js            # Next.js configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── .eslintrc.json            # ESLint configuration
│   ├── .gitignore                # Git ignore rules
│   ├── .env.example              # Environment variables template
│   └── .env.local                # Local environment variables (ไม่ commit)
│
├── 📂 prisma/                    # Database Schema & Migrations
│   ├── schema.prisma             # Prisma schema definition
│   └── seed.ts                   # Database seeding script
│
├── 📂 src/                       # Source code
│   │
│   ├── 📂 app/                   # Next.js App Router
│   │   │
│   │   ├── 📂 api/               # API Routes (Backend)
│   │   │   ├── 📂 auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts  # NextAuth endpoints
│   │   │   │
│   │   │   ├── 📂 projects/
│   │   │   │   ├── route.ts      # GET, POST /api/projects
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts  # GET, PATCH, DELETE /api/projects/:id
│   │   │   │
│   │   │   ├── 📂 milestones/
│   │   │   │   └── [id]/
│   │   │   │       └── documents/
│   │   │   │           └── upload/
│   │   │   │               └── route.ts  # POST /api/milestones/:id/documents/upload
│   │   │   │
│   │   │   └── 📂 me/
│   │   │       └── route.ts      # GET /api/me (current user)
│   │   │
│   │   ├── 📂 dashboard/         # Dashboard Page
│   │   │   └── page.tsx          # Main dashboard
│   │   │
│   │   ├── 📂 projects/          # Projects Pages
│   │   │   ├── page.tsx          # Projects list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create new project
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Project detail
│   │   │       ├── edit/
│   │   │       │   └── page.tsx  # Edit project
│   │   │       └── milestones/
│   │   │           └── [milestoneId]/
│   │   │               └── page.tsx  # Milestone detail
│   │   │
│   │   ├── 📂 admin/             # Admin Pages
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   ├── users/
│   │   │   │   └── page.tsx      # User management
│   │   │   ├── departments/
│   │   │   │   └── page.tsx      # Department management
│   │   │   └── templates/
│   │   │       └── page.tsx      # Document templates
│   │   │
│   │   ├── 📂 auth/              # Authentication Pages
│   │   │   ├── signin/
│   │   │   │   └── page.tsx      # Sign in page
│   │   │   └── error/
│   │   │       └── page.tsx      # Auth error page
│   │   │
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page (redirect to dashboard)
│   │   ├── globals.css           # Global styles
│   │   └── providers.tsx         # Client-side providers
│   │
│   ├── 📂 components/            # React Components
│   │   │
│   │   ├── 📂 layout/
│   │   │   ├── AppLayout.tsx     # Main app layout with navigation
│   │   │   ├── Sidebar.tsx       # Sidebar navigation
│   │   │   └── Header.tsx        # Header component
│   │   │
│   │   ├── 📂 projects/
│   │   │   ├── ProjectCard.tsx   # Project card component
│   │   │   ├── ProjectList.tsx   # Project list component
│   │   │   ├── ProjectForm.tsx   # Project form
│   │   │   └── ProjectFilters.tsx # Filter component
│   │   │
│   │   ├── 📂 milestones/
│   │   │   ├── MilestoneCard.tsx # Milestone card
│   │   │   ├── MilestoneForm.tsx # Milestone form
│   │   │   └── MilestoneTimeline.tsx # Timeline view
│   │   │
│   │   ├── 📂 documents/
│   │   │   ├── DocumentUpload.tsx # File upload component
│   │   │   ├── DocumentList.tsx  # Document list
│   │   │   └── ComplianceCheck.tsx # Compliance checker
│   │   │
│   │   ├── 📂 dashboard/
│   │   │   ├── StatsCard.tsx     # Statistics card
│   │   │   ├── RecentProjects.tsx # Recent projects widget
│   │   │   └── UpcomingDeadlines.tsx # Deadlines widget
│   │   │
│   │   └── 📂 common/
│   │       ├── Loading.tsx       # Loading spinner
│   │       ├── ErrorMessage.tsx  # Error display
│   │       └── ConfirmDialog.tsx # Confirmation dialog
│   │
│   ├── 📂 lib/                   # Utility Libraries
│   │   ├── prisma.ts             # Prisma client instance
│   │   ├── drive.ts              # Google Drive functions
│   │   ├── auth-options.ts       # NextAuth configuration
│   │   ├── rbac.ts               # Role-based access control
│   │   └── validation.ts         # Zod validation schemas
│   │
│   ├── 📂 types/                 # TypeScript Types
│   │   ├── next-auth.d.ts        # NextAuth type extensions
│   │   └── index.ts              # Common types
│   │
│   └── 📂 hooks/                 # Custom React Hooks
│       ├── useProjects.ts        # Projects data hook
│       ├── useMilestones.ts      # Milestones data hook
│       └── useAuth.ts            # Authentication hook
│
├── 📂 public/                    # Static Files
│   ├── favicon.ico
│   └── images/
│
└── 📄 Documentation
    ├── README.md                 # Main documentation
    ├── SETUP_GUIDE.md            # Setup instructions
    └── PROJECT_STRUCTURE.md      # This file
```

---

## 🔑 ไฟล์สำคัญ

### Configuration

| ไฟล์ | จุดประสงค์ |
|------|-----------|
| `package.json` | จัดการ dependencies และ npm scripts |
| `tsconfig.json` | ตั้งค่า TypeScript compiler |
| `next.config.js` | ตั้งค่า Next.js (images, env, etc.) |
| `prisma/schema.prisma` | กำหนด database schema |
| `.env.local` | Environment variables (ไม่ commit) |

### Core Libraries

| ไฟล์ | จุดประสงค์ |
|------|-----------|
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/drive.ts` | Google Drive API functions |
| `src/lib/auth-options.ts` | NextAuth configuration |
| `src/lib/rbac.ts` | Permission checking functions |
| `src/lib/validation.ts` | Zod schemas for validation |

### API Routes

| Endpoint | Method | จุดประสงค์ |
|----------|--------|-----------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth endpoints |
| `/api/me` | GET | Get current user |
| `/api/projects` | GET, POST | List/Create projects |
| `/api/projects/:id` | GET, PATCH, DELETE | Project CRUD |
| `/api/milestones/:id/documents/upload` | POST | Upload document |

### Pages

| Path | จุดประสงค์ |
|------|-----------|
| `/` | Home (redirect to dashboard) |
| `/dashboard` | Main dashboard |
| `/projects` | Projects list |
| `/projects/new` | Create project |
| `/projects/:id` | Project detail |
| `/admin` | Admin panel |
| `/auth/signin` | Sign in page |

---

## 📦 Dependencies หลัก

### Production

```json
{
  "@prisma/client": "^5.8.0",        // Database ORM
  "googleapis": "^131.0.0",          // Google APIs
  "next": "14.1.0",                  // React framework
  "next-auth": "^4.24.5",            // Authentication
  "react": "^18.2.0",                // UI library
  "semantic-ui-react": "^2.1.5",     // UI components
  "swr": "^2.2.4",                   // Data fetching
  "zod": "^3.22.4"                   // Validation
}
```

### Development

```json
{
  "@types/node": "^20",              // Node.js types
  "@types/react": "^18",             // React types
  "prisma": "^5.8.0",                // Prisma CLI
  "typescript": "^5",                // TypeScript
  "tailwindcss": "^3.3.0"            // CSS framework
}
```

---

## 🗄️ Database Schema

### Tables

1. **departments** - แผนก
2. **users** - ผู้ใช้
3. **projects** - โครงการ
4. **milestones** - งวดงาน
5. **documents** - เอกสาร
6. **doc_requirement_templates** - เทมเพลตเอกสาร
7. **doc_requirements_milestone** - เอกสารที่ต้องการต่องวด
8. **doc_compliance** - สถานะเอกสาร
9. **activity_logs** - บันทึกการทำงาน

### Relations

```
departments 1--* users
departments 1--* projects
projects 1--* milestones
milestones 1--* documents
milestones 1--* doc_requirements_milestone
milestones 1--* doc_compliance
users 1--* projects (owner)
users 1--* documents (uploader)
users 1--* activity_logs (actor)
```

---

## 🔐 Authentication Flow

```
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth
3. User authorizes
4. Google redirects to /api/auth/callback/google
5. NextAuth creates/updates user in DB
6. Session created with JWT
7. User redirected to /dashboard
```

---

## 📤 File Upload Flow

```
1. User selects file in UI
2. POST /api/milestones/:id/documents/upload
3. Validate file size and type
4. Upload to Google Drive (via Service Account)
5. Save metadata to database
6. Return file URL and metadata
7. Update UI with new document
```

---

## 🎨 UI Component Structure

```
AppLayout (Navigation + Footer)
  └── Page Component
      ├── Header Section
      ├── Filters/Search
      ├── Main Content
      │   ├── Cards/Tables
      │   └── Forms/Modals
      └── Actions
```

---

## 🚀 Development Workflow

### 1. Start Development

```bash
npm run dev
```

### 2. Make Changes

- Edit files in `src/`
- Hot reload automatically

### 3. Database Changes

```bash
# Edit prisma/schema.prisma
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

### 4. Test

```bash
# Manual testing in browser
# Check console for errors
```

### 5. Commit

```bash
git add .
git commit -m "Description"
git push
```

### 6. Deploy

```bash
# Vercel auto-deploys on push to main
# Or manual: vercel --prod
```

---

## 📝 Naming Conventions

### Files

- **Components**: PascalCase (e.g., `ProjectCard.tsx`)
- **Pages**: lowercase (e.g., `page.tsx`)
- **Utilities**: camelCase (e.g., `validation.ts`)
- **Types**: PascalCase (e.g., `next-auth.d.ts`)

### Code

- **Components**: PascalCase (e.g., `ProjectCard`)
- **Functions**: camelCase (e.g., `createProject`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (e.g., `ProjectData`)

---

## 🔧 Environment Variables

### Required

```
DATABASE_URL              # PostgreSQL connection string
NEXTAUTH_URL              # App URL
NEXTAUTH_SECRET           # JWT secret
GOOGLE_CLIENT_ID          # OAuth client ID
GOOGLE_CLIENT_SECRET      # OAuth client secret
GOOGLE_SERVICE_ACCOUNT_JSON # Service account credentials
DRIVE_ROOT_FOLDER_ID      # Root folder on Drive
```

### Optional

```
APP_DEFAULT_DOMAIN        # Domain for sharing
UPLOAD_MAX_MB             # Max file size (default: 50)
```

---

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Semantic UI React](https://react.semantic-ui.com)
- [NextAuth.js](https://next-auth.js.org)

---

**Last Updated**: 2024
