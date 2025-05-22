import express from "express";
import orderController from "../controller/orderController.js";

import upload from "../middleware/multer.js";


const { createOrder,deleteOrder,getByUserId,getOrder,getOrderById,updateOrder} = orderController;

const router = express.Router();

router.get("/", getOrder);
router.get("/:order_id", getOrderById);
router.get("/user/:users_id", getByUserId);
router.post("/",upload, createOrder);
router.put("/:order_id",upload, updateOrder);
router.delete("/:order_id", deleteOrder);

export default router;
