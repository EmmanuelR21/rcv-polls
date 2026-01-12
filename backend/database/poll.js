const { DataTypes } = require("sequelize");
const db = require("./db");

const Poll = db.define("poll", {
  option1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option3: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option4: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option5: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("draft", "published", "ended"),
    allowNull: false,
    defaultValue: "draft",
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  shareableLink: {
    type: DataTypes.STRING,
    allowNull: true, // Temporarily nullable to allow schema update
    unique: true,
  },
});

module.exports = Poll;
