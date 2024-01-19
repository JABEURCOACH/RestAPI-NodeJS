module.exports = (app) => {
  const blogs = require("../controllers/blog.controller.js");

  app.post("/blogs", blogs.create);

  app.get("/blogs", blogs.findAll);

  app.get("/blogs/:blogId", blogs.findOne);

  app.put("/blogs/:blogId", blogs.update);

  app.delete("/blogs/:blogId", blogs.delete);
};
