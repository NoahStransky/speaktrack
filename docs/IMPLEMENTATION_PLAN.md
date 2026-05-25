# SpeakTrack MVP — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build an open-source web app for non-native English speakers to track speaking practice habits, record voice notes with self-assessment, and maintain a resource library — starting with Bernie as user #1.

**Architecture:** Next.js 16 App Router with Ant Design 6 UI, Prisma ORM on SQLite, NextAuth.js v5 for authentication, Recharts for visualizations, and browser MediaRecorder API for voice notes. Server-rendered pages with client-side interactivity islands via `'use client'` components.

**Tech Stack:** Next.js 16, React 19, Ant Design 6, Prisma 6, NextAuth.js 5, SQLite, Recharts, TypeScript

---

## Phase 0 — Project Scaffold (Tasks 1-4)

### Task 1: Initialize Next.js project with TypeScript

**Objective:** Scaffold the Next.js project with all core dependencies

**Files:**
- Create: `/opt/data/speaktrack/` (project root)

**Step 1: Create Next.js app**

```bash
cd /opt/data/speaktrack
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack
```

**Step 2: Install core dependencies**

```bash
npm install antd @ant-design/nextjs-registry @ant-design/icons
npm install prisma @prisma/client
npm install next-auth@beta
npm install bcryptjs
npm install recharts
npm install date-fns
npm install uuid
npm install --save-dev @types/bcryptjs @types/uuid
```

**Step 3: Initialize Prisma with SQLite**

```bash
npx prisma init --datasource-provider sqlite
```

**Step 4: Verify project runs**

```bash
npm run dev
```

Expected: Dev server starts on localhost:3000, no errors.

**Step 5: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with dependencies"
```

---

### Task 2: Configure Ant Design with Next.js App Router

**Objective:** Set up Ant Design's CSS-in-JS registry for App Router compatibility

**Files:**
- Modify: `app/layout.tsx`
- Create: `lib/antd-provider.tsx`
- Modify: `next.config.ts`

**Step 1: Create Ant Design provider component**

Create `lib/antd-provider.tsx`:

```tsx
'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          algorithm: theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
```

**Step 2: Update root layout**

Modify `app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import AntdProvider from '@/lib/antd-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpeakTrack — Improve Your English Speaking',
  description: 'Track speaking practice, voice notes, and resources',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
```

**Step 3: Update next.config.ts for transpilePackages**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/nextjs-registry', 'rc-util', 'rc-pagination', 'rc-picker'],
};

export default nextConfig;
```

**Step 4: Verify Ant Design renders**

Add a test button to `app/page.tsx`:

```tsx
import { Button } from 'antd';

export default function Home() {
  return <Button type="primary">Hello SpeakTrack</Button>;
}
```

Run `npm run dev`, open browser, confirm blue Ant Design button renders.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure Ant Design with Next.js App Router"
```

---

### Task 3: Set up Prisma schema and database

**Objective:** Define the data model and create the SQLite database

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/prisma.ts`

**Step 1: Write Prisma schema**

Modify `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id             String       @id @default(uuid())
  email          String       @unique
  name           String
  passwordHash   String
  nativeLanguage String       @default("")
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  dailyLogs      DailyLog[]
  voiceNotes     VoiceNote[]
  resources      Resource[]
}

model DailyLog {
  id               String   @id @default(uuid())
  userId           String
  date             DateTime
  shadowingDone    Boolean  @default(false)
  shadowingMinutes Int      @default(0)
  voiceNoteDone    Boolean  @default(false)
  coffeeChatDone   Boolean  @default(false)
  notes            String   @default("")
  energyLevel      Int      @default(3)
  createdAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id])

  @@unique([userId, date])
}

model VoiceNote {
  id          String   @id @default(uuid())
  userId      String
  date        DateTime @default(now())
  filePath    String
  duration    Int      @default(0)
  selfRating  Int      @default(3)
  transcript  String   @default("")
  notes       String   @default("")
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}

model Resource {
  id        String   @id @default(uuid())
  userId    String
  type      String
  title     String
  url       String   @default("")
  content   String   @default("")
  tags      String   @default("")
  isPublic  Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

**Step 2: Create Prisma client singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Step 3: Run migration and generate client**

```bash
echo "DATABASE_URL=\"file:./dev.db\"" > .env
npx prisma migrate dev --name init
```

Expected: `prisma/dev.db` created, migration SQL generated in `prisma/migrations/`.

**Step 4: Verify with Prisma Studio**

```bash
npx prisma studio
```

Expected: Browser opens with Prisma Studio showing empty tables.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema, migrations, and client singleton"
```

---

### Task 4: Set up NextAuth.js with credentials provider

**Objective:** Implement email/password authentication with NextAuth.js v5

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `lib/auth.ts`
- Modify: `.env`

**Step 1: Generate AUTH_SECRET and add to .env**

```bash
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env
```

**Step 2: Create auth configuration**

Create `lib/auth.ts`:

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

**Step 3: Create auth route handler**

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

**Step 4: Extend NextAuth types (optional for now)**

Create `types/next-auth.d.ts`:

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}
```

**Step 5: Verify auth API endpoint**

Start dev server, visit `/api/auth/signin` — should show NextAuth sign-in page or redirect to `/login`.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add NextAuth.js with credentials provider"
```

---

## Phase 1 — Auth UI + Landing (Tasks 5-7)

### Task 5: Create registration page

**Objective:** Build a registration form that creates a user in the database

**Files:**
- Create: `app/(auth)/register/page.tsx`
- Create: `app/(auth)/layout.tsx`
- Create: `app/api/auth/register/route.ts`

**Step 1: Create auth layout**

Create `app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ width: 400, padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Create registration API route**

Create `app/api/auth/register/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name, nativeLanguage } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, nativeLanguage: nativeLanguage || '' },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 3: Create registration page**

Create `app/(auth)/register/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Form, Input, Button, Select, message, Typography } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { name: string; email: string; password: string; nativeLanguage?: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.error || 'Registration failed');
        return;
      }
      message.success('Account created! Please sign in.');
      router.push('/login');
    } catch {
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>Create Account</Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        Start your English speaking journey
      </Text>
      <Form layout="vertical" onFinish={onFinish} size="large">
        <Form.Item name="name" rules={[{ required: true, message: 'Enter your name' }]}>
          <Input prefix={<UserOutlined />} placeholder="Full name" />
        </Form.Item>
        <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, min: 8, message: 'Min 8 characters' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        <Form.Item name="nativeLanguage">
          <Select placeholder="Native language (optional)" allowClear>
            <Select.Option value="Chinese">Chinese (中文)</Select.Option>
            <Select.Option value="Spanish">Spanish</Select.Option>
            <Select.Option value="Hindi">Hindi</Select.Option>
            <Select.Option value="Arabic">Arabic</Select.Option>
            <Select.Option value="Portuguese">Portuguese</Select.Option>
            <Select.Option value="Japanese">Japanese</Select.Option>
            <Select.Option value="Korean">Korean</Select.Option>
            <Select.Option value="French">French</Select.Option>
            <Select.Option value="German">German</Select.Option>
            <Select.Option value="Other">Other</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create Account
          </Button>
        </Form.Item>
      </Form>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </Text>
    </>
  );
}
```

**Step 4: Verify registration flow**

- Run `npm run dev`
- Navigate to `/register`
- Fill form, submit
- Check database: `npx prisma studio`, verify user row created

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add registration page and API"
```

---

### Task 6: Create login page

**Objective:** Build a login page using NextAuth credentials sign-in

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/actions/login.ts`

**Step 1: Create server action for login**

Create `app/actions/login.ts`:

```typescript
'use server';

import { signIn } from '@/lib/auth';

export async function loginAction(email: string, password: string) {
  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    return { success: true };
  } catch (error) {
    if ((error as any)?.type === 'CredentialsSignin') {
      return { success: false, error: 'Invalid email or password' };
    }
    throw error;
  }
}
```

**Step 2: Create login page**

Create `app/(auth)/login/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (result?.error) {
        message.error('Invalid email or password');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>Welcome Back</Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        Sign in to SpeakTrack
      </Text>
      <Form layout="vertical" onFinish={onFinish} size="large">
        <Form.Item name="email" rules={[{ required: true, message: 'Enter your email' }]}>
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Enter your password' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign In
          </Button>
        </Form.Item>
      </Form>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
        No account? <Link href="/register">Create one</Link>
      </Text>
    </>
  );
}
```

**Step 3: Add NextAuth middleware for route protection**

Create `middleware.ts` at project root:

```typescript
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/log/:path*', '/voice/:path*', '/resources/:path*'],
};
```

**Step 4: Verify login flow**

