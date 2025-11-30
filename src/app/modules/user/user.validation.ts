import { z } from "zod";

const createUser = z.object({
    body: z.object({
        fullName: z.string({
            error: "Name is required!",
        }),
        email: z.string({
            error: "Email is required!",
        }),
        password: z.string({
            error: "Password is required!",
        }),
        location: z.string({
            error: "Location is required!",
        }),
    }),
});

export const UserValidation = {
    createUser,
};
