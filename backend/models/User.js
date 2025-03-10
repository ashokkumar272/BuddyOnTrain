const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  username: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  online: { type: Boolean, default: false },
lastSeen: Date,

  createdAt: { type: Date, default: Date.now },

});


const user = mongoose.model('User', userSchema);

module.exports = user;