- Navigate to `/login`
- Enter credentials
- Should redirect to `/dashboard` on success
- Should show error on wrong credentials

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add login page with NextAuth credentials flow"
```

---

### Task 7: Create landing page

**Objective:** Build an attractive landing page for unauthenticated visitors

**Files:**
- Modify: `app/page.tsx`

**Step 1: Write landing page**

Modify `app/page.tsx`:

```tsx
import { Button, Typography, Row, Col, Card, Space } from 'antd';
import { CheckCircleOutlined, AudioOutlined, BookOutlined, LineChartOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

const features = [
  { icon: <CheckCircleOutlined />, title: 'Daily Habit Tracking', desc: 'Log shadowing sessions, voice notes, and coffee chats. Build consistency.' },
  { icon: <AudioOutlined />, title: 'Voice Note Journal', desc: 'Record yourself speaking, rate your progress, and listen back to improve.' },
  { icon: <BookOutlined />, title: 'Resource Library', desc: 'Collect TED talks, podcasts, phrases, and shadowing materials in one place.' },
  { icon: <LineChartOutlined />, title: 'Progress Dashboard', desc: 'See streaks, trends, and confidence scores. Watch yourself improve.' },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px', background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)' }}>
        <Title level={1} style={{ color: '#fff', fontSize: 48, marginBottom: 16 }}>
          SpeakTrack
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, maxWidth: 500, margin: '0 auto 32px' }}>
          The open-source habit tracker built for non-native English speakers.
          Practice deliberately. See your progress. Speak with confidence.
        </Paragraph>
        <Space size="middle">
          <Link href="/register">
            <Button type="default" size="large" style={{ fontWeight: 600 }}>Get Started Free</Button>
          </Link>
          <Link href="/login">
            <Button ghost size="large" style={{ color: '#fff', borderColor: '#fff' }}>Sign In</Button>
          </Link>
        </Space>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Everything You Need to Improve</Title>
        <Row gutter={[24, 24]}>
          {features.map((f, i) => (
            <Col xs={24} sm={12} key={i}>
              <Card hoverable style={{ height: '100%' }}>
                <div style={{ fontSize: 32, color: '#1677ff', marginBottom: 16 }}>{f.icon}</div>
                <Title level={4}>{f.title}</Title>
                <Text type="secondary">{f.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 24px', borderTop: '1px solid #f0f0f0' }}>
        <Text type="secondary">SpeakTrack — Open Source (MIT) · Built with Next.js & Ant Design</Text>
      </div>
    </div>
  );
}
```

**Step 2: Verify landing page**

- Visit `http://localhost:3000` (logged out)
- Should see hero, features grid, and CTA buttons
- "Get Started" → `/register`, "Sign In" → `/login`

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add landing page with hero and feature cards"
```

---

## Phase 2 — Core App Shell + Daily Logs (Tasks 8-11)

### Task 8: Create authenticated app layout with sidebar

**Objective:** Build the dashboard shell that wraps all authenticated pages

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `components/layout/AppSidebar.tsx`
- Create: `components/layout/UserMenu.tsx`

**Step 1: Create sidebar component**

Create `components/layout/AppSidebar.tsx`:

```tsx
'use client';

import { Layout, Menu } from 'antd';
import { CheckSquareOutlined, AudioOutlined, BookOutlined, DashboardOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const items = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/log', icon: <CheckSquareOutlined />, label: 'Daily Log' },
  { key: '/voice', icon: <AudioOutlined />, label: 'Voice Notes' },
  { key: '/resources', icon: <BookOutlined />, label: 'Resources' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Layout.Sider width={220} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <div style={{ padding: '20px 16px', fontWeight: 700, fontSize: 20, color: '#1677ff' }}>
        🎯 SpeakTrack
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={items}
        onClick={({ key }) => router.push(key)}
        style={{ borderRight: 0 }}
      />
    </Layout.Sider>
  );
}
```

**Step 2: Create user menu component**

Create `components/layout/UserMenu.tsx`:

```tsx
'use client';

import { Button, Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';

export default function UserMenu() {
  const { data: session } = useSession();

  return (
    <Dropdown
      menu={{
        items: [
          { key: 'logout', icon: <LogoutOutlined />, label: 'Sign Out', onClick: () => signOut({ callbackUrl: '/' }) },
        ],
      }}
    >
      <Button type="text" icon={<Avatar size="small" icon={<UserOutlined />} />}>
        {session?.user?.name || 'User'}
      </Button>
    </Dropdown>
  );
}
```

**Step 3: Create dashboard layout**

Create `app/(dashboard)/layout.tsx`:

```tsx
import { Layout } from 'antd';
import { SessionProvider } from 'next-auth/react';
import AppSidebar from '@/components/layout/AppSidebar';
import UserMenu from '@/components/layout/UserMenu';

const { Header, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <AppSidebar />
        <Layout>
          <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <UserMenu />
          </Header>
          <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </SessionProvider>
  );
}
```

**Step 4: Create a placeholder dashboard page for now**

Create `app/(dashboard)/dashboard/page.tsx`:

```tsx
import { Typography } from 'antd';

const { Title } = Typography;

export default function DashboardPage() {
  return <Title level={3}>Dashboard</Title>;
}
```

**Step 5: Verify app shell**

- Sign in at `/login`
- Should redirect to `/dashboard`
- Sidebar visible with 4 menu items
- User name in header with sign-out dropdown
- Clicking sidebar items navigates (though other pages 404 for now)

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add authenticated app layout with sidebar navigation"
```

---

### Task 9: Create daily log data access layer

**Objective:** Build the API routes for CRUD operations on daily logs

**Files:**
- Create: `app/api/logs/route.ts`
- Create: `app/api/logs/today/route.ts`
- Create: `app/api/logs/stats/route.ts`

**Step 1: Create logs API (POST for create, GET for list)**

Create `app/api/logs/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId: session.user.id,
      ...(from || to ? {
        date: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        },
      } : {}),
    },
    orderBy: { date: 'desc' },
    take: 90,
  });

  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const today = startOfDay(new Date());

  const log = await prisma.dailyLog.upsert({
    where: {
      userId_date: { userId: session.user.id, date: today },
    },
    update: {
      shadowingDone: body.shadowingDone ?? false,
      shadowingMinutes: body.shadowingMinutes ?? 0,
      voiceNoteDone: body.voiceNoteDone ?? false,
      coffeeChatDone: body.coffeeChatDone ?? false,
      notes: body.notes ?? '',
      energyLevel: body.energyLevel ?? 3,
    },
    create: {
      userId: session.user.id,
      date: today,
      shadowingDone: body.shadowingDone ?? false,
      shadowingMinutes: body.shadowingMinutes ?? 0,
      voiceNoteDone: body.voiceNoteDone ?? false,
      coffeeChatDone: body.coffeeChatDone ?? false,
      notes: body.notes ?? '',
      energyLevel: body.energyLevel ?? 3,
    },
  });

  return NextResponse.json(log);
}
```

**Step 2: Create today's log endpoint**

Create `app/api/logs/today/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay } from 'date-fns';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const log = await prisma.dailyLog.findUnique({
    where: {
      userId_date: { userId: session.user.id, date: today },
    },
  });

  return NextResponse.json(log || null);
}
```

**Step 3: Create stats endpoint (for dashboard: streak, totals)**

Create `app/api/logs/stats/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subDays, startOfDay } from 'date-fns';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const last90 = await prisma.dailyLog.findMany({
    where: {
      userId: session.user.id,
      date: { gte: subDays(new Date(), 90) },
    },
    orderBy: { date: 'desc' },
  });

  // Calculate current streak
  let streak = 0;
  const today = startOfDay(new Date());
  for (let i = 0; i < 90; i++) {
    const checkDate = subDays(today, i);
    const log = last90.find(
      (l) => new Date(l.date).toDateString() === checkDate.toDateString()
    );
    if (log && (log.shadowingDone || log.voiceNoteDone || log.coffeeChatDone)) {
      streak++;
    } else if (i > 0) {
      break; // Streak broken (allow today to be incomplete)
    }
  }

  // Calc totals
  const totalDays = last90.filter(
    (l) => l.shadowingDone || l.voiceNoteDone || l.coffeeChatDone
  ).length;
  const totalShadowingMinutes = last90.reduce((sum, l) => sum + l.shadowingMinutes, 0);
  const totalVoiceNotes = last90.filter((l) => l.voiceNoteDone).length;
  const totalCoffeeChats = last90.filter((l) => l.coffeeChatDone).length;

  return NextResponse.json({
    streak,
    totalDays,
    totalShadowingMinutes,
    totalVoiceNotes,
    totalCoffeeChats,
    logs: last90,
  });
}
```

**Step 4: Verify API endpoints**

```bash
# Test GET logs (should return empty array for new user)
curl -s http://localhost:3000/api/logs

# Test POST a log
curl -s -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"shadowingDone":true,"shadowingMinutes":15,"voiceNoteDone":true,"energyLevel":4}'

# Test stats
curl -s http://localhost:3000/api/logs/stats
```

**Note:** The curl tests may fail due to auth. Test by signing in and navigating to pages instead, or use the browser console.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add daily log API routes (CRUD, today, stats)"
```

---

### Task 10: Build daily log entry page

**Objective:** Create the habit tracking form where users log their daily practice

**Files:**
- Create: `app/(dashboard)/log/page.tsx`

**Step 1: Create daily log page**

Create `app/(dashboard)/log/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, Checkbox, InputNumber, Slider, Input, Button, message, Typography, Space, Divider } from 'antd';
import { AudioOutlined, CoffeeOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function DailyLogPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shadowingDone: false,
    shadowingMinutes: 10,
    voiceNoteDone: false,
    coffeeChatDone: false,
    energyLevel: 3,
    notes: '',
  });

  useEffect(() => {
    fetch('/api/logs/today')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            shadowingDone: data.shadowingDone,
            shadowingMinutes: data.shadowingMinutes,
            voiceNoteDone: data.voiceNoteDone,
            coffeeChatDone: data.coffeeChatDone,
            energyLevel: data.energyLevel,
            notes: data.notes,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        message.success('Log saved!');
      } else {
        message.error('Failed to save');
      }
    } catch {
      message.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={3}>Today&apos;s Practice Log</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </Text>

      {/* Shadowing */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        title={<span><PlayCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />Shadowing Practice</span>}
      >
        <Checkbox
          checked={form.shadowingDone}
          onChange={(e) => setForm({ ...form, shadowingDone: e.target.checked })}
        >
          Done today
        </Checkbox>
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">Minutes practiced</Text>
          <InputNumber
            min={0}
            max={120}
            value={form.shadowingMinutes}
            onChange={(v) => setForm({ ...form, shadowingMinutes: v || 0 })}
            addonAfter="min"
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>
      </Card>

      {/* Voice Note */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        title={<span><AudioOutlined style={{ marginRight: 8, color: '#1677ff' }} />Voice Note</span>}
      >
        <Checkbox
          checked={form.voiceNoteDone}
          onChange={(e) => setForm({ ...form, voiceNoteDone: e.target.checked })}
        >
          Recorded a voice note today
        </Checkbox>
      </Card>

      {/* Coffee Chat */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        title={<span><CoffeeOutlined style={{ marginRight: 8, color: '#1677ff' }} />English Conversation</span>}
      >
        <Checkbox
          checked={form.coffeeChatDone}
          onChange={(e) => setForm({ ...form, coffeeChatDone: e.target.checked })}
        >
          Had a conversation in English today
        </Checkbox>
      </Card>

      {/* Energy Level */}
      <Card size="small" style={{ marginBottom: 16 }} title="Energy Level">
        <Slider
          min={1}
          max={5}
          value={form.energyLevel}
          onChange={(v) => setForm({ ...form, energyLevel: v })}
          marks={{ 1: '😴', 2: '😐', 3: '🙂', 4: '😊', 5: '🔥' }}
        />
      </Card>

      {/* Notes */}
      <Card size="small" style={{ marginBottom: 24 }} title="Notes">
        <Input.TextArea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="What did you practice? Any challenges?"
        />
      </Card>

      <Button type="primary" size="large" onClick={save} loading={saving} icon={<CheckCircleOutlined />} block>
        Save Today&apos;s Log
      </Button>
    </div>
  );
}
```

**Step 2: Verify daily log flow**

- Sign in
- Navigate to `/log`
- Check some boxes, set minutes, save
- Refresh page — data should persist
- Check database: `npx prisma studio` → DailyLog table

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add daily log entry page with habit checkboxes"
```

---

### Task 11: Build dashboard page with stats and calendar heatmap

**Objective:** Create the main dashboard showing streak, stats, and a calendar heatmap of activity

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`
- Create: `components/dashboard/StatsCards.tsx`
- Create: `components/dashboard/CalendarHeatmap.tsx`
- Create: `components/dashboard/RecentActivity.tsx`

**Step 1: Create stats cards component**

Create `components/dashboard/StatsCards.tsx`:

```tsx
'use client';

import { Card, Row, Col, Statistic } from 'antd';
import { FireOutlined, CheckSquareOutlined, AudioOutlined, ClockCircleOutlined, CoffeeOutlined } from '@ant-design/icons';

type Stats = {
  streak: number;
  totalDays: number;
  totalShadowingMinutes: number;
  totalVoiceNotes: number;
  totalCoffeeChats: number;
};

export default function StatsCards({ stats }: { stats: Stats | null }) {
  if (!stats) return null;
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={6}>
        <Card><Statistic title="Current Streak" value={stats.streak} suffix="days" prefix={<FireOutlined />} valueStyle={{ color: '#fa8c16' }} /></Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card><Statistic title="Active Days" value={stats.totalDays} prefix={<CheckSquareOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card><Statistic title="Shadowing" value={stats.totalShadowingMinutes} suffix="min" prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card><Statistic title="Voice Notes" value={stats.totalVoiceNotes} prefix={<AudioOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
      </Col>
    </Row>
  );
}
```

**Step 2: Create calendar heatmap component**

Create `components/dashboard/CalendarHeatmap.tsx`:

```tsx
'use client';

import { Card, Tooltip, Typography } from 'antd';
import { subDays, startOfDay, format } from 'date-fns';

const { Text } = Typography;

function getColor(hasActivity: boolean, intensity: number): string {
  if (!hasActivity) return '#ebedf0';
  if (intensity === 1) return '#9be9a8';
  if (intensity === 2) return '#40c463';
  return '#216e39';
}

type LogEntry = { date: string; shadowingDone: boolean; voiceNoteDone: boolean; coffeeChatDone: boolean };

export default function CalendarHeatmap({ logs }: { logs: LogEntry[] }) {
  const today = startOfDay(new Date());
  const days: { date: Date; count: number; hasActivity: boolean }[] = [];

  for (let i = 83; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logs.find((l) => {
      const logDate = new Date(l.date);
      return format(logDate, 'yyyy-MM-dd') === dateStr;
    });
    const activity = [log?.shadowingDone, log?.voiceNoteDone, log?.coffeeChatDone].filter(Boolean).length;
    days.push({
      date: d,
      count: activity,
      hasActivity: activity > 0,
    });
  }

  // Group into weeks
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <Card title="Practice Calendar (12 weeks)" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <Tooltip
                key={di}
                title={`${format(day.date, 'MMM d')}: ${day.count} activities`}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 2,
                    backgroundColor: getColor(day.hasActivity, Math.min(day.count, 3)),
                  }}
                />
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Less</Text>
        {['#ebedf0', '#9be9a8', '#40c463', '#216e39'].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: c }} />
        ))}
        <Text type="secondary" style={{ fontSize: 12 }}>More</Text>
      </div>
    </Card>
  );
}
```

**Step 3: Create recent activity component**

Create `components/dashboard/RecentActivity.tsx`:

```tsx
'use client';

