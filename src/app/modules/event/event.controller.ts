import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import httpStatus from "http-status";
import { EventService } from "./event.service";
import { IJWTPayload } from "../../types/common";


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
    getAllEvents,
    deleteEvent
}