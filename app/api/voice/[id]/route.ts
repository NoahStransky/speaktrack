import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const note = await prisma.voiceNote.findUnique({ where: { id } });
  if (!note || note.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try { await unlink(join(process.cwd(), 'public', note.filePath)); } catch { /* already gone */ }
  await prisma.voiceNote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
