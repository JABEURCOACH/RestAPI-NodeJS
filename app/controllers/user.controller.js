const User = require("../models/user.model.js");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "docUploaded"); // Define the folder where the uploaded files will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop(); // Get the file extension
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
});

const pdfWordFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept the file if its MIME type is in the allowed list
    cb(null, true);
  } else {
    // Reject the file if it's not a PDF or Word document
    cb(new Error("Only PDF and Word files are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: pdfWordFileFilter, // Use the custom filter function
});
// Function to upload an file and create a new user
exports.uploadFileAndCreate = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "File upload failed, Please check the format!" });
    }
    // Now you can access `req.file`
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    console.log("req.file:", req.file); // Add this line for debugging

    // file uploaded successfully, now create a new user
    const user = new User({
      fName: req.body.fName || "Untitled User",
      lName: req.body.lName,
      file: req.file.filename, // Store the filename in the database
      phone: req.body.phone,
      email: req.body.email,
      password: req.body.password,
    });

    user
      .save()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.error("Database Error:", err);
        res.status(500).json({
          message: "Some error occurred while creating the user.",
          error: err,
        });
      });
  });
};

// Retrieve and return all user from the database.
exports.findAll = (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single user with a userId
exports.findOne = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "user not found with id " + req.params.userId,
        });
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "user not found with id " + req.params.userId,
        });
      }
      return res.status(500).send({
        message: "Error retrieving user with id " + req.params.userId,
      });
    });
};

// Update a user identified by the userId in the request
exports.update = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: "File upload failed." });
    }

    // Find user and update it with the request body
    User.findById(req.params.userId)
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: "User not found with id " + req.params.userId,
          });
        }
        console.log("req.file:", req.file); // Add this line for debugging

        // Check if a new file is provided
        if (req.file) {
          // Remove the old file from the folder
          const filePath = path.join(
            __dirname,
            "..",
            "..",
            "docUploaded",
            user.file
          );

          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            }
          });

          // Update the file with the new file
          user.file = req.file.filename;
          console.log("Update the file with the new file");
        }

        const updateFields = {};

        if (req.body.fName) updateFields.fName = req.body.fName;
        if (req.body.lName) updateFields.lName = req.body.lName;
        if (req.file) updateFields.file = user.file;
        if (req.body.phone) updateFields.phone = req.body.phone;
        if (req.body.email) updateFields.email = req.body.email;
        if (req.body.password) updateFields.password = req.body.password;

        // Find user and update it with the specified fields
        User.findByIdAndUpdate(req.params.userId, updateFields, {
          new: true,
        })
          .then((updatedUser) => {
            res.send(updatedUser);
          })
          .catch((err) => {
            console.error("Database Error:", err);
            res.status(500).json({
              message: "Error updating user with id " + req.params.userId,
              error: err,
            });
          });
      })
      .catch((err) => {
        if (err.kind === "ObjectId") {
          return res.status(404).send({
            message: "User not found with id " + req.params.userId,
          });
        }
        return res.status(500).send({
          message: "Error retrieving user with id " + req.params.userId,
        });
      });
  });
};

// Delete a user with the specified userId in the request
exports.delete = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId,
        });
      }

      // Remove the file file from the folder
      const docPath = path.join(
        __dirname,
        "..",
        "..",
        "docUploaded",
        user.file
      );

      fs.unlink(docPath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });

      // Delete the user from the database
      User.findByIdAndRemove(req.params.userId)
        .then(() => {
          res.send({ message: "User deleted successfully!" });
        })
        .catch((err) => {
          if (err.kind === "ObjectId" || err.name === "NotFound") {
            return res.status(404).send({
              message: "User not found with id " + req.params.userId,
            });
          }
          return res.status(500).send({
            message: "Could not delete user with id " + req.params.userId,
          });
        });
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId,
        });
      }
      return res.status(500).send({
        message: "Error retrieving user with id " + req.params.userId,
      });
    });
};
