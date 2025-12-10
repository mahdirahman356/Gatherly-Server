import express from 'express'
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.interface';
import { SavedEventsController } from './saved.events.controller';

const router = express.Router();

router.post(
    "/:id",
    auth(UserRole.USER),
    SavedEventsController.toggleSaveEvent);

router.get("/my-saved-events",
    auth(UserRole.USER),
    SavedEventsController.getSavedEvents);


export const savedEventsRoutes = router;