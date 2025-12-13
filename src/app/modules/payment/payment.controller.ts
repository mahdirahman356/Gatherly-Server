import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";
import { stripe } from "../../helper/stripe";
import config from "../../../config";

const handleStripeWebhookEvent = async (req: Request, res: Response) => {

    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, config.webhook_secret_key as string);
    } catch (err: any) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    await PaymentService.handleStripeWebhookEvent(event);

    res.status(200).json({ received: true });

};

export const PaymentController = {
    handleStripeWebhookEvent
}