import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { UserService } from "./user.service"
import { User } from "./user.interface"


const createUser = catchAsync( async (req: Request, res: Response) => {
        const result = await UserService.createUser(req)
        
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User created successfully",
            data: result
        })
})

export const UserController = {
    createUser
}