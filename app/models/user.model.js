const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    fName: String,
    lName: String,
    file: String,
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          // Ensure that the phone is a number and has a length of 8
          return /^\d{8}$/.test(v);
        },
        message: "Phone must be a number with a length of 8",
      },
    },
    email: {
      type: String,
      unique: [true, "The email is unique"],
      required: [true, "The email is required"],
      validate: {
        validator: function (v) {
          // Ensure that the email follows a valid format
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
    password: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
