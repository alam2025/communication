import { htmlToText } from "html-to-text";
import Imap from "imap";
import { simpleParser } from "mailparser";

// Function to fetch emails using IMAP
export const fetchEmailsUsingImap = (req, res, next) => {
  const imap = new Imap({
    user: "alam@wooxperto.com", // Replace with your email
    password: "1OG2f%qWesuH%1!i", // Replace with your password
    host: "imap.dreamhost.com", // Outlook IMAP host
    port: 993, // IMAP over SSL port
    tls: true, // Enable TLS encryption
  });

  const emails = [];

  // Function to open the inbox
  function openInbox(cb) {
    imap.openBox("INBOX", false, cb);
  }

  // Connect to IMAP server
  imap.connect();

  // When IMAP connection is ready
  imap.once("ready", () => {
    openInbox((err, box) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Failed to open inbox",
          error: err.message,
        });
      }

      const searchCriteria = ["ALL"]; // Fetch all emails
      const fetchOptions = {
        bodies: ["HEADER.FIELDS (FROM TO SUBJECT)", "TEXT"], // Fetch the entire message including body
        struct: true, // Fetch the structure of the message
      };

      imap.search(searchCriteria, (err, results) => {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Error searching emails",
            error: err.message,
          });
        }

        if (!results.length) {
          imap.end();
          return res.status(200).json({
            status: true,
            message: "No new emails found",
            data: [],
          });
        }

        const fetch = imap.fetch(results, fetchOptions);

        fetch.on("message", (msg, seqno) => {
          let emailData = {};
          let buffer = "";

          msg.on("body", (stream) => {
            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8");
            });

            stream.once("end", async () => {
              try {
                const parsed = await simpleParser(buffer);
                emailData.msg = parsed;
                emailData.header = parsed.headers;

                
                emailData.subject = parsed.subject;
                emailData.from = parsed.from.text;
                emailData.to = parsed.to.text;
                emailData.text = htmlToText(parsed.text || "", {
                  wordwrap: 130,
                }); // Plain text body
                emailData.html = parsed.textAsHtml; // HTML body
              } catch (err) {
                console.error(`Error parsing email: ${err.message}`);
              }
            });
          });

          msg.once("attributes", (attrs) => {
            emailData.attrs = attrs;
          });

          msg.once("end", () => {
            emails.push(emailData);
          });
        });

        fetch.once("error", (err) => {
          console.error("Fetch error: " + err);
        });

        fetch.once("end", () => {
          imap.end();
          return res.status(200).json({
            status: true,
            message: "Emails fetched successfully",
            data: emails,
          });
        });
      });
    });
  });

  // Handle IMAP connection error
  imap.once("error", (err) => {
    return res.status(500).json({
      status: false,
      message: "Connection error",
      error: err.message,
    });
  });

  // Log IMAP connection end
  imap.once("end", () => {
    console.log("Connection ended");
  });
};
