import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { EventRoutes } from '../modules/event/event.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { savedEventsRoutes } from '../modules/savedEvents/saved.events.routes';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/event',
        route: EventRoutes
    },
    {
        path: '/review',
        route: ReviewRoutes
    },
    {
        path: '/event/saved',
        route: savedEventsRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;