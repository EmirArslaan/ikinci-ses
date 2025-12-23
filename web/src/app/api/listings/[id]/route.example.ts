import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import {
    asyncHandler,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    validateRequest,
} from '@/lib/error-handler';
import { updateListingSchema } from '@/lib/validations/listing.validation';

/**
 * Example API Route using new error handling
 * 
 * This demonstrates how to use the error handling infrastructure.
 * All errors are automatically caught, logged, and formatted.
 */

// GET /api/listings/[id] - Get single listing
export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    const listing = await prisma.listing.findUnique({
        where: { id: params.id },
        include: {
            category: true,
            brand: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    averageRating: true,
                    totalReviews: true,
                    isVerified: true,
                    isTrustedSeller: true,
                },
            },
        },
    });

    if (!listing) {
        throw new NotFoundError('Listing');
    }

    // Increment view count (fire and forget)
    prisma.listing.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
    }).catch(() => {
        // Ignore view count errors
    });

    return Response.json(listing);
});

// PUT /api/listings/[id] - Update listing
export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    // Authentication
    const payload = getUserFromRequest(req);
    if (!payload) {
        throw new AuthenticationError();
    }

    // Fetch listing
    const listing = await prisma.listing.findUnique({
        where: { id: params.id },
    });

    if (!listing) {
        throw new NotFoundError('Listing');
    }

    // Authorization
    if (listing.userId !== payload.userId && payload.role !== 'ADMIN') {
        throw new AuthorizationError('You can only edit your own listings');
    }

    // Validate request body
    const data = await validateRequest(req, updateListingSchema);

    // Update listing
    const updatedListing = await prisma.listing.update({
        where: { id: params.id },
        data,
        include: {
            category: true,
            brand: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });

    return Response.json(updatedListing);
});

// DELETE /api/listings/[id] - Delete listing
export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    // Authentication
    const payload = getUserFromRequest(req);
    if (!payload) {
        throw new AuthenticationError();
    }

    // Fetch listing
    const listing = await prisma.listing.findUnique({
        where: { id: params.id },
    });

    if (!listing) {
        throw new NotFoundError('Listing');
    }

    // Authorization
    if (listing.userId !== payload.userId && payload.role !== 'ADMIN') {
        throw new AuthorizationError('You can only delete your own listings');
    }

    // Soft delete
    await prisma.listing.update({
        where: { id: params.id },
        data: { isActive: false },
    });

    return Response.json({ message: 'Listing deleted successfully' });
});
