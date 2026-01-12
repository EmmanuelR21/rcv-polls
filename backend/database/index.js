const db = require("./db");
const User = require("./user");
const Poll = require("./poll");
const Ballot = require("./ballot");

// Set up associations
User.hasMany(Poll, { foreignKey: "ownerId", as: "polls" });
Poll.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

Poll.hasMany(Ballot, { foreignKey: "pollId", as: "ballots" });
Ballot.belongsTo(Poll, { foreignKey: "pollId", as: "poll" });

User.hasMany(Ballot, { foreignKey: "userId", as: "ballots" });
Ballot.belongsTo(User, { foreignKey: "userId", as: "voter" });

module.exports = {
  db,
  User,
  Poll,
  Ballot,
};
