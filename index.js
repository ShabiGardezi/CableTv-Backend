const express = require("express");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const cors = require("cors");
const filePath = "zipCodes.json";

const app = express();
app.use(bodyParser.json());
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

app.post("/write-json", (req, res) => {
  const data = req.body; // Data sent from the dashboard
  const jsonData = JSON.stringify(data, null, 2); // Convert data to JSON format

  fs.writeFileSync(filePath, jsonData);

  res.status(200).json({ message: "Data written to JSON file." });
});

app.post("/api/signup", (req, res) => {
  const { username, email, password } = req.body;

  // In a real application, you would validate and process the data, then store it in a database.
  // For the sake of this example, let's just return the received data.
  res.json({
    message: "Signup successful!",
    data: {
      username,
      email,
    },
  });
});

const users = [{ id: 1, email: "test@example.com", password: "password123" }];

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Find the user with the provided email
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Wrong email or password" });
  }

  // In a real application, you might generate a JWT token here
  res.json({ message: "Login successful" });
});
const port = 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
