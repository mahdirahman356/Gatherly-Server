import { Request } from "express";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../lib/prisma";


const toggleSaveEvent = async (user: IJWTPayload, eventId: string) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const existing = await prisma.savedEvent.findUnique({
        where: {
            userId_eventId: {
                userId: userInfo.id,
                eventId,
            },
        },
    });

    if (existing) {
        await prisma.savedEvent.delete({
            where: { id: existing.id },
        });

        return { saved: false };
    }

    await prisma.savedEvent.create({
        data: {
            userId: userInfo.id,
            eventId,
        },
    });

    return { saved: true };
};

export const getUserSavedEvents = async (user: IJWTPayload) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const saved = await prisma.savedEvent.findMany({
        where: {
            userId: userInfo.id,
        },

        include: {
            event: {
                include: {
                    host: {
                        select: {
                            id: true,
                            email: true,
                            profile: true,
                        },
                    },
                    _count: {
                        select: {
                            participants: true,
                        },
                    },
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    return saved.map(s => s.event);
};



export const SavedEventsService = {
    toggleSaveEvent,
    getUserSavedEvents
}