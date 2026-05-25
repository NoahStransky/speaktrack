import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notes = await prisma.voiceNote.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const selfRating = parseInt(formData.get('selfRating') as string) || 3;
    const notes = (formData.get('notes') as string) || '';

    if (!audioFile) return NextResponse.json({ error: 'No audio file' }, { status: 400 });

    const bytes = await audioFile.arrayBuffer();
    const filename = `${uuid()}.webm`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'voice', filename);

    await mkdir(join(process.cwd(), 'public', 'uploads', 'voice'), { recursive: true });
    await writeFile(filePath, Buffer.from(bytes));

    const voiceNote = await prisma.voiceNote.create({
      data: { userId: session.user.id, filePath: `/uploads/voice/${filename}`, duration: 0, selfRating, notes },
    });
    return NextResponse.json(voiceNote, { status: 201 });
  } catch (error) {
    console.error('Voice upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
