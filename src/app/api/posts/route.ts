import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const halal = searchParams.get('halal');

    const where: Record<string, unknown> = { isActive: true };
    if (type && type !== 'ALL') where.type = type;
    if (category) where.category = category;
    if (halal === 'true') where.isHalal = true;

    const posts = await prisma.post.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, description, category, isHalal, preparedDate, address, latitude, longitude } = body;

    if (!type || !title || !description || !category || !address || latitude == null || longitude == null) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        type,
        title,
        description,
        category,
        isHalal: Boolean(isHalal),
        preparedDate: preparedDate || null,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
