const { DataTypes } = require("sequelize");
const db = require("./db");

const Ballot = db.define("ballot", {
  pollId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "polls",
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Require user authentication for voting
    references: {
      model: "users",
      key: "id",
    },
  },
  // RCV rankings - stores the option number (1-5) in order of preference
  firstChoice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  secondChoice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  thirdChoice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  fourthChoice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  fifthChoice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
});

module.exports = Ballot;
