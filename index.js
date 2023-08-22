const express = require("express");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const cors = require("cors");
const filePath = "zipCodes.json";
const multer = require("multer"); // Import multer middleware for handle file upload
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

app.use(
  cors({
    origin: "*", // Allow requests from this origin
    methods: "GET, POST, PUT, DELETE", // Allowed HTTP methods
  })
);

// dummy user to access dashboard

const users = [
  {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    password: "password123",
    role: "user",
  },
  {
    id: 2,
    username: "admin1",
    email: "admin1@example.com",
    password: "admin123",
    role: "admin",
  },
];

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

app.post("/write-json", (req, res) => {
  const data = req.body; // Data sent from the dashboard
  const jsonData = JSON.stringify(data, null, 2); // Convert data to JSON format

  fs.writeFileSync(filePath, jsonData);

  res.status(200).json({ message: "Data written to JSON file." });
});
// Secret key to sign and verify tokens
const secretKey = crypto.randomBytes(32).toString("hex");

console.log("Generated Secret Key:", secretKey);
// Middleware to generate and verify JWT tokens
const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secretKey,
    {
      expiresIn: "1h", // Token expiration time
    }
  );
};

// Middleware to verify JWT in requests
const verifyToken = expressJwt({ secret: secretKey, algorithms: ["HS256"] });
app.post("/api/signup", verifyToken, (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if the requester is an admin
  if (req.user && req.user.role === "admin") {
    // Add the new user to the user data (In a real application, you'd add this to a database)
    const newUser = { id: users.length + 1, username, email, password, role };
    users.push(newUser);

    res.json({
      message: "User added successfully!",
      data: newUser,
    });
  } else {
    res.status(403).json({ error: "Only admin users can add new users" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Find the user with the provided email
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Wrong email or password" });
  }

  // Create a JWT token and send it in the response
  const token = createToken(user);
  res.json({ token });
});
app.get("/api/all-data", async (req, res) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Multer configuration for file upload
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Define an endpoint for file upload
app.post("/upload-json", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = req.file.buffer.toString("utf8");
    const jsonData = JSON.parse(buffer);

    // You can now write jsonData to your JSON file or process it as needed
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
