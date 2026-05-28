import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource || resource.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.resource.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const resource = await prisma.resource.update({
    where: { id, userId: session.user.id },
    data: { title: body.title, type: body.type, url: body.url, content: body.content, tags: body.tags },
  });
  return NextResponse.json(resource);
}
