import Stripe from "stripe";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
    if (event.type === "checkout.session.completed") {
        const session: any = event.data.object;

        const paymentId = session.metadata.paymentId;
        const userId = session.metadata.userId;
        const eventId = session.metadata.eventId;

        await prisma.$transaction(async (tx) => {
            //  1. Save Payment
            await tx.payment.update({
                where: {
                    id: paymentId
                },
                data: {
                    status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.FAILED,
                }
            });

            // 2. Add user as participant
            await prisma.participant.create({
                data: {
                    userId,
                    eventId,
                    paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.FAILED,
                },
            });
        });
    }

};

export const PaymentService = {
    handleStripeWebhookEvent
}