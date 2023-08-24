const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const filePath = "zipCodes.json";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*", // Allow requests from this origin
    methods: "GET, POST, PUT, DELETE", // Allowed HTTP methods
  })
);

function divideCompanies(companies, jsonData) {
  let result = {
    tvProviders: [],
    internetProviders: [],
    bundles: [],
  };

  jsonData.Sheet2.forEach((obj, index) => {
    if (companies.includes(obj["Column2"])) {
      if (index >= 1 && index <= 18) result.tvProviders.push(obj);
      else if (index >= 19 && index <= 44) result.internetProviders.push(obj);
      else result.bundles.push(obj);
    }
  });

  return result;
}

app.post("/", async (req, res) => {
  const { zipCode } = req.body;
  let companies = [];
  console.log(req.body);

  try {
    const data = await fs.readFile(filePath, "utf8");

    const jsonData = JSON.parse(data);

    jsonData.Sheet1.map((obj) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (value === parseInt(zipCode)) {
            companies.push(jsonData.Sheet1[0][key]);
          }
        }
      }
    });
    const result = divideCompanies(companies, jsonData);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/signup", (req, res) => {
  const { username, email, password, role } = req.body;

  // Validate input (e.g., check for duplicate emails)
  // For demonstration, we'll assume the email is unique.

  const newUser = { username, email, password, role };
  users.push(newUser); // Store the user in your database

  res.status(201).json({ message: "Signup successful", user: newUser });
});

const users = [
  { id: 1, email: "test@example.com", password: "password123", role: "admin" },
];

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Validate email and password (replace with your authentication logic)
  // For demonstration, we'll just check if the email and password match a user in our dummy array.
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate and return a token here for authentication if needed

  res.json({ message: "Login successful", user });
});
const port = 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
