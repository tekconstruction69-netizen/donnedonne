import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

    const { postId, reportedId, reason } = await req.json();
    if (!postId || !reportedId || !reason) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    if (reportedId === session.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous signaler vous-même.' }, { status: 400 });
    }

    // Prevent duplicate complaints from same user
    const existing = await prisma.complaint.findFirst({
      where: { complainantId: session.user.id, postId },
    });
    if (existing) {
      return NextResponse.json({ error: 'Vous avez déjà signalé ce don.' }, { status: 409 });
    }

    const complaint = await prisma.complaint.create({
      data: { complainantId: session.user.id, reportedId, postId, reason },
    });

    // Auto-suspend after 3 unique complaints
    const complaintCount = await prisma.complaint.count({
      where: { reportedId },
    });

    if (complaintCount >= 3) {
      await prisma.user.update({
        where: { id: reportedId },
        data: { isSuspended: true },
      });
      // Also deactivate all their posts
      await prisma.post.updateMany({
        where: { userId: reportedId },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
