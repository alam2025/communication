import { app } from "./index.mjs";
import emailRouter, { emailRouterImap } from "./routes/emailRoute.mjs";
import gmailRouter from "./routes/gmailRoutes.mjs";
import redirectRouter from "./routes/redirectRoute.mjs";
import getMessageRouter from "./routes/whatsappMessage.mjs";
export const routes = () => {
  app.use("/auth", gmailRouter);
  app.use("/oauth2callback", redirectRouter);
  app.use("/user/emails", emailRouter);
  app.use("/imap/emails", emailRouterImap);
  app.use("/whatsapp/messages", getMessageRouter);
};
