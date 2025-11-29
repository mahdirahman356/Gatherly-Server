import { UserStatus } from "@prisma/client"
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { prisma } from "../../lib/prisma";
import { jwtHelper } from "../../helper/jwtHelper";

const login = async (payload: { email: string, password: string }) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
        }
    })

    const isCorrectPassword = await bcrypt.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new Error("Password is incorrect!")
    }

    const accessToken = jwtHelper.generateToken({ email: user.email, role: user.role }, "abcd", "1h");

    return {
        accessToken,
    }
}

export const AuthService = {
    login
}