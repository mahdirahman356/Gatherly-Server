import bcrypt from "bcryptjs";
import jwt, { Secret } from 'jsonwebtoken'
import { prisma } from "../../lib/prisma";
import { jwtHelper } from "../../helper/jwtHelper";
import config from "../../../config";

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

    const accessToken = jwtHelper.generateToken(
        {
            email: user.email,
            role: user.role
        },
        config.jwt.access_token_secret as Secret,
        config.jwt.access_token_expires as string
    );

    return {
        accessToken,
    }
}

export const AuthService = {
    login
}