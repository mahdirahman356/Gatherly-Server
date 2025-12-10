import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import httpStatus from "http-status";
import { IJWTPayload } from "../../types/common";
import { SavedEventsService } from "./saved.events.service";


const toggleSaveEvent = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const result = await SavedEventsService.toggleSaveEvent(req.user as IJWTPayload, req.params.id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.saved ? "Event saved" : "Event removed from saved",
        data: result
    })
})

const getSavedEvents  = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const result = await SavedEventsService.getUserSavedEvents(req.user as IJWTPayload);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Saved Events fetched successfully!",
        data: result
    })
})



export const SavedEventsController = {
   toggleSaveEvent,
   getSavedEvents
}