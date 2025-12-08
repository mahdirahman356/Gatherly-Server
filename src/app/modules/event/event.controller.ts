import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import httpStatus from "http-status";
import { EventService } from "./event.service";
import { IJWTPayload } from "../../types/common";
import { EventStatus } from "@prisma/client";


const createEvent = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await EventService.createEvent(user as IJWTPayload, req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Event created successfully",
        data: result
    })
})

const updateEvent = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await EventService.updateEvent(user as IJWTPayload, req)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Event updated successfully",
        data: result
    })
})

const changeStatus = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const eventId = req.params.id
    const { status } = req.body
    const user = req.user
    const result = await EventService.changeStatus(user as IJWTPayload, eventId as string, status as EventStatus)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Event status updated successfully",
        data: result
    })
})

const getAllEvents = catchAsync(async (req: Request, res: Response) => {

    const filters = req.query;
    const result = await EventService.getAllEvents(filters);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All event fetched successfully!",
        data: result
    })
})

const getMyHostedEvents = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await EventService.getMyHostedEvents(user as IJWTPayload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All event fetched successfully!",
        data: result
    })
})

const getAllParticipantsOfHost = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await EventService.getAllParticipantsOfHost(user as IJWTPayload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All participants of host fetched successfully!",
        data: result
    })
})

const getMyHostedEventsRevenue = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await EventService.getMyHostedEventsRevenue(user as IJWTPayload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All events revenue data fetched successfully!",
        data: result
    })
})

const joinEvent = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await EventService.joinEvent(user as IJWTPayload, req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Successfully joined the event",
        data: result
    })
})


const deleteEvent = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await EventService.deleteEvent(user as IJWTPayload, req);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Event deleted successfully!",
        data: result
    })
})


export const EventController = {
    createEvent,
    updateEvent,
    changeStatus,
    getAllEvents,
    getMyHostedEvents,
    getAllParticipantsOfHost,
    getMyHostedEventsRevenue,
    joinEvent,
    deleteEvent
}