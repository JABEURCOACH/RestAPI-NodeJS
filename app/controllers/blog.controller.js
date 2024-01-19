const Blog = require("../models/blog.model.js");

// Create and Save a new blog
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    return res.status(400).send({
      message: "blog content can not be empty",
    });
  }

  // Create a blog
  const blog = new Blog({
    title: req.body.title || "Untitled Blog",
    body: req.body.body,
    author: req.body.author,
  });

  // Save blog in the database
  blog
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the blog.",
      });
    });
};

// Retrieve and return all blog from the database.
exports.findAll = (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((blogs) => {
      res.send(blogs);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving blogs.",
      });
    });
};

// Find a single blog with a blogId
exports.findOne = (req, res) => {
  Blog.findById(req.params.blogId)
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({
          message: "blog not found with id " + req.params.blogId,
        });
      }
      res.send(blog);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "blog not found with id " + req.params.blogId,
        });
      }
      return res.status(500).send({
        message: "Error retrieving blog with id " + req.params.blogId,
      });
    });
};

// Update a blog identified by the blogId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body.username) {
    return res.status(400).send({
      message: "blog content can not be empty",
    });
  }

  // Find blog and update it with the request body
  Blog.findByIdAndUpdate(
    req.params.blogId,
    {
      title: req.body.title || "Untitled Blog",
      body: req.body.body,
      author: req.body.author,
    },
    { new: true }
  )
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({
          message: "blog not found with id " + req.params.blogId,
        });
      }
      res.send(blog);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "blog not found with id " + req.params.blogId,
        });
      }
      return res.status(500).send({
        message: "Error updating blog with id " + req.params.blogId,
      });
    });
};

// Delete a blog with the specified blogId in the request
exports.delete = (req, res) => {
  Blog.findByIdAndRemove(req.params.blogId)
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({
          message: "blog not found with id " + req.params.blogId,
        });
      }
      res.send({ message: "blog deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "blog not found with id " + req.params.blogId,
        });
      }
      return res.status(500).send({
        message: "Could not delete blog with id " + req.params.blogId,
      });
    });
};
