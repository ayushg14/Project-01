const express = require("express");
const mongoose = require("mongoose");
const users = require("./MOCK_DATA.json");
const fs = require("fs");

const app = express();
const PORT = 8000;

// Middleware - pluggin
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  fs.appendFile(
    "log.txt",
    `${Date.now()}: ${req.method}: ${req.path}\n`,
    (err, data) => {
      next();
    }
  );
});

// app.use((req, res, next) => {
//   console.log("Hello From Middleware 1");
//   req.myUserName = "AyushG";
//   next();
// });

// app.use((req, res, next) => {
//   console.log("Hello from Middleware 2: ", req.myUserName);
//   next();
// });

// ROUTES
app.get("/api/users", (req, res) => {
  // console.log("I am in root: ", req.myUserName);
  return res.json(users);
});

app.get("/users", (req, res) => {
  const html = `
    <ul>
    ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>
    `;
  res.send(html);
});

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (!user) return res.status(404).json({ error: "user not found" });
    return res.json(user);
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const body = req.body;
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
      // Update user
      users[index] = { ...users[index], ...body };
      fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "error", message: "Internal Server Error" });
        }
        return res.json({
          status: "success",
          message: "User updated successfully",
        });
      });
    } else {
      // User not found
      return res.json({ status: "error", message: "User not found" });
    }
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
      // Remove user from the array
      users.splice(index, 1);
      fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "error", message: "Internal Server Error" });
        }
        return res.json({
          status: "success",
          message: "User deleted successfully",
        });
      });
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
  });

// app.get("/api/users/:id", (req, res) => {
//   const id = Number(req.params.id);
//   const user = users.find((user) => user.id === id);
//   return res.json(user);
// });

app.post("/api/users", (req, res) => {
  const body = req.body;
  console.log("Body: ", body);
  if (
    !body ||
    !body.first_name ||
    !body.last_name ||
    !body.email ||
    !body.gender ||
    !body.job_title
  ) {
    return res.status(400).json({ msg: "All fields are required" });
  }
  users.push({ ...body, id: users.length + 1 }); // Corrected the ID assignment
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
    return res.status(201).json({ status: "success", id: users.length }); // Updated the response ID
  });
});

// app.patch("/api/users/:id", (req, res) => {
//   // TODO: Edit the user with id
//   return res.json({ status: "pending" });
// });

// app.delete("/api/users/:id", (req, res) => {
//   // TODO: Delete the user with id
//   return res.json({ status: "pending" });
// });

app.listen(PORT, () => console.log(`Server is listening at ${PORT}`));
