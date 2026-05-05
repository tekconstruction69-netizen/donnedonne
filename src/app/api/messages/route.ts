import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    const where = postId
      ? {
          postId,
          OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
        }
      : {
          OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
        };

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        post: { select: { id: true, title: true, userId: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark received messages as read
    if (postId) {
      await prisma.message.updateMany({
        where: { postId, receiverId: session.user.id, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

    const { postId, receiverId, content } = await req.json();
    if (!postId || !receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    if (receiverId === session.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous envoyer un message.' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { postId, senderId: session.user.id, receiverId, content: content.trim() },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        post: { select: { id: true, title: true, userId: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
