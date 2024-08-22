import { Router } from "express";
import { getMessages } from "../controllers/whatsappController.mjs";

const getMessageRouter = Router();

getMessageRouter.route("/").get(getMessages);

export default getMessageRouter;
