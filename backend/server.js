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

const GOOGLE_CREDENTIALS = {
  type: "service_account",
  project_id: "dairy-webinar",
  private_key_id: "4bb7765c07dbe317bc5879feee7913b8ef54f86d",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC1XrzxxIpxfzbv\nVKXn87nReD1Drx6NLjtSNasdcZLnbpSwXQuwoheuqRXvTSasvFjhFOwN26VHrxhH\nSjvH5+cGNmK7tZexIyCaimCuR436KfS3y/f4FNdri3xdLMH3mVS+HGPbfnmPEhtB\nHVBsyJu7l7uxNetAf4AlB/iSQ/GUVsBePp9WscN2j7wIWfoSBpIrtcraTDWhQle2\n81zM7NuzC0BsR2ZkdUNLsP1G4YEvt8XPf0VfEpB5Ubjf02mjlgaSgAbf+8Sx6PlD\nTV+rFIZkc+t53JEZnRRyAhQul0rLAh/VxYncayceSCX5pf1eHbtEf78+zx7l22Fn\nO46zaOxnAgMBAAECggEAHbp1zEfTt3nLe9w18M34Jxex1w51EAgZbMa45wkZiWS3\nQNc81iAjiJtU1JYioOKjIOBTNuGfTEoszRajs4cqoiU3oXPzoB3VYhoMxymZtye5\ntzIFfFI84yGzFKSu9dIvW+qptYMcErGRlRE51bLmJTq1kaejCWiSDRUq5HKi6OuD\ngRHO/K/Oyn26Dz60A07xj6DV9jZRBUJWxp+LZkNSIK2djTOMmetgOwVp6+fViNfg\nRUEPeacX+WOu9ViOb4TWzE0G33SBIA/1gVUA2HWIFw2hafp1P1MDA+AiNC7gGQK9\n9nJRSjJ72Cf9Kh0Aw50DcWNJnquNnLL3ROBwJYLvLQKBgQDyoxjJb1KxYssrr5uG\nYiXOksO8sAelHvEd8BnhrlK2LjhstuOoiz4yTp1IS4QtisV+GTLqnJuPIb4JhGa1\nL8gJbB49hgyG8X4g40irPsxNAD/Qs9KcbXSk//sptMewfbpTSMRgyZB1sFbV0Auj\ngI+SwY5OXYI/JQ3MjnfvT/aTuwKBgQC/W9jKobadkRSWlUwLI4U/OH+orKBfgY7b\nS18woqd3hsKPhAAy66xJ/txjTOW2/Sf8Oi5LNmodCt01Tuy8ZPOA9CJDlB8i4182\nw5TaKzCXHS9Wz14wq0coYQ8+OjgatS5O3zErwyPSjTmnRYBesELgs7+Gq70/dCXT\nWiKuZDghRQKBgCAsRDMhkcN3qB0I0gSFqyGzEEVKyhi4+5vOpH/qT4lco5q2vYUx\nwXOGPRDDAqnPRtSrnrbBQVc/UCWO6teHmGy3a2MZDTwvdVwDBzW9w/VJ3SxdS8X2\nNYtTbghfskLSyQwWEAQNdhxE357GUWTCvUbmZ2o4t/aLgULoeTrATZ/VAoGAb4bk\nTxT5DdRkn27cJxHIsxQGsxQJVCB6Vi0TiZEC8ZLFCkfwpbzdaTL015sVtxTMnSB7\norJQHiUaz9rz9skPcnTXE3PcwcSq1Ywf0Rei9i+4S2wIhW0Nx+bpr2bXFBnMp4NF\ncTAGTMyqcWb8bjNkhvm8Ao1NexICia/azrDyVdECgYAWmrvf6uV8HiZ+1NyiKr2v\nt2PyqHg+U52yzB3ZQx3fBnpPupwcQpAFc1bGdNHDu5Bf5rMci8gv0QUUPEyFdpMl\n6TgBsuBW9MD9JjWCaSfLX4aVLNxyu8uOwU77kFGiM31QYMabf1vkt94t7i/VF5lK\nVfCvtF0hjF2ej/QTAherhA==\n-----END PRIVATE KEY-----\n",
  client_email: "manish@dairy-webinar.iam.gserviceaccount.com",
  client_id: "107056761710591928577",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/manish%40dairy-webinar.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

// Google Sheets Auth
const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = "1o4hoqm7UCDwB4oEUPYPf4KJk69V6LozRb_SoOfHfP0I"; // Your Google Sheet ID

// Route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

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
    res.status(500).json({ error: error || "Registration failed why ?" });
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
