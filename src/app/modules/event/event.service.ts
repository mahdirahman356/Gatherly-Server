import { Request } from "express";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../lib/prisma";
import { fileUploader } from "../../helper/fileUploader";
import { buildEventSearchQuery, EventSearchParams } from "./event.utils";
import ApiError from "../../errors/ApiError";
import { createStripeCheckoutSession } from "../../utils/stripePayment";
import { v4 as uuidv4 } from 'uuid';
import { EventStatus, PaymentStatus } from "@prisma/client";
import { UserRole } from "../user/user.interface";
interface MyEventQuery {
  type?: "upcoming" | "past";
}


const createEvent = async (user: IJWTPayload, req: Request) => {

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const file = req.file;
    let imageUrl = "";

    if (file) {
        const upload = await fileUploader.uploadToCloudinary(file);
        if (!upload?.secure_url) {
            throw new Error("Image upload failed");
        }
        imageUrl = upload.secure_url;
    }

    const {
        title,
        type,
        description,
        date,
        location,
        minParticipants = 1,
        maxParticipants,
        joiningFee = 0,
    } = req.body;

    if (minParticipants > maxParticipants) {
        throw new Error("Minimum participants cannot be greater than maximum");
    }


    const event = await prisma.event.create({
        data: {
            title,
            type,
            description,
            date: new Date(date),
            location,
            image: imageUrl,

            minParticipants: Number(minParticipants),
            maxParticipants: Number(maxParticipants),
            joiningFee: Number(joiningFee),

            status: "OPEN",
            hostId: userInfo.id,
        },
    });

    return event
};

const updateEvent = async (user: IJWTPayload, req: Request) => {

    const { id } = req.params;
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const existingEvent = await prisma.event.findUniqueOrThrow({
        where: { id },
    });

    if (existingEvent.hostId !== userInfo.id) {
        throw new Error("You are not allowed to update this event");
    }

    const file = req.file;
    let imageUrl = existingEvent.image;

    if (file) {
        const upload = await fileUploader.uploadToCloudinary(file);
        if (!upload?.secure_url) {
            throw new Error("Image upload failed");
        }
        imageUrl = upload.secure_url;
    }

    const {
        title,
        type,
        description,
        date,
        location,
        minParticipants,
        maxParticipants,
        joiningFee,
        status,
    } = req.body;

    if (Number(minParticipants) > Number(maxParticipants)) {
        throw new Error("Minimum participants cannot be greater than maximum");
    }

    if (existingEvent.status === "COMPLETED") {
        throw new Error("Completed event status cannot be changed");

    }

    const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
            title,
            type,
            description,
            location,
            status,
            image: imageUrl,
            date: date ? new Date(date) : undefined,
            minParticipants: Number(minParticipants),
            maxParticipants: Number(maxParticipants),
            joiningFee: Number(joiningFee),
        },
    });

    return updatedEvent;


};

const changeStatus = async (user: IJWTPayload, eventId: string, status: EventStatus) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const existingEvent = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!existingEvent) {
        throw new Error("Event not found");
    }

    if (existingEvent.hostId !== userInfo.id &&
        userInfo.role !== UserRole.ADMIN) {
        throw new Error("You are not allowed to update this event status");
    }

    if (existingEvent.status === EventStatus.COMPLETED) {
        throw new Error("Completed event status cannot be changed");
    }

    const result = await prisma.event.update({
        where: { id: eventId },
        data: {
            status,
        },
    });

    return result;


};

const getAllEvents = async (query: EventSearchParams) => {
    const where = buildEventSearchQuery(query);

    console.log(query)

    const events = await prisma.event.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
        include: {

            host: {
                select: {
                    id: true,
                    email: true,
                    profile: {
                        select: {
                            fullName: true,
                            image: true
                        }
                    }
                },
            },
            _count: {
                select: {
                    participants: true,
                },
            }
        },

    });

    return events;
}

