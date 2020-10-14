"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeCheckoutSEssion = void 0;
const _1 = require(".");
exports.createStripeCheckoutSEssion = async (line_items) => {
    // const url = process.env.WEBAPP_URL;
    const session = await _1.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        success_url: "https://apple-auth.herokuapp.com/",
        // `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: "https://apple-auth.herokuapp.com/",
    });
    return session;
};
//# sourceMappingURL=checkout.js.map