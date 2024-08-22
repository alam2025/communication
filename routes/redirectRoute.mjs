import { Router } from "express";
import { redirectUrlAfterAuth } from "../controllers/gmailController.mjs";

const redirectRouter = Router();

redirectRouter.route("/").get(redirectUrlAfterAuth);

export default redirectRouter;
