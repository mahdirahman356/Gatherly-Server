import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { UserService } from "./user.service"
import { User } from "./user.interface"
import httpStatus from "http-status";
import { IJWTPayload } from "../../types/common"


const createUser = catchAsync( async (req: Request, res: Response) => {
        const result = await UserService.createUser(req)
        
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User created successfully",
            data: result
        })
})

const myProfile = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await UserService.myProfile(user as IJWTPayload);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My profile updated!",
        data: result
    })
});

const updateProfile = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await UserService.updateProfile(user as IJWTPayload, req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My profile updated!",
        data: result
    })
});

export const UserController = {
    createUser,
    myProfile,
    updateProfile
}