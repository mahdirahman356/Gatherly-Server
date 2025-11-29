import { Request } from "express";
import { User, UserRole } from "./user.interface";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { prisma } from "../../lib/prisma";

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

export const UserService = {
    createUser
}