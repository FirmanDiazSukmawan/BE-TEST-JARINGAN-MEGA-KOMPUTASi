import express from "express";
import userController from "../controller/userController.js";


import upload from "../middleware/multer.js";
import multer from "multer";
const reqFormData = multer();

const { getUser, getUserById, createUser, loginUser, updateUser, deleteUser } = userController;

const router = express.Router();

router.get("/", getUser);
router.get("/:user_id", getUserById);
router.post("/login", loginUser);
router.post("/", createUser);
router.put("/:user_id", reqFormData.none(), updateUser);
router.delete("/:user_id", deleteUser);

export default router;
