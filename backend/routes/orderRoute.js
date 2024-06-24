import express from "express"
import authMiddleware from "../middleware/auth.js"
import { listOrder, orderDetails, placeOrder, stripeCheckout, updateStatus, userOrders, verifyOrder } from "../controllers/ordercontroller.js";

const orderRouter = express.Router();


orderRouter.post("/place", authMiddleware, placeOrder)
orderRouter.post("/verify", verifyOrder)
orderRouter.post("/userorders", authMiddleware, userOrders)
orderRouter.get("/list", listOrder)
orderRouter.post("/status", updateStatus)
orderRouter.post('/webhook', express.raw({type: 'application/json'}), stripeCheckout)
orderRouter.get("/orderDetais", orderDetails)


export default orderRouter;