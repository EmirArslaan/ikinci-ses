import { prisma } from "./prisma";

/**
 * Check and update user badges based on current statistics
 */
export async function updateUserBadges(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                emailVerified: true,
                phoneVerified: true,
                averageRating: true,
                totalReviews: true,
                _count: {
                    select: {
                        listings: {
                            where: {
                                approvalStatus: "APPROVED",
                                isActive: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) return;

        const updates: any = {};

        // Verified Badge: Email AND Phone verified
        const isVerified = user.emailVerified && user.phoneVerified;
        updates.isVerified = isVerified;

        // Trusted Seller Badge:
        // - Average rating >= 4.5
        // - Total reviews >= 5
        // - At least 3 approved active listings
        const isTrustedSeller =
            (user.averageRating || 0) >= 4.5 &&
            (user.totalReviews || 0) >= 5 &&
            user._count.listings >= 3;

        updates.isTrustedSeller = isTrustedSeller;

        // Update user badges
        await prisma.user.update({
            where: { id: userId },
            data: updates
        });

    } catch (error) {
        console.error("Error updating user badges:", error);
    }
}

/**
 * Recalculate user's rating statistics
 */
export async function updateUserRating(userId: string) {
    try {
        const reviews = await prisma.review.findMany({
            where: { reviewedId: userId },
            select: { rating: true }
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        await prisma.user.update({
            where: { id: userId },
            data: {
                averageRating,
                totalReviews
            }
        });

        // Update badges after rating change
        await updateUserBadges(userId);

    } catch (error) {
        console.error("Error updating user rating:", error);
    }
}
