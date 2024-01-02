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
// import express from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Key from "./config/key.js";
// // import passport from 'passport' ;
// import dotenv from 'dotenv';
import nodemailer from "nodemailer";
import crypto from "crypto";
import loginValidate from "./validation/login.js";
import registerValidate from "./validation/register.js";
import LastLogin from "./models/LastLogin.js";
// import User from './models/user.model.js'
import Employee from "./models/excelUpload.js";
import User from "./models/user.model.js"; 
import serverless from "serverless-http";
import moment from "moment";
import express from "express";


const router = express.Router();
const app = express();
// const express = require("express");
// const serverless = require("serverless-http");

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
mongoose.set('strictQuery', false);

app.use(cors());
app.use(express.json({ limit: "5000mb" })); // adjust the limit as needed
app.use(cookieParser());
app.use(express.urlencoded({ limit: "5000mb", extended: false })); // adjust the limit as needed

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

// For Routing Purpose
// import User from "./routes/user.js";
import Analyst from "./routes/analyst.js";
import Attendance from "./routes/attendance.js";
import Billing from "./routes/billing.js";
import Team from "./routes/team.js";
import Task from "./routes/task.js";
import AllEmployee from "./routes/allEmployees.js";
// For Routers
// app.use("/authentication/user", User);
// app.use("/analyst", Analyst);
// app.use("/emp-attendance", Attendance);
// app.use("/billing", Billing);
// app.use("/team", Team);
// app.use("/create", Task);
// app.use("/allemp", AllEmployee);

// To run on AWS Lambda, listen on the Lambda handler instead of a port
// Export the handler for AWS Lambda

 
const determineRoleFromDesignation = (designation) => {

  const adminDesignations = ["PROJECT MANAGER"];
  const superAdminDesignation = "SUPERADMIN";

  if (adminDesignations.includes(designation.toUpperCase())) {
    return "admin";
  } else if (designation.toUpperCase() === superAdminDesignation) {
    return "superadmin";
  } else {
    return "analyst";
  }
};
// export const handler = async (event, context) => {
//   try {
app.post("/register", async (req, res) => {
  try {
    const { errors, isValid } = registerValidate(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Check if the email already exists in the user database
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ emailAlready: "Email already exists" });
    }

    // Check if the email exists in the employee database
    const existingEmployee = await Employee.findOne({
      email_id: req.body.email,
    });

    if (!existingEmployee) {
      return res
        .status(400)
        .json({ emailNotFound: "Email not found in employee database" });
    }

    // Determine the role based on the employee's designation
    const role = determineRoleFromDesignation(existingEmployee.designation);

    // Proceed with user registration
    const newUser = new User({
      name: req.body.name,
      empId: req.body.empId,
      role: role,
      email: req.body.email,
      password: req.body.password,
    });

    // Hash the password before saving it to the database
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, async (err, hash) => {
        if (err) {
          console.log(err);
          throw err;
        }
        newUser.password = hash;

        // Save the new user to the user database
        try {
          const savedUser = await newUser.save();
          res.json(savedUser);
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Internal server error" });
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//   const LastLogin = require('../models/LastLogin');

app.post("/login", async (req, res) => {
  try {
    const { errors, isValid } = loginValidate(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Check if it's the superadmin login
    if (
      email === "superadmin@objectways.com" &&
      password === "superadmin@123"
    ) {
      const payload = {
        id: "superadmin", // You can use a unique identifier for the superadmin
        name: "Super Admin",
        email: "superadmin@objectways.com",
        empId: "superadmin",
        role: "superadmin",
      };

      jwt.sign(
        payload,
        Key.key,
        {
          expiresIn: 900,
        },
        (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token,
          });
        }
      );
    } else {
      // If it's not a superadmin login, proceed with the existing logic
      const existingEmployee = await Employee.findOne({ email_id: email });

      if (!existingEmployee) {
        return res
          .status(400)
          .json({ emailNotFound: "Email not found in Employee database" });
      }

      User.findOne({ email }).then((user) => {
        if (!user) {
          return res.status(404).json({ emailNotFound: "Email Not Found" });
        }

        const role = determineRoleFromDesignation(existingEmployee.designation);

        bcrypt.compare(password, user.password).then(async (isMatch) => {
          if (isMatch) {
            try {
              const lastLogin = new LastLogin({
                userId: user._id,
                loginTime: new Date(),
              });

              await lastLogin.save();

              user.lastLogin = lastLogin._id;

              await user.save();

              const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                empId: user.empId,
                role: role,
              };

              jwt.sign(
                payload,
                Key.key,
                {
                  expiresIn: 900,
                },
                (err, token) => {
                  res.json({
                    success: true,
                    token: "Bearer " + token,
                  });
                }
              );
            } catch (error) {
              console.error(error);
              res.status(500).json({ message: "Internal server error" });
            }
          } else {
            return res
              .status(400)
              .json({ passwordIncorrect: "Password Incorrect" });
          }
        });
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/users", (req, res) => {
  User.find({}, "name")
    .sort([["name", 1]])
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error:" + err));
});
app.get("/all", (req, res) => {
  User.find({}, "empId")
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error:" + err));
});

app.post("/uploadData", async (req, res) => {
  try {
    const data = req.body;

    // Extract email IDs from the incoming data
    const emailIds = data.map((employeeData) => employeeData.email_id);

    // Find existing employees with the extracted email IDs
    const existingEmployees = await Employee.find({
      email_id: { $in: emailIds },
    });

    // Create a map of existing employees for quick access
    const existingEmployeeMap = new Map(
      existingEmployees.map((emp) => [emp.email_id, emp])
    );

    // Prepare an array for bulk insertion
    const bulkInsertData = [];

    for (const employeeData of data) {
      const existingEmployee = existingEmployeeMap.get(employeeData.email_id);

      if (existingEmployee) {
        // Merge existing employee data with the new data
        const mergedData = { ...existingEmployee.toObject(), ...employeeData };
        bulkInsertData.push({
          updateOne: {
            filter: { _id: existingEmployee._id },
            update: mergedData,
          },
        });
      } else {
        // If no existing employee, create a new one
        bulkInsertData.push({ insertOne: { document: employeeData } });
      }
    }

    // Use insertMany for bulk insertion and updating
    await Employee.bulkWrite(bulkInsertData);

    res.status(200).json({ message: "Data saved to MongoDB" });
  } catch (error) {
    console.error("Error saving data to MongoDB", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET route for fetching data
app.get("/fetchData", async (req, res) => {
  try {
    const employees = await Employee.find({});
    const columns = Object.keys(Employee.schema.paths).filter(
      (col) => col !== "_id"
    );
    const rows = employees.map((emp) => ({ ...emp.toObject(), id: emp._id }));

    res.status(200).json({ columns, rows });
  } catch (error) {
    console.error("Error fetching data from MongoDB", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/test", (req, res) => {
  res.send({ message: "Hello World" })
});

await app.listen(process.env.PORT);
return {
  statusCode: 200,
  body: JSON.stringify({
    message: "Server running on Lambda",
  }),
};


//    For build
// app.use(express.static(path.join(__dirname, "client/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "/client/build", "index.html"));
// });
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// module.exports.handler = serverless(app);
export const handler = serverless(app);