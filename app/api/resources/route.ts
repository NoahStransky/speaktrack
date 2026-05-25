import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const tag = searchParams.get('tag');

  const resources = await prisma.resource.findMany({
    where: { userId: session.user.id, ...(type ? { type } : {}), ...(tag ? { tags: { contains: tag } } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(resources);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.title || !body.type) return NextResponse.json({ error: 'Title and type required' }, { status: 400 });

  const resource = await prisma.resource.create({
    data: { userId: session.user.id, type: body.type, title: body.title, url: body.url || '', content: body.content || '', tags: body.tags || '' },
  });
  return NextResponse.json(resource, { status: 201 });
}
