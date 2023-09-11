const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const filePath = "zipCodes.json";
const connectTodatabase = require("./connection");
const company = require("./schemas/companies");
const User = require("./schemas/user");
const pages = require("./schemas/pages");
const { default: mongoose } = require("mongoose");

connectTodatabase();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*", // Allow requests from this origin
    methods: "GET, POST, PUT, DELETE", // Allowed HTTP methods
  })
);

function divideCompanies(companies) {
  let result = {
    tvProviders: [],
    internetProviders: [],
    bundles: [],
  };

  companies.forEach((c) => {
    if (c.Category === "Internet") result.internetProviders.push(c);
    else if (c.Category === "TV") result.tvProviders.push(c);
    else result.bundles.push(c);
  });

  return result;
}
app.get("/api/companyNames", async (req, res) => {
  try {
    // Assuming you have a Company model
    const companyNames = await company.find({}, "CompanyName"); // Replace "Company" with your actual model name

    // Extract the company names and send them as JSON response
    const names = companyNames.map((company) => company.CompanyName);
    res.json(names);
  } catch (error) {
    console.error("Error fetching company names:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/", async (req, res) => {
  const { zipCode } = req.body;

  try {
    const response = await company
      .find({ zipcodes: { $elemMatch: { $in: [zipCode] } } })
      .select({ zipcodes: 0 });

    const result = divideCompanies(response);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const findUser = await User.findOne({ $or: [{ email }, { username }] });
    if (findUser) {
      return res
        .status(400)
        .json({ message: "username or email already exists" });
    }

    const newUser = new User({
      ...req.body,
    });

    const saved = await newUser.save();

    res.status(201).json({ message: "Signup successful", payload: saved });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error occured" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const findUser = await User.findOne(
    { email: email, password: password },
    "-password"
  );

  if (!findUser) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", payload: findUser });
});

app.post("/api/add-provider", async (req, res) => {
  try {
    const newcompany = new company({
      ...req.body,
    });
    const saved = await newcompany.save();
    res.json({ message: "added successfully", payload: saved });
  } catch (error) {
    res.status(400).json({ message: "Error occured" });
  }
});

app.post("/api/update/provider", async (req, res) => {
  try {
    const companyName = req.query.companyName;
    const updateFields = {};
    const pushFields = {};

    // Iterate through fields in the payload
    for (const key in req.body) {
      if (req.body[key] !== null) {
        if (key === "Features" || key === "zipcodes") {
          pushFields[key] = req.body[key];
        } else {
          updateFields[key] = req.body[key];
        }
      }
    }
    // Update only non-null fields in the document
    const updatedCompany = await company.updateOne(
      { CompanyName: companyName },
      { $set: updateFields, $push: pushFields }
    );

    if (updatedCompany.modifiedCount === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "update successful", payload: updatedCompany });
  } catch (error) {
    res.status(500).json({ message: "Error updating company" });
  }
});

app.post("/api/update/website", async (req, res) => {
  try {
    const { mongoObj, data } = req.body;
    let update = {};

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        if (value) {
          update[mongoObj[key]] = value;
        }
      }
    }
    const result = await pages.findByIdAndUpdate(
      { _id: "64ee26ed33173fd34f853602" },
      { $set: update }
    );
    res.json({ message: "update successful" });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

// Define a route to fetch the entire document
app.get("/api/pages", async (req, res) => {
  try {
    const page = await pages.findOne();

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
