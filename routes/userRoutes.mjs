import { Router } from "express";
import { createUser, getUsers } from "../controllers/userController.mjs";

const userRouter = Router();

userRouter.route("/").get(getUsers).post(createUser);

export default userRouter;
