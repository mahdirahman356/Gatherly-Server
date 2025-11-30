import { Request } from "express";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../lib/prisma";
import { fileUploader } from "../../helper/fileUploader";

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

const deleteEvent = async (user: IJWTPayload, req: Request) => {
    const { id } = req.params; 

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    const existingEvent = await prisma.event.findUniqueOrThrow({
        where: { id },
    });

 
    if (existingEvent.hostId !== userInfo.id) {
        throw new Error("You are not allowed to delete this event");
    }

    if (existingEvent.status === "COMPLETED") {
        throw new Error("Completed events cannot be deleted");
    }

    // await prisma.participant.deleteMany({
    //     where: { eventId: id },
    // });

    const deletedEvent = await prisma.event.delete({
        where: { id },
    });

    return deletedEvent;

}

export const EventService = {
    createEvent,
    updateEvent,
    deleteEvent
}