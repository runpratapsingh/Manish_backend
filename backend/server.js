const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files like thankyou.html

// Google Sheets Auth
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = "1o4hoqm7UCDwB4oEUPYPf4KJk69V6LozRb_SoOfHfP0I"; // Your Google Sheet ID

// POST /register route
app.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneCode,
    phoneNumber,
    jobRole,
    companyName,
    country,
  } = req.body;

  const phone = `${phoneCode} ${phoneNumber}`;

  try {
    // 1. Append data to Google Sheet
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [
          [firstName, lastName, email, phone, jobRole, companyName, country],
        ],
      },
    });

    // 2. Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "manish610kumar@gmail.com", // ✅ Your Gmail
        pass: "huom nmfa jgmg hepv", // ✅ Your App Password from Google
      },
    });

    const mailOptions = {
      from: '"Dairy Webinar" <manish.sharma@prudencesoftech.com>', // ✅ Must match the auth user
      to: email,
      subject: "Webinar Registration Confirmation",
      html: `
        <p>Hi ${firstName},</p>
        <p>Thank you for registering for our webinar:</p>
        <strong>Revolutionize Your Dairy Operations with Navfarm & Microsoft Dynamics 365</strong><br><br>
        📅 <strong>Date:</strong> May 07, 2025<br>
        ⏰ <strong>Time:</strong> 9:00 – 10:30 AM IST<br><br>
        🔗 <strong>Join here:</strong> <a href="https://teams.microsoft.com/l/meetup-join/your-link">Click to Join</a><br><br>
        Best Regards,<br>
        <strong>Prudence Team</strong>
      `,
    };

    await transporter.sendMail(mailOptions);

    // 3. Tell frontend to redirect
    res.status(200).json({ redirect: "/thankyou" });
  } catch (error) {
    console.error("❌ Registration failed:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Route for thankyou.html
app.get("/thankyou", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "thankyou.html"));
});
app.get("/arun", (req, res) => {
  // res.sendFile(path.join(__dirname, "public", "thankyou.html"));
  res.json({
    name: "Arun pratap singh",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