import { Card, List, Tag, Typography } from 'antd';
import { PlayCircleOutlined, AudioOutlined, CoffeeOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Text } = Typography;

type LogEntry = {
  id: string;
  date: string;
  shadowingDone: boolean;
  shadowingMinutes: number;
  voiceNoteDone: boolean;
  coffeeChatDone: boolean;
  energyLevel: number;
  notes: string;
};

export default function RecentActivity({ logs }: { logs: LogEntry[] }) {
  const recent = logs.slice(0, 14);
  return (
    <Card title="Recent Activity">
      <List
        dataSource={recent}
        renderItem={(log) => (
          <List.Item>
            <div>
              <Text strong>{format(new Date(log.date), 'EEE, MMM d')}</Text>
              <div style={{ marginTop: 4 }}>
                {log.shadowingDone && (
                  <Tag icon={<PlayCircleOutlined />} color="blue">
                    Shadowing {log.shadowingMinutes}m
                  </Tag>
                )}
                {log.voiceNoteDone && (
                  <Tag icon={<AudioOutlined />} color="purple">Voice Note</Tag>
                )}
                {log.coffeeChatDone && (
                  <Tag icon={<CoffeeOutlined />} color="orange">Conversation</Tag>
                )}
                {log.notes && <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>{log.notes}</Text>}
              </div>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: 'No activity yet. Start logging!' }}
      />
    </Card>
  );
}
```

**Step 4: Update dashboard page**

Modify `app/(dashboard)/dashboard/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Typography, Spin } from 'antd';
import StatsCards from '@/components/dashboard/StatsCards';
import CalendarHeatmap from '@/components/dashboard/CalendarHeatmap';
import RecentActivity from '@/components/dashboard/RecentActivity';

const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logs/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <>
      <Title level={3}>Dashboard</Title>
      <StatsCards stats={stats} />
      <CalendarHeatmap logs={stats?.logs || []} />
      <RecentActivity logs={stats?.logs || []} />
    </>
  );
}
```

**Step 5: Verify dashboard**

- Sign in, add a log entry at `/log`
- Navigate to `/dashboard`
- Should see: streak counter, stats cards, calendar heatmap, recent activity list
- Save a few more logs (you can use Prisma Studio to backdate for testing)

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add dashboard with stats, calendar heatmap, and activity feed"
```

---

## Phase 3 — Voice Notes (Tasks 12-14)

### Task 12: Create voice note API routes

**Objective:** Build API endpoints for uploading and listing voice notes

**Files:**
- Create: `app/api/voice/route.ts`
- Create: `public/uploads/voice/` directory

**Step 1: Create uploads directory**

