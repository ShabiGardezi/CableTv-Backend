const express = require("express");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const cors = require("cors");
const filePath = "zipCodes.json";
const multer = require("multer"); // Import multer middleware for handle file upload

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

app.post("/api/signup", (req, res) => {
  const { username, email, password, role } = req.body;

  if (req.body.role === "admin") {
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
  console.log(user);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Wrong email or password" });
  }
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
// const storage = multer.memoryStorage(); // Store files in memory
// const upload = multer({ storage });

// Define an endpoint for file upload
// app.post("/upload-json", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const buffer = req.file.buffer.toString("utf8");
//     const jsonData = JSON.parse(buffer);

//     // You can now write jsonData to your JSON file or process it as needed
//     fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

//     res.status(200).json({ message: "File uploaded successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

const port = 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
