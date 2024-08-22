import { Router } from "express";
import { authGoogle } from "../controllers/gmailController.mjs";

const gmailRouter = Router();

gmailRouter.route("/google").get(authGoogle);

export default gmailRouter;
