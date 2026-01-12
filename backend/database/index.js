const db = require("./db");
const User = require("./user");
const Poll = require("./poll");

// Set up associations
User.hasMany(Poll, { foreignKey: "ownerId", as: "polls" });
Poll.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

module.exports = {
  db,
  User,
  Poll,
};
