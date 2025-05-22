import express from "express"
import userRouter from "./usersRouter.js"
import orderRouter from "./orderRouter.js"


const router = express.Router();
router.use("/user", userRouter);
router.use("/order", orderRouter);


export default router;