```bash
mkdir -p public/uploads/voice
```

**Step 2: Create voice API route**

Create `app/api/voice/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notes = await prisma.voiceNote.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const selfRating = parseInt(formData.get('selfRating') as string) || 3;
    const transcript = (formData.get('transcript') as string) || '';
    const notes = (formData.get('notes') as string) || '';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }

    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${uuid()}.webm`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'voice', filename);

    await mkdir(join(process.cwd(), 'public', 'uploads', 'voice'), { recursive: true });
    await writeFile(filePath, buffer);

    const voiceNote = await prisma.voiceNote.create({
      data: {
        userId: session.user.id,
        filePath: `/uploads/voice/${filename}`,
        duration: 0,
        selfRating,
        transcript,
        notes,
      },
    });

    return NextResponse.json(voiceNote, { status: 201 });
  } catch (error) {
    console.error('Voice upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

**Step 3: Create voice note delete endpoint**

Create `app/api/voice/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await prisma.voiceNote.findUnique({ where: { id: params.id } });
  if (!note || note.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await unlink(join(process.cwd(), 'public', note.filePath));
  } catch {
    // File may already be gone — ok
  }

  await prisma.voiceNote.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add voice note API routes (upload, list, delete)"
```

---

### Task 13: Build voice recorder component

**Objective:** Create a browser-based audio recorder using MediaRecorder API

**Files:**
- Create: `components/voice/VoiceRecorder.tsx`

**Step 1: Create voice recorder component**

Create `components/voice/VoiceRecorder.tsx`:

```tsx
'use client';

import { useState, useRef } from 'react';
import { Button, Space, message, Typography, Progress } from 'antd';
import { AudioOutlined, AudioMutedOutlined, StopOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function VoiceRecorder({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        onRecordingComplete(blob);
      };

      mediaRecorder.current.start();
      setRecording(true);
      setElapsed(0);
      timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      message.error('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
    if (timer.current) clearInterval(timer.current);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (recording) {
    return (
      <div style={{ textAlign: 'center', padding: 16 }}>
        <div style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 8 }}>
          <AudioOutlined style={{ animation: 'pulse 1s infinite' }} />
        </div>
        <Text strong style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{formatTime(elapsed)}</Text>
        <Progress percent={Math.min((elapsed / 120) * 100, 100)} showInfo={false} status="active" />
        <Button danger size="large" icon={<StopOutlined />} onClick={stopRecording} style={{ marginTop: 16 }}>
          Stop Recording
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="primary"
      size="large"
      icon={<AudioOutlined />}
      onClick={startRecording}
    >
      Start Recording
    </Button>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add voice recorder component using MediaRecorder API"
```

---

### Task 14: Build voice notes page

**Objective:** Create the voice notes listing page with recorder, playback, and self-rating

**Files:**
- Create: `app/(dashboard)/voice/page.tsx`
- Create: `components/voice/VoiceNoteCard.tsx`

**Step 1: Create voice note card component**

Create `components/voice/VoiceNoteCard.tsx`:

```tsx
'use client';

import { Card, Rate, Tag, Button, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Text, Paragraph } = Typography;

type VoiceNote = {
  id: string;
  filePath: string;
  selfRating: number;
  transcript: string;
  notes: string;
  createdAt: string;
};

export default function VoiceNoteCard({ note, onDelete }: { note: VoiceNote; onDelete: (id: string) => void }) {
  return (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      title={
        <span>
          <PlayCircleOutlined style={{ marginRight: 8 }} />
          {format(new Date(note.createdAt), 'MMM d, yyyy — h:mm a')}
        </span>
      }
      extra={
        <Popconfirm title="Delete this note?" onConfirm={() => onDelete(note.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      }
    >
      <audio controls src={note.filePath} style={{ width: '100%', marginBottom: 12 }} />
      <div>
        <Text type="secondary">Self-rating: </Text>
        <Rate disabled value={note.selfRating} style={{ fontSize: 16 }} />
      </div>
      {note.notes && (
        <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 13 }}>
          {note.notes}
        </Paragraph>
      )}
    </Card>
  );
}
```

**Step 2: Create voice notes page**

Create `app/(dashboard)/voice/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Select, Input, Button, message, Space, Empty } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import VoiceNoteCard from '@/components/voice/VoiceNoteCard';

const { Title, Text } = Typography;

export default function VoiceNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selfRating, setSelfRating] = useState(3);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    const res = await fetch('/api/voice');
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const uploadRecording = async () => {
    if (!recordedBlob) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('audio', recordedBlob, 'recording.webm');
      formData.append('selfRating', selfRating.toString());
      formData.append('notes', noteText);

      const res = await fetch('/api/voice', { method: 'POST', body: formData });
      if (res.ok) {
        message.success('Voice note saved!');
        setRecordedBlob(null);
        setNoteText('');
        setSelfRating(3);
        fetchNotes();
      } else {
        message.error('Failed to save');
      }
    } catch {
      message.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    const res = await fetch(`/api/voice/${id}`, { method: 'DELETE' });
    if (res.ok) {
      message.success('Deleted');
      fetchNotes();
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={3}>Voice Notes</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Record yourself speaking English. Rate your performance. Track improvement over time.
      </Text>

      {/* Recording section */}
      <Card title="New Recording" style={{ marginBottom: 24 }}>
        {!recordedBlob ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <VoiceRecorder onRecordingComplete={(blob) => setRecordedBlob(blob)} />
            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
              Record up to 2 minutes. Describe your day, explain a technical concept, or read a passage.
            </Text>
          </div>
        ) : (
          <div>
            <audio controls src={URL.createObjectURL(recordedBlob)} style={{ width: '100%', marginBottom: 16 }} />
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">How would you rate this recording?</Text>
              <div>
                <Select value={selfRating} onChange={setSelfRating} style={{ width: 200 }} size="small">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Select.Option key={n} value={n}>
                      {n === 1 ? '😰 Needs work' : n === 2 ? '😐 Below average' : n === 3 ? '🙂 Okay' : n === 4 ? '😊 Good' : '🔥 Great!'}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            <Input.TextArea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Notes (what did you practice? what sounds difficult?)"
              style={{ marginBottom: 12 }}
            />
            <Space>
              <Button type="primary" icon={<SaveOutlined />} onClick={uploadRecording} loading={saving}>
                Save Recording
              </Button>
              <Button onClick={() => setRecordedBlob(null)}>Discard</Button>
            </Space>
          </div>
        )}
      </Card>

      {/* Previous notes */}
      <Title level={4}>Previous Recordings</Title>
      {loading ? (
        <Text>Loading...</Text>
      ) : notes.length === 0 ? (
        <Empty description="No voice notes yet. Record your first one!" />
      ) : (
        notes.map((note) => (
          <VoiceNoteCard key={note.id} note={note} onDelete={deleteNote} />
        ))
      )}
    </div>
  );
}
```

**Step 3: Verify voice notes flow**

- Sign in, go to `/voice`
- Grant mic permission
- Record a short clip, stop
- Rate it, add notes, save
- Should appear in list with playback
- Delete should work

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add voice notes page with recorder, playback, and self-rating"
```

---

## Phase 4 — Resources (Tasks 15-17)

### Task 15: Create resources API routes

**Objective:** Build CRUD endpoints for the resource library

**Files:**
- Create: `app/api/resources/route.ts`

**Step 1: Create resources API**

Create `app/api/resources/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const tag = searchParams.get('tag');

  const resources = await prisma.resource.findMany({
    where: {
      userId: session.user.id,
      ...(type ? { type } : {}),
      ...(tag ? { tags: { contains: tag } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json(resources);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.title || !body.type) {
    return NextResponse.json({ error: 'Title and type required' }, { status: 400 });
  }

  const resource = await prisma.resource.create({
    data: {
      userId: session.user.id,
      type: body.type,
      title: body.title,
      url: body.url || '',
      content: body.content || '',
      tags: body.tags || '',
    },
  });

  return NextResponse.json(resource, { status: 201 });
}
```

**Step 2: Create resource delete endpoint**

Create `app/api/resources/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resource = await prisma.resource.findUnique({ where: { id: params.id } });
  if (!resource || resource.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.resource.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const resource = await prisma.resource.update({
    where: { id: params.id, userId: session.user.id },
    data: {
      title: body.title,
      type: body.type,
      url: body.url,
      content: body.content,
      tags: body.tags,
    },
  });

  return NextResponse.json(resource);
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add resources API routes (list, create, update, delete)"
```

---

### Task 16: Build resources page

**Objective:** Create the resource library page with add/edit/delete and filtering

**Files:**
- Create: `app/(dashboard)/resources/page.tsx`
- Create: `components/resources/ResourceCard.tsx`
- Create: `components/resources/AddResourceModal.tsx`

**Step 1: Create resource card component**

Create `components/resources/ResourceCard.tsx`:

```tsx
'use client';

import { Card, Tag, Button, Popconfirm, Typography, Space } from 'antd';
import { LinkOutlined, FileTextOutlined, PlayCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

type Resource = {
  id: string;
  type: string;
  title: string;
  url: string;
  content: string;
  tags: string;
};

const typeIcons: Record<string, React.ReactNode> = {
  link: <LinkOutlined />,
  phrase: <FileTextOutlined />,
  shadowing: <PlayCircleOutlined />,
};

const typeColors: Record<string, string> = {
  link: 'blue',
  phrase: 'green',
  shadowing: 'purple',
};

export default function ResourceCard({
  resource,
  onDelete,
  onEdit,
}: {
  resource: Resource;
  onDelete: (id: string) => void;
  onEdit: (resource: Resource) => void;
}) {
  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={
        <Space>
          <Tag color={typeColors[resource.type] || 'default'} icon={typeIcons[resource.type]}>
            {resource.type}
          </Tag>
          <Text strong>{resource.title}</Text>
        </Space>
      }
      extra={
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(resource)} />
          <Popconfirm title="Delete?" onConfirm={() => onDelete(resource.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      }
    >
      {resource.url && (
        <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: 8 }}>
          {resource.url}
        </a>
      )}
      {resource.content && (
        <Paragraph type="secondary" style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
          {resource.content}
        </Paragraph>
      )}
      {resource.tags && (
        <div>
          {resource.tags.split(',').map((tag) => (
            <Tag key={tag} style={{ marginBottom: 4 }}>{tag.trim()}</Tag>
          ))}
        </div>
      )}
    </Card>
  );
}
```

**Step 2: Create add/edit resource modal**

Create `components/resources/AddResourceModal.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

type Resource = {
  id?: string;
  type: string;
  title: string;
  url: string;
  content: string;
  tags: string;
};

export default function AddResourceModal({
  open,
  onClose,
  onSave,
  editResource,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editResource: Resource | null;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editResource) {
      form.setFieldsValue(editResource);
    } else {
      form.resetFields();
    }
  }, [editResource, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editResource?.id
        ? `/api/resources/${editResource.id}`
        : '/api/resources';
      const method = editResource?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success(editResource ? 'Updated!' : 'Added!');
        onSave();
        onClose();
        form.resetFields();
      } else {
        message.error('Failed to save');
      }
    } catch {
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editResource ? 'Edit Resource' : 'Add Resource'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ type: 'link' }}>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="link">🔗 Link</Select.Option>
            <Select.Option value="phrase">📝 Phrase</Select.Option>
            <Select.Option value="shadowing">🎙️ Shadowing Material</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="e.g., 'How great leaders inspire action — Simon Sinek'" />
        </Form.Item>
        <Form.Item name="url" label="URL">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="content" label="Content / Phrase">
          <Input.TextArea rows={3} placeholder="The phrase, quote, or notes..." />
        </Form.Item>
        <Form.Item name="tags" label="Tags">
          <Input placeholder="ted, motivation, pronunciation (comma separated)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

**Step 3: Create resources page**

Create `app/(dashboard)/resources/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, Button, Select, Space, Empty, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ResourceCard from '@/components/resources/ResourceCard';
import AddResourceModal from '@/components/resources/AddResourceModal';

const { Title, Text } = Typography;

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editResource, setEditResource] = useState<any>(null);
  const [filterType, setFilterType] = useState<string | undefined>();
  const [searchTag, setSearchTag] = useState('');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (searchTag) params.set('tag', searchTag);

    const res = await fetch(`/api/resources?${params}`);
    const data = await res.json();
    setResources(data);
    setLoading(false);
  }, [filterType, searchTag]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const deleteResource = async (id: string) => {
    await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    fetchResources();
  };

  const openEdit = (resource: any) => {
    setEditResource(resource);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditResource(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Resource Library</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Add Resource
        </Button>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="All types"
          allowClear
          style={{ width: 160 }}
          value={filterType}
          onChange={setFilterType}
        >
          <Select.Option value="link">🔗 Links</Select.Option>
          <Select.Option value="phrase">📝 Phrases</Select.Option>
          <Select.Option value="shadowing">🎙️ Shadowing</Select.Option>
        </Select>
        <Input
          placeholder="Search by tag..."
          prefix={<SearchOutlined />}
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          style={{ width: 200 }}
        />
      </Space>

      {/* Resource list */}
      {loading ? (
        <Text>Loading...</Text>
      ) : resources.length === 0 ? (
        <Empty description="No resources yet. Add your first one!" />
      ) : (
        resources.map((r) => (
          <ResourceCard key={r.id} resource={r} onDelete={deleteResource} onEdit={openEdit} />
        ))
      )}

      {/* Modal */}
      <AddResourceModal
        open={modalOpen}
        onClose={closeModal}
        onSave={fetchResources}
        editResource={editResource}
      />
    </div>
  );
}
```

**Step 4: Verify resources flow**

- Go to `/resources`
- Click "Add Resource"
- Add a link (TED talk, podcast, etc.)
- Add a phrase
- Filter by type
- Edit and delete

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add resource library page with add/edit/delete and filtering"
```

---

### Task 17: Create seed data with curated English speaking resources

**Objective:** Pre-populate the database with high-quality resources for new users

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

**Step 1: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seedResources = [
  // TED Talks — great for shadowing
  { type: 'shadowing', title: 'How great leaders inspire action — Simon Sinek', url: 'https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action', content: 'Iconic TED talk. Clear, slow delivery — excellent for shadowing practice. Focus on the "golden circle" concept.', tags: 'ted,motivation,leadership,shadowing,beginner' },
  { type: 'shadowing', title: 'The power of vulnerability — Brené Brown', url: 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability', content: 'One of the most viewed TED talks. Conversational style, great for practicing natural English rhythm.', tags: 'ted,communication,vulnerability,shadowing,intermediate' },
  { type: 'shadowing', title: 'Do schools kill creativity? — Sir Ken Robinson', url: 'https://www.ted.com/talks/sir_ken_robinson_do_schools_kill_creativity', content: 'Witty, humorous delivery. Good for practicing timing and humor in English.', tags: 'ted,education,creativity,shadowing,humor' },
  { type: 'shadowing', title: 'Your body language may shape who you are — Amy Cuddy', url: 'https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are', content: 'Clear academic English with personal story. Great for formal + informal mix.', tags: 'ted,psychology,body-language,shadowing,intermediate' },

  // Tech talks — developer-relevant
  { type: 'shadowing', title: 'The Future of Programming — Uncle Bob Martin', url: 'https://www.youtube.com/watch?v=ecIWPzGEbFc', content: 'Legendary tech talk. Clear enunciation, repeats key points — excellent for tech English.', tags: 'tech,programming,clean-code,shadowing,advanced' },
  { type: 'shadowing', title: 'Why Buildings Don\'t Fall Down — The Engineering Mindset', url: 'https://www.youtube.com/watch?v=Zfj4OPMxJnk', content: 'Explains complex ideas simply. Great model for explaining technical concepts in plain English.', tags: 'tech,engineering,explanation,shadowing,intermediate' },

  // Podcasts
  { type: 'link', title: '6 Minute English — BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', content: 'Weekly 6-minute episodes with transcripts. Perfect daily listening practice.', tags: 'bbc,podcast,daily,beginner,listening' },
  { type: 'link', title: 'The Changelog — Conversations about software', url: 'https://changelog.com/podcast', content: 'Long-form developer interviews. Natural tech conversation English.', tags: 'tech,podcast,software,advanced,listening' },
  { type: 'link', title: 'Syntax.fm — Web Development Podcast', url: 'https://syntax.fm/', content: 'Two developers discussing web tech. Casual, modern English with lots of tech vocabulary.', tags: 'tech,podcast,webdev,javascript,intermediate,listening' },
  { type: 'link', title: 'YouGlish — Pronunciation Search Engine', url: 'https://youglish.com/', content: 'Type any word or phrase, hear it pronounced in real YouTube videos. Essential tool.', tags: 'pronunciation,tool,essential' },
  { type: 'link', title: 'VOA Learning English', url: 'https://learningenglish.voanews.com/', content: 'News articles with audio. Slower, clearer English tailored for learners.', tags: 'news,reading,listening,beginner' },

  // Useful phrases for developers
  { type: 'phrase', title: 'Standup update template', content: 'Yesterday I worked on [X]. Today I\'m planning to [Y]. I\'m blocked on [Z] — could use help from [person].', tags: 'work,standup,meeting,daily' },
  { type: 'phrase', title: 'Asking for clarification in meetings', content: '"Sorry, could you say that again?" / "Just to make sure I understand..." / "Could you elaborate on that?" / "What do you mean by [term]?"', tags: 'meeting,clarification,polite,essential' },
  { type: 'phrase', title: 'Code review feedback phrases', content: '"I wonder if we could simplify this by..." / "Have you considered [alternative approach]?" / "This looks good! One small suggestion..." / "Could you add a comment explaining why...?"', tags: 'code-review,feedback,collaboration,work' },
  { type: 'phrase', title: 'Giving a tech presentation — transitions', content: '"Let\'s move on to..." / "That brings me to my next point..." / "To illustrate this..." / "In summary..." / "I\'d be happy to take questions."', tags: 'presentation,public-speaking,transitions,work' },
  { type: 'phrase', title: 'Australian workplace phrases', content: '"No worries" (it\'s fine / you\'re welcome). "Arvo" (afternoon). "How\'re you going?" (How are you?). "Good on ya" (well done). "Fair dinkum" (genuine/real).', tags: 'australia,workplace,culture,slang' },
  { type: 'phrase', title: 'Small talk at work', content: '"How was your weekend?" / "Any plans for the holiday?" / "Did you catch the [sport] game?" / "The weather\'s been [nice/terrible] lately, hasn\'t it?"', tags: 'small-talk,work,social,essential' },
  { type: 'phrase', title: 'Expressing uncertainty politely', content: '"I\'m not 100% sure, but I think..." / "Let me double-check and get back to you." / "Off the top of my head..." / "I\'d need to look into that more."', tags: 'meeting,uncertainty,polite,essential' },
];

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const demoPassword = await bcrypt.hash('demo1234', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@speaktrack.app' },
    update: {},
    create: {
      email: 'demo@speaktrack.app',
      name: 'Demo User',
      passwordHash: demoPassword,
      nativeLanguage: 'Chinese',
    },
  });

  // Create seed resources for demo user
  for (const resource of seedResources) {
    await prisma.resource.create({
      data: {
        ...resource,
        userId: demoUser.id,
        isPublic: true,
      },
    });
  }

  // Create some sample daily logs for the demo user
  const sampleLogs = Array.from({ length: 21 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (20 - i));
    const hasActivity = Math.random() > 0.3;
    return {
      userId: demoUser.id,
      date,
      shadowingDone: hasActivity && Math.random() > 0.4,
      shadowingMinutes: hasActivity ? Math.floor(Math.random() * 20) + 5 : 0,
      voiceNoteDone: hasActivity && Math.random() > 0.5,
      coffeeChatDone: hasActivity && Math.random() > 0.7,
      energyLevel: Math.floor(Math.random() * 3) + 2,
      notes: hasActivity ? 'Practiced pronunciation of "th" sounds' : '',
    };
  });

  for (const log of sampleLogs) {
    await prisma.dailyLog.upsert({
      where: {
        userId_date: { userId: demoUser.id, date: log.date },
      },
      update: log,
      create: log,
    });
  }

  console.log(`Seeded: demo user (demo@speaktrack.app / demo1234)`);
  console.log(`Seeded: ${seedResources.length} resources`);
  console.log(`Seeded: ${sampleLogs.length} sample daily logs`);

  // Create a default public resource pool (not tied to any user — seeded as demo user's public resources for now)
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Add seed script and ts-node config to package.json**

```bash
npm install --save-dev ts-node
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**Step 3: Run seed**

```bash
npx prisma db seed
```

Expected: Creates demo user, 18 resources, 21 sample daily logs.

**Step 4: Verify seed data**

```bash
npx prisma studio
```

Check: User table has `demo@speaktrack.app`, Resources table has ~18 entries, DailyLog table has ~21 entries.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add seed data with curated resources, demo user, and sample logs"
```

---

## Phase 5 — Polish + Docker (Tasks 18-19)

### Task 18: Polish UI, add loading states, and error boundaries

**Objective:** Improve UX with loading skeletons, error handling, and responsive tweaks

**Files:**
- Create: `components/ui/LoadingSkeleton.tsx`
- Modify: various page files

**Step 1: Create loading skeleton component**

Create `components/ui/LoadingSkeleton.tsx`:

```tsx
import { Skeleton, Card, Row, Col } from 'antd';

export function DashboardSkeleton() {
  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={12} sm={6} key={i}>
            <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
          </Col>
        ))}
      </Row>
      <Card style={{ marginBottom: 24 }}><Skeleton active paragraph={{ rows: 4 }} /></Card>
      <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>
    </>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} style={{ marginBottom: 12 }}><Skeleton active /></Card>
      ))}
    </>
  );
}
```

**Step 2: Replace Spin with skeleton on dashboard**

Update dashboard page to use `DashboardSkeleton` instead of `<Spin>`.

**Step 3: Add error boundaries to key pages**

Create `components/ui/ErrorBoundary.tsx`:

```tsx
'use client';

