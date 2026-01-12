const db = require("./db");
const crypto = require("crypto");
const { User, Poll } = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      { username: "admin", passwordHash: User.hashPassword("admin123") },
      { username: "user1", passwordHash: User.hashPassword("user111") },
      { username: "user2", passwordHash: User.hashPassword("user222") },
    ]);

    console.log(`👤 Created ${users.length} users`);

    // Create some example polls
    const polls = await Poll.bulkCreate([
      {
        option1: "Option A",
        option2: "Option B",
        option3: "Option C",
        option4: "Option D",
        option5: "Option E",
        status: "published",
        ownerId: users[0].id,
        shareableLink: crypto.randomBytes(8).toString("hex"),
      },
      {
        option1: "Red",
        option2: "Blue",
        option3: "Green",
        option4: "Yellow",
        option5: "Purple",
        status: "draft",
        ownerId: users[1].id,
        shareableLink: crypto.randomBytes(8).toString("hex"),
      },
    ]);

    console.log(`📊 Created ${polls.length} polls`);

    console.log("🌱 Seeded the database");
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.message.includes("does not exist")) {
      console.log("\n🤔🤔🤔 Have you created your database??? 🤔🤔🤔");
    }
  }
  db.close();
};

seed();
