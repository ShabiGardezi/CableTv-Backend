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

const port = 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