import { Button, Result } from 'antd';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <Result
      status="error"
      title="Something went wrong"
      subTitle={error.message || 'An unexpected error occurred'}
      extra={<Button type="primary" onClick={reset}>Try Again</Button>}
    />
  );
}
```

Add `error.tsx` files to `app/(dashboard)/` route groups.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add loading skeletons and error boundaries"
```

---

### Task 19: Create Docker setup for deployment

**Objective:** Package the app with Docker + docker-compose for easy deployment

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Step 1: Create Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

**Step 2: Add output: standalone to next.config.ts**

Ensure `next.config.ts` includes:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/nextjs-registry', 'rc-util', 'rc-pagination', 'rc-picker'],
};
```

**Step 3: Create docker-compose.yml**

Create `docker-compose.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/app/prisma/dev.db
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    volumes:
      - speaktrack-data:/app/prisma
      - speaktrack-uploads:/app/public/uploads

volumes:
  speaktrack-data:
  speaktrack-uploads:
```

**Step 4: Create .dockerignore**

Create `.dockerignore`:

```
node_modules
.next
.git
.env.local
*.md
!README.md
```

**Step 5: Build and verify**

```bash
docker compose build
docker compose up -d
curl -s http://localhost:3000 | head -20
```

Expected: Landing page HTML returned.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Docker and docker-compose setup"
```

