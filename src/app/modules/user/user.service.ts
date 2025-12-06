import { Request } from "express";
import { User, UserRole } from "./user.interface";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { prisma } from "../../lib/prisma";
import { IJWTPayload } from "../../types/common";
import { fileUploader } from "../../helper/fileUploader";
import ApiError from "../../errors/ApiError";
import { UserStatus } from "@prisma/client";

const createUser = async (req: Request) => {

    const { email, password, fullName, location } = req.body;

    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt.salt_round)
    );

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                role: UserRole.USER,
            },
        });

        await tx.profile.create({
            data: {
                fullName,
                location,
                userId: user.id,
            },
        });

        return user;
    });

    return result;
};

const myProfile = async (user: IJWTPayload) => {

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
        },
        select: {
            id: true,
            email: true,
            role: true,
            profile: {
                select: {
                    fullName: true,
                    image: true,
                    bio: true,
                    interests: true,
                    location: true
                }
            }
        }
    });

    return userInfo;

};

const getAllUsers = async (role: UserRole) => {

    const users = await prisma.user.findMany({
        where: role ? { role } : undefined,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            profile: true,

            _count: {
                select: {
                    events: true,
                },
            },
        },
    });

    const result = users.map(({ _count, role, ...user }) => ({
        ...user,
        role,
        ...(role === "HOST" && {
            eventsCount: _count.events,
        }),
    }));

    return result;

};

const getSingleUser = async (userId: string) => {
    const result = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            profile: true,
            events: true
        },
    });

    if (!result || result.role === "ADMIN") {
        throw new Error("User not found");
    }

    return result;
};

const updateProfile = async (user: IJWTPayload, req: Request) => {

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });


    if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file);

        if (!uploadResult?.secure_url) {
            throw new Error("Image upload failed");
        }

        req.body.image = uploadResult.secure_url;
    }

    const profileInfo = await prisma.profile.upsert({
        where: {
            userId: userInfo.id,
        },
        update: req.body,
        create: {
            userId: userInfo.id,
            ...req.body,
        },
    });

    return profileInfo;
};

const changeUserStatus = async (userId: string, status: UserStatus) => {

    const result = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            status: status
        },
    })

    return result

};

const changeUserRole = async (userId: string, role: UserRole) => {

    const result = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            role: role
        },
    })

    return result

};

const deleteUser = async (userId: string) => {

    const result = await prisma.user.delete({
        where: {
            id: userId
        }
    })

    return result

};


export const UserService = {
    createUser,
    myProfile,
    getAllUsers,
    getSingleUser,
    updateProfile,
    changeUserStatus,
    changeUserRole,
    deleteUser
}