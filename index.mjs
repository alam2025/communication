import express from "express";
import dotenv from "dotenv";
import db from "./config/db.mjs";
import errorHandler from "./utils/errorHandler.mjs";
import userRouter from "./routes/userRoutes.mjs";
import session from "express-session";
import { google } from "googleapis";
import querystring from "querystring";

import sequelize from "./sequelize.mjs";

import { routes } from "./routes.mjs";
import axios from "axios";

dotenv.config();

export const app = express();
const PORT = process.env.PORT;

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Database connected successfully");
});

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Sequelize
// sequelize.sync({ alter: true }).then(() => {
//   console.log("Database & tables created!");
// });

export const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

routes();

const CLIENT_ID =
  "dj0yJmk9a3VZbHU1cXZNc2ZHJmQ9WVdrOWRHTTFOamxhVG00bWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWJi";
const CLIENT_SECRET = "faf395a87602c161ebd35d85cc419919d0c94d74";
const REDIRECT_URI = "http://localhost:5000/";

// Yahoo's OAuth 2.0 endpoints
const AUTHORIZATION_URL = "https://api.login.yahoo.com/oauth2/request_auth";
const TOKEN_URL = "https://api.login.yahoo.com/oauth2/get_token";

// Step 1: Redirect to Yahoo's authorization endpoint
app.get("/auth/yahoo", (req, res) => {
  const params = querystring.stringify({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "mail-r", // Read-only access to Yahoo Mail
  });

  res.redirect(`${AUTHORIZATION_URL}?${params}`);
});

// Step 2: Handle the OAuth 2.0 callback from Yahoo
app.get("/redirect", async (req, res) => {
  console.log("asdfas");

  const { code } = req.query;

  try {
    // Exchange the authorization code for an access token
    const response = await axios.post(
      TOKEN_URL,
      querystring.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token } = response.data;

    // Use the access token to fetch Yahoo Mail data
    const emailResponse = await axios.get(
      "https://api.yahoo.com/user/{user_id}/profile",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    console.log(emailResponse.data);

    // Replace with actual API call to fetch emails if available
    res.json(emailResponse.data);
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    res.status(500).send("Authentication failed");
  }
});
// users
app.use("/api/users", userRouter);

app.use("/", async (req, res) => {
  res.send("App is running");
});

app.use(errorHandler);

// Start the server

app.listen(PORT, () => console.log(`Server running `));