const getEventDetails = async (eventId: string) => {
    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
        include: {
            host: {
                select: {
                    id: true,
                    email: true,
                    profile: {
                        select: {
                            fullName: true,
                            image: true,
                        },
                    },
                },
            },

            participants: {
                select: {
                    id: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            profile: {
                                select: {
                                    fullName: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            },

            _count: {
                select: {
                    participants: true,
                },
            },

            reviews: true
        },
    });

    if (!event) {
        throw new Error("Event not found");
    }

    return event;
}

const getUserEvents = async (user: IJWTPayload, query: MyEventQuery) => {

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const today = new Date();

    let dateFilter = {};

    if (query.type === "past") {
        dateFilter = {
            lt: today,
        };
    } else {
        dateFilter = {
            gte: today,
        };
    }

    const upcomingEvents = await prisma.participant.findMany({
        where: {
            userId: userInfo.id,

            event: {
                date: dateFilter,
            },

            OR: [
                { paymentStatus: "FREE" },
                { paymentStatus: "PAID" },
            ],
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
            event: {
                date: "asc",
            },
        },
    });
    return upcomingEvents.map(p => p.event);
}

const getMyHostedEvents = async (user: IJWTPayload) => {

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    console.log("id", userInfo.id)

    const events = await prisma.event.findMany({
        where: {
            hostId: userInfo.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            host: {
                select: {
                    id: true,
                    email: true,
                    profile: {
                        select: {
                            fullName: true,
                            image: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    participants: true,
                },
            },
        },
    });

    return events;

}

const getAllParticipantsOfHost = async (user: IJWTPayload) => {

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const participants = await prisma.participant.findMany({
        where: {
            event: {
                hostId: userInfo.id,
            },
        },
        include: {
            user: {
                select: {
                    profile: {
                        select: {
                            fullName: true,
                            image: true,
                            location: true
                        }
                    }
                },
            },
            event: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    image: true,
                    date: true,
                    status: true
                },
            },
        },
        orderBy: {
            joinedAt: "desc",
        },
    });

    return participants;

}

const getMyHostedEventsRevenue = async (user: IJWTPayload) => {

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const events = await prisma.event.findMany({
        where: { hostId: userInfo.id },
        select: {
            id: true,
            title: true,
            type: true,
            image: true,
            date: true,
            status: true,
            joiningFee: true,
            participants: {
                where: { paymentStatus: "PAID" },
                select: { id: true },
            },
        },
    });

    const revenueData = events.map((event) => {
        const participantsCount = event.participants.length;
        const pricePerPerson = event.joiningFee || 0;
        const totalRevenue = participantsCount * pricePerPerson;

        return {
            eventId: event.id,
            eventTitle: event.title,
            eventType: event.type,
            eventImage: event.image,
            eventStatus: event.status,
            eventDate: event.date,
            participantsCount,
            pricePerPerson,
            totalRevenue,
        };
    });

    const totalRevenue = revenueData.reduce((sum, e) => sum + e.totalRevenue, 0);

    return { revenueData, totalRevenue };

}

const joinEvent = async (user: IJWTPayload, req: Request) => {
    const eventId = req.params.id
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    const userId = userInfo.id

    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    if (event.status !== "OPEN") {
        throw new ApiError(400, "This event is not open for joining");
    }

    const alreadyJoined = await prisma.participant.findUnique({
        where: {
            userId_eventId: {
                userId,
                eventId,
            },
        },
    });

    if (alreadyJoined) {
        throw new ApiError(400, "You already joined this event");
    }

    const totalParticipants = await prisma.participant.count({
        where: { eventId },
    });

    if (
        event.maxParticipants &&
        totalParticipants >= event.maxParticipants
    ) {
        throw new ApiError(400, "Event is already full");
    }

    if (event.joiningFee && event.joiningFee > 0) {

        const existingPayment = await prisma.payment.findFirst({
            where: {
                userId,
                eventId,
                status: PaymentStatus.PENDING
            }
        });

        if (existingPayment) {
            throw new ApiError(400, "Payment already initiated for this event");
        }

        const transactionId = uuidv4();
        const paymentData = await prisma.payment.create({
            data: {
                eventId: event.id,
                userId: userId,
                hostId: event.hostId,
                amount: event.joiningFee,
                transactionId
            }
        })
        const session = await createStripeCheckoutSession({
            amount: event.joiningFee,
            paymentId: paymentData.id,
            eventTitle: event.title,
            userId,
            eventId,
            successUrl: `http://localhost:3000/dashboard/upcoming?payment=success&eventId=${event.id}`,
            cancelUrl: `http://localhost:3000/event/${event.id}`,
        });

        return {
            paymentUrl: session.url,
        };

    }

    const participant = await prisma.participant.create({
        data: {
            userId,
            eventId,
            paymentStatus: "FREE",
        },
        include: {
            user: true,
            event: true,
        },
    });

    return participant;
};

const deleteEvent = async (user: IJWTPayload, req: Request) => {
    const { id } = req.params;

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const existingEvent = await prisma.event.findUniqueOrThrow({
        where: { id },
    });


    if (existingEvent.hostId !== userInfo.id &&
        userInfo.role !== UserRole.ADMIN) {
        throw new Error("You are not allowed to delete this event");
    }

    if (existingEvent.status === "COMPLETED") {
        throw new Error("Completed events cannot be deleted");
    }

    await prisma.participant.deleteMany({
        where: { eventId: id },
    });

    const deletedEvent = await prisma.event.delete({
        where: { id },
    });

    return deletedEvent;

}

export const EventService = {
    createEvent,
    updateEvent,
    changeStatus,
    getAllEvents,
    getEventDetails,
    getUserEvents,
    getMyHostedEvents,
    getAllParticipantsOfHost,
    getMyHostedEventsRevenue,
    joinEvent,
    deleteEvent
}