import { Request } from "express";
import { User, UserRole } from "./user.interface";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { prisma } from "../../lib/prisma";
import { IJWTPayload } from "../../types/common";
import { fileUploader } from "../../helper/fileUploader";

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


export const UserService = {
    createUser,
    myProfile,
    updateProfile
}