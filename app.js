const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.disable("x-powered-by");

app.use([
  express.json(),
  (req, res, next) => {
    res.setHeader("X-API-Version", "1.0.0");
    res.setHeader("X-Developer", "Piyush Jha");
    next();
  },
]);

const PORT = 3000;

const DATA_FILE = path.join(__dirname, "users.json");

const readUsersFromFile = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeUsersToFile = (users) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
};

app.get("/users", (req, res) => {
  try {
    const users = readUsersFromFile();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reading users",
      error: error.message,
    });
  }
});

app.get("/users/search", (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City query parameter is required",
      });
    }

    const users = readUsersFromFile();
    const filteredUsers = users.filter(
      (user) => user.city.toLowerCase() === city.toLowerCase()
    );

    res.status(200).json({
      success: true,
      count: filteredUsers.length,
      data: filteredUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message,
    });
  }
});

app.get("/users/:id", (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const users = readUsersFromFile();

    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
});

app.post("/users", (req, res) => {
  try {
    const { name, city } = req.body;

    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: "Name and city are required fields",
      });
    }

    const users = readUsersFromFile();

    const newId =
      users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

    const newUser = {
      id: newId,
      name,
      city,
    };

    users.push(newUser);

    writeUsersToFile(users);

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding user",
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