---

## Phase 6 — README & Open Source Prep (Task 20)

### Task 20: Write comprehensive README

**Objective:** Create a README that explains what SpeakTrack is, how to run it, and how to contribute

**Files:**
- Create: `README.md`
- Create: `LICENSE` (MIT)

**Step 1: Create README**

Create `README.md`:

```markdown
# 🎯 SpeakTrack

**The open-source habit tracker built for non-native English speakers.**

Track your speaking practice. Record voice notes. Build a personal library of resources.
See your progress over time with streaks, stats, and a calendar heatmap.

## Features

- ✅ **Daily Habit Tracking** — Log shadowing sessions, voice notes, and English conversations
- 🎙️ **Voice Note Journal** — Record yourself, rate your performance, and listen back
- 📚 **Resource Library** — Save TED talks, podcasts, phrases, and shadowing materials
- 📊 **Progress Dashboard** — Streak counter, calendar heatmap, and activity feed
- 🌍 **Open Source (MIT)** — Use it, modify it, contribute

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + Ant Design 6
- **Backend:** Next.js API routes + Prisma ORM
- **Database:** SQLite (development) → PostgreSQL (production-ready)
- **Auth:** NextAuth.js v5 (credentials + JWT)
- **Charts:** Recharts

## Quick Start

### Prerequisites
- Node.js 22+
- npm

### Setup

```bash
# Clone
git clone https://github.com/your-org/speaktrack.git
cd speaktrack

