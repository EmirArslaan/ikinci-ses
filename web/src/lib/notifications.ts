import { prisma } from "./prisma";

interface CreateNotificationParams {
    userId: string;
    type: "MESSAGE" | "FAVORITE_UPDATE" | "LISTING_APPROVED" | "LISTING_REJECTED" |
    "QUESTION_APPROVED" | "QUESTION_REJECTED" | "MEETUP_APPROVED" | "MEETUP_REJECTED";
    title: string;
    message: string;
    link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link,
            },
        });
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
}

export async function createBulkNotifications(notifications: CreateNotificationParams[]) {
    try {
        await prisma.notification.createMany({
            data: notifications.map(n => ({
                userId: n.userId,
                type: n.type,
                title: n.title,
                message: n.message,
                link: n.link,
            })),
        });
    } catch (error) {
        console.error("Error creating bulk notifications:", error);
    }
}
