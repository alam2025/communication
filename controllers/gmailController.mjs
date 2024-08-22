import { google } from "googleapis";
import { oAuth2Client } from "../index.mjs";
import Token from "../models/Token.mjs";
import User from "../models/User.mjs";

export const authGoogle = (req, res, next) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });
  res.redirect(authUrl);
};

export const redirectUrlAfterAuth = async (req, res, next) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Check if user exists
    let user = await User.findOne({ where: { googleId: userInfo.data.id } });

    if (!user) {
      user = await User.create({
        email: userInfo.data.email,
        googleId: userInfo.data.id,
      });
    }

    // Upsert tokens
    const existingToken = await Token.findOne({ where: { user_id: user.id } });
    if (existingToken) {
      await existingToken.update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
      });
    } else {
      await Token.create({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
        user_id: user.id,
      });
    }

    req.session.userId = user.id;
    res.redirect("/user/emails");
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    res.status(500).send("Authentication failed");
  }
};

export const userEmails = async (req, res, next) => {
  // Fetch emails

  try {
    // const user = await User.findByPk(req.session.userId, {
    //   include: [Token],
    // });
    const user = await Token.findOne({
      where: { user_id: 1 },
    });
    // const userWithTokens = await User.findOne({
    //   where: { id: req.session.userId },
    //   include: [Token], // This will include the associated tokens
    // });

    oAuth2Client.setCredentials({
      access_token: user.access_token,
      refresh_token: user.refresh_token,
      scope: user.scope,
      token_type: user.token_type,
      expiry_date: user.expiry_date,
    });

    // Refresh the access token if expired
    if (oAuth2Client.isTokenExpiring()) {
      const newTokens = await oAuth2Client.getAccessToken();
      await user.update({
        access_token: newTokens.token,
        expiry_date: newTokens.res.data.expiry_date,
      });
    }

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
    });

    const messages = response.data.messages;

    if (!messages || messages.length === 0) {
      return res.send("No emails found.");
    }

    const emails = [];
    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });
      console.log(msg.data);

      const subjectHeader = msg.data.payload.headers.find(
        (header) => header.name === "Subject"
      );
      const fromHeader = msg.data.payload.headers.find(
        (header) => header.name === "From"
      );

      emails.push({
        id: msg.data.id,
        snippet: msg.data.snippet,
        subject: subjectHeader ? subjectHeader.value : "No Subject",
        from: fromHeader ? fromHeader.value : "Unknown Sender",
      });
    }

    res.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).send("Error fetching emails");
  }
};
