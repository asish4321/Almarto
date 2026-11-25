import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Please sign in to submit a review' }, { status: 401 });
    }

    const { productId, rating, title, comment } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ message: 'Rating and comment are required' }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        title: title || null,
        comment,
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });

    // Update product average rating
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: reviews.length,
      },
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error('Review submit error:', error);
    return NextResponse.json({ message: 'Failed to submit review' }, { status: 500 });
  }
}
