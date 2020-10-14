"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
exports.app = express_1.default();
const checkout_1 = require("./checkout");
exports.app.use(express_1.default.json());
const cors_1 = __importDefault(require("cors"));
exports.app.use(cors_1.default({ origin: true }));
// check server health
exports.app.get("/test", (req, res) => {
    res.status(200).send("API is up and running fine");
});
// catch async errors when awaiting promises
const runAsync = (callback) => {
    return (req, res, next) => {
        callback(req, res, next).catch(next);
    };
};
// checkout
exports.app.post("/checkout", runAsync(async ({ body }, res) => {
    res.send(await checkout_1.createStripeCheckoutSEssion(body.line_items));
}));
//# sourceMappingURL=api.js.map