import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
// import Attendance from './models/attendance.js';
import EmployeeUpload from "./models/excelUpload.js";
import { read, utils } from "xlsx";
// import Employee from './models/excelUpload.js';

import moment from "moment";

import express from "express";
const app = express();

const port = process.env.PORT || 5001;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URI = process.env.ATLAS_URI;

mongoose.connect(
  URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to MongoDB Atlas !!!");
  }
);

app.use(cors());
app.use(express.json({ limit: "5000mb" })); // adjust the limit as needed
app.use(cookieParser());
app.use(express.urlencoded({ limit: "5000mb", extended: false })); // adjust the limit as needed

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

// For Routing Purpose
import User from "./routes/user.js";
import Analyst from "./routes/analyst.js";
import Attendance from "./routes/attendance.js";
import Billing from "./routes/billing.js";
import Team from "./routes/team.js";
import Task from "./routes/task.js";
import AllEmployee from "./routes/allEmployees.js";
// For Routers
app.use("/authentication/user", User);
app.use("/analyst", Analyst);
app.use("/emp-attendance", Attendance);
app.use("/billing", Billing);
app.use("/team", Team);
app.use("/create", Task);
app.use("/allemp", AllEmployee);

// To run on AWS Lambda, listen on the Lambda handler instead of a port
export const handler = async (event, context) => {
  await app.listen(process.env.PORT);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Server running on Lambda",
    }),
  };
};



//    For build
app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
