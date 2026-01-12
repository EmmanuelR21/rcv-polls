const db = require("./db");
const crypto = require("crypto");
const { User, Poll, Ballot } = require("./index");

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
        title: "What's your favorite food?",
        option1: "Pizza",
        option2: "Burgers",
        option3: "Tacos",
        option4: "Sushi",
        option5: "Pasta",
        status: "published",
        ownerId: users[0].id,
        shareableLink: crypto.randomBytes(8).toString("hex"),
      },
      {
        title: "Favorite color?",
        option1: "Red",
        option2: "Blue",
        option3: "Green",
        option4: "Yellow",
        option5: "Purple",
        status: "draft",
        ownerId: users[1].id,
        shareableLink: crypto.randomBytes(8).toString("hex"),
      },
      {
        title: "Best streaming service?",
        option1: "Netflix",
        option2: "Disney+",
        option3: "Amazon Prime",
        option4: "HBO Max",
        option5: "Apple TV+",
        status: "published",
        ownerId: users[1].id,
        shareableLink: crypto.randomBytes(8).toString("hex"),
      },
      {
        title: "Ideal vacation type?",
        option1: "Beach Vacation",
        option2: "Mountain Hiking",
        option3: "City Tour",
        option4: "Camping Trip",
        option5: "Cruise Ship",
        status: "published",
        ownerId: users[2].id,
        shareableLink: crypto.randomBytes(8).toString("hex"),
      },
      {
        title: "Best pet choice?",
        option1: "Dog",
        option2: "Cat",
        option3: "Bird",
        option4: "Fish",
        option5: "Hamster",
        status: "ended",
        ownerId: users[0].id,
        shareableLink: crypto.randomBytes(8).toString("hex"),
      },
      {
        title: "Morning beverage preference?",
        option1: "Coffee",
        option2: "Tea",
        option3: "Hot Chocolate",
        option4: "Energy Drink",
        option5: "Water",
        status: "published",
        ownerId: users[2].id,
        shareableLink: crypto.randomBytes(8).toString("hex"),
      },
      {
        title: "Music genre preference?",
        option1: "Rock",
        option2: "Pop",
        option3: "Hip Hop",
        option4: "Classical",
        option5: "Jazz",
        status: "ended",
        ownerId: users[2].id,
        shareableLink: crypto.randomBytes(8).toString("hex"),
      },
    ]);

    console.log(`📊 Created ${polls.length} polls`);

    // Create some test ballots for the ended poll (Music genre preference)
    const endedPoll = polls.find((poll) => poll.status === "ended");
    if (endedPoll) {
      const testBallots = await Ballot.bulkCreate([
        // User votes for the ended music poll
        {
          pollId: endedPoll.id,
          userId: users[0].id, // admin votes
          firstChoice: 1, // Rock
          secondChoice: 3, // Hip Hop
          thirdChoice: 5, // Jazz
          fourthChoice: 2, // Pop
          fifthChoice: 4, // Classical
        },
        {
          pollId: endedPoll.id,
          userId: users[1].id, // user1 votes
          firstChoice: 3, // Hip Hop
          secondChoice: 1, // Rock
          thirdChoice: 2, // Pop
          fourthChoice: 5, // Jazz
          fifthChoice: 4, // Classical
        },
        {
          pollId: endedPoll.id,
          userId: users[2].id, // user2 votes (poll owner - but we'll allow for testing)
          firstChoice: 5, // Jazz
          secondChoice: 4, // Classical
          thirdChoice: 1, // Rock
          fourthChoice: 2, // Pop
          fifthChoice: 3, // Hip Hop
        },
      ]);

      console.log(`🗳️ Created ${testBallots.length} test ballots`);
    }

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