# Install
npm install

# Environment
cp .env.example .env
# Edit .env and set AUTH_SECRET (generate with: openssl rand -base64 32)

# Database
npx prisma migrate dev --name init
npx prisma db seed  # Creates demo user + sample data

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login
- Email: `demo@speaktrack.app`
- Password: `demo1234`

### Docker

```bash
docker compose up -d
```

## How to Use

1. **Register** an account
2. **Log your daily practice** on the Daily Log page
3. **Record voice notes** — practice speaking and rate yourself
4. **Save resources** — collect TED talks, phrases, and useful links
5. **Check your dashboard** — see your streak, stats, and progress

## Contributing

Pull requests welcome! Areas for contribution:

- 🌐 i18n / translations
- 📱 Mobile-responsive improvements
- 🎨 New themes
- 📊 Additional chart types
- 🔌 OAuth providers (Google, GitHub)
- ☁️ PostgreSQL / cloud deployment guides

## License

MIT — see [LICENSE](LICENSE)
```

**Step 2: Create MIT LICENSE**

Create `LICENSE`:

```
MIT License

Copyright (c) 2025 SpeakTrack Contributors

Permission is hereby granted, free of charge, ... (standard MIT text)
```

**Step 3: Create .env.example**

Create `.env.example`:

```
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "docs: add README, LICENSE (MIT), and .env.example"
```

---

## Summary

| Phase | Tasks | What You Get |
|---|---|---|
| Phase 0 | 1-4 | Project scaffolded, Next.js + Ant Design + Prisma + Auth |
| Phase 1 | 5-7 | Registration, login, landing page |
| Phase 2 | 8-11 | App shell with sidebar, daily log form, dashboard with stats + heatmap |
| Phase 3 | 12-14 | Voice recorder, voice note list, self-rating, audio playback |
| Phase 4 | 15-17 | Resource library (CRUD, filtering), seed data with curated resources |
| Phase 5 | 18-19 | Loading states, error boundaries, Docker |
| Phase 6 | 20 | README, LICENSE, open source ready |

**Total: 20 tasks, ~2-3 days of focused development.**

---

*Plan written: 2025-05-25. Ready for execution.*
