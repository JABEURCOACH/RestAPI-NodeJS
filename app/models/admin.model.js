const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema({
    username: {
            type: String,
            unique: [true, 'The username is unique'],
            required: [true, 'The username is required']
           
    },
    email: {
            type: String,
            unique: [true, 'The email is unique'],
            required: [true, 'The email is required']
           
    },
    password: {
            type: String,
            required: [true, 'The password is required']
           
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', AdminSchema);