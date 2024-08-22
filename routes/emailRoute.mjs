import { Router } from "express";
import { userEmails } from "../controllers/gmailController.mjs";
import isAuthenticated from "../middleware/isAuthenticated.mjs";
import { fetchEmailsUsingImap } from "../controllers/emailUsingImapController.mjs";

const emailRouter = Router();
export const emailRouterImap = Router();

emailRouter.route("/").get(isAuthenticated, userEmails);
emailRouterImap.route("/").get(fetchEmailsUsingImap);

export default emailRouter;
