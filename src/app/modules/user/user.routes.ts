import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import { UserRole } from './user.interface';
import { fileUploader } from '../../helper/fileUploader';

const router = express.Router();

router.post(
    "/",
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
)

router.get(
    "/my-profile",
    auth(UserRole.USER, UserRole.HOST, UserRole.ADMIN),
    UserController.myProfile
);

router.get(
    "/",
    auth(UserRole.ADMIN),
    UserController.getAllUsers
);

router.patch(
    "/update-profile",
    auth(UserRole.USER),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body?.data) {
            req.body = UserValidation.updateUserZodSchema.parse(JSON.parse(req.body.data))
        }
        return UserController.updateProfile(req, res, next)
    }
);



export const UserRoutes = router;