module.exports = (app) => {
  const users = require("../controllers/user.controller.js");

  // Define a route to handle file upload and stage creation
  app.post("/users/upload", users.uploadFileAndCreate);

  app.get("/users", users.findAll);

  app.get("/users/:userId", users.findOne);

  app.put("/users/:userId", users.update);

  app.delete("/users/:userId", users.delete);
};
