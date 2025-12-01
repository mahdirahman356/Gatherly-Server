import express, { NextFunction, Request, Response } from 'express'
import { EventController } from './event.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.interface';
import { EventValidation } from './event.validation';
import { fileUploader } from '../../helper/fileUploader';

const router = express.Router();

router.post(
    "/",
    auth(UserRole.HOST),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        console.log(JSON.parse(req.body.data))
        req.body = EventValidation.createEventSchema.parse(JSON.parse(req.body.data))
        return EventController.createEvent(req, res, next)
    }
)

router.patch(
    "/update-event/:id",
    auth(UserRole.HOST),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        console.log(JSON.parse(req.body.data))
        req.body = EventValidation.updateEventSchema.parse(JSON.parse(req.body.data))
        return EventController.updateEvent(req, res, next)
    }
)

router.get(
    "/",
    EventController.getAllEvents
)

router.post(
    "/:id/join",
    auth(UserRole.USER),
    EventController.joinEvent
)

router.delete(
    "/:id",
    auth(UserRole.HOST),
    EventController.deleteEvent
)


export const EventRoutes = router;