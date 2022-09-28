// Temporary JSON DB to store tasks.
// MongoDB is not available right now in newer version of Debian Linux.
// Thats why I opted to use JSONDB.
const { JsonDB, Config } = require("node-json-db");
const db = new JsonDB(new Config("taskDB", true, false, "/"));

// Initializing the express application.
// Setting the port to 8000 to avoid conflicts with React's default port.
const express = require("express");
const app = express();
const port = 8000;

// Only for this app, to run both nodeJS script and ReactJS in the same machine.
// To avoid CORS same origin error.
const cors = require("cors");
app.use(cors());

// CatchAsyn is used to wrap over any asynchronous middleware,
// To allow for easier error handling capabilites.
// By default Express Error handling is not supported in async operations
const CatchAsync = require("./utilities/CatchAsync");

// ExpressError is a custom Error class extending features of Error Class and adding in
// few properties like status and message.
const ExpressError = require("./utilities/ExpressError");

// JSON content type and urlencoded content type Body Parsers.
// It helps in getting data in req.body property.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET route to get all the tasks from JSONDB.
app.get(
  "/tasks",
  CatchAsync(async (req, res) => {
    const data = await db.getData("/test");
    res.send({ status: 200, success: "Retrived Data successfully", data });
  })
);

// POST route to add in a new task into JSONDB.
app.post(
  "/tasks/:id",
  CatchAsync(async (req, res) => {
    const newData = req.body;

    // Check for availability of required data.
    if (!(newData.name || newData.id)) {
      throw new ExpressError("Incorrect Data", 402);
    }
    await db.push(`/test/${newData.id}`, { ...newData });
    res.send({ status: 200, success: "Successfully added data" });
  })
);

// DELETE route to delete specific task or all the tasks at once based on delId parameter.
app.delete(
  "/tasks/:id",
  CatchAsync(async (req, res) => {
    const delId = req.params.id;

    // Check for deletion id
    if (!delId) {
      throw new ExpressError(
        "Insufficient Data provided to delete an item",
        402
      );
    }

    // If delId is all then we clear the DB and setup a fresh one.
    // If delId is any other id we then clear the task from the DB.
    if (delId === "all") {
      await db.delete(`/test/`);
      await db.push("/test/", {});
    } else {
      await db.delete(`/test/${delId}`);
    }
    res.send({ status: 200, success: "Successfully deleted data" });
  })
);

// All other routes handler to allow smoother error handling
app.use("*", (req, res) => {
  throw new ExpressError("Page Not Found", 404);
});

// Error Handling middleware - whenever we encounter any throw statement,
// The middleware here is run to provide user with acurate response.
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;

  // Setting the status and returning error message.
  res.status(status).send({ status, error: message });
});

// Setting up the application to listen for requests in the desired port.
app.listen(port, () => {
  console.log("Server running");
});
