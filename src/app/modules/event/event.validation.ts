import { z } from "zod";

const createEventSchema = z.object({
    title: z
    .string({error: "Title is required"}).min(3, "Title must be at least 3 characters"),

    type: z
    .string({error: "Event type is required"}).min(2, "Type must be at least 2 characters"),

    description: z
    .string({error: "Description is required"}).min(10, "Description is too short"),

    date: z
    .string({error: "Date is required"}).datetime("Invalid date format"),

    location: z
    .string({error: "Location is required"}).min(3, "Location must be at least 3 characters"),

    minParticipants: z
    .number().int().min(1).optional(),

    maxParticipants: z
    .number().int().min(1, "Max participants required"),

    joiningFee: z
    .number().int().min(0).optional(),
});

const updateEventSchema = z.object({
    title: z
    .string().min(3, "Title must be at least 3 characters")
    .optional(),

    type: z
    .string().min(2, "Type must be at least 2 characters")
    .optional(),

    description: z
    .string().min(10, "Description is too short").optional(),

    date: z
    .string("Invalid date format").datetime().optional(),

    location: z
    .string().min(3, "Location must be at least 3 characters")
    .optional(),

    minParticipants: z
    .number().int().min(1).optional(),

    maxParticipants: z
    .number().int().min(1).optional(),

    joiningFee: z
    .number().int().min(0).optional(),

    status: z
    .enum(["OPEN", "FULL", "CANCELLED", "COMPLETED"]).optional(),
});

export const EventValidation = {
    createEventSchema,
    updateEventSchema
}

