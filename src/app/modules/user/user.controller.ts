import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { UserService } from "./user.service"
import { User, UserRole } from "./user.interface"
import httpStatus from "http-status";
import { IJWTPayload } from "../../types/common"


const createUser = catchAsync(async (req: Request, res: Response) => {
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
        message: "My profile data fetched!",
        data: result
    })
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {

    const role = req.query.role as UserRole
    const result = await UserService.getAllUsers(role);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users fetched successfully",
        data: result
    })
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {

    const userId = req.query.id as UserRole
    const result = await UserService.getSingleUser(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User fetched successfully",
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

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {

    const userId = req.params.id
    const {status} = req.body
    const result = await UserService.changeUserStatus(userId, status);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User status updated successfully",
        data: result
    })
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {

    const userId = req.params.id
    const {role} = req.body
    const result = await UserService.changeUserRole(userId, role);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User role updated successfully",
        data: result
    })
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {

    const userId = req.params.id
    const result = await UserService.deleteUser(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User deleted successfully",
        data: result
    })
});

export const UserController = {
    createUser,
    myProfile,
    getAllUsers,
    updateProfile,
    changeUserStatus,
    changeUserRole,
    deleteUser,
    getSingleUser
}