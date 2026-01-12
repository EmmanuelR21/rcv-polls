const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { Op } = require("sequelize");
const { Poll, Ballot } = require("../database");
const { authenticateJWT } = require("../auth");

// Get all polls for the current logged-in user
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const polls = await Poll.findAll({
      where: { ownerId: userId },
      order: [["createdAt", "DESC"]],
    });

    res.send({ polls });
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).send({ error: "Failed to fetch polls" });
  }
});

// Get all published polls by other users
router.get("/public", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const polls = await Poll.findAll({
      where: {
        status: "published",
        ownerId: { [Op.ne]: userId },
      },
      order: [["createdAt", "DESC"]],
    });

    res.send({ polls });
  } catch (error) {
    console.error("Error fetching public polls:", error);
    res.status(500).send({ error: "Failed to fetch public polls" });
  }
});

// Create a new poll
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, option1, option2, option3, option4, option5, status } =
      req.body;

    // Validate that title and all options are provided
    if (!title || !option1 || !option2 || !option3 || !option4 || !option5) {
      return res
        .status(400)
        .send({ error: "Title and all 5 poll options are required" });
    }

    // Validate status
    const validStatus = status || "draft";
    if (!["draft", "published", "ended"].includes(validStatus)) {
      return res.status(400).send({ error: "Invalid poll status" });
    }

    // Generate unique shareable link
    let shareableLink;
    let isUnique = false;
    while (!isUnique) {
      shareableLink = crypto.randomBytes(8).toString("hex");
      const existingPoll = await Poll.findOne({ where: { shareableLink } });
      if (!existingPoll) {
        isUnique = true;
      }
    }

    const poll = await Poll.create({
      title,
      option1,
      option2,
      option3,
      option4,
      option5,
      status: validStatus,
      ownerId: userId,
      shareableLink,
    });

    res.status(201).send({ poll });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).send({ error: "Failed to create poll" });
  }
});

// Get a poll by shareable link (public endpoint, no auth required)
router.get("/:shareableLink", async (req, res) => {
  try {
    const { shareableLink } = req.params;

    if (!shareableLink) {
      return res.status(400).send({ error: "Shareable link is required" });
    }

    const poll = await Poll.findOne({
      where: { shareableLink },
    });

    if (!poll) {
      return res.status(404).send({ error: "Poll not found" });
    }

    res.send({ poll });
  } catch (error) {
    console.error("Error fetching poll by link:", error);
    res.status(500).send({
      error: "Failed to fetch poll",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Submit a ballot for a poll
router.post("/:shareableLink/vote", authenticateJWT, async (req, res) => {
  try {
    const { shareableLink } = req.params;
    const {
      firstChoice,
      secondChoice,
      thirdChoice,
      fourthChoice,
      fifthChoice,
    } = req.body;

    // Get the poll
    const poll = await Poll.findOne({
      where: { shareableLink },
    });

    if (!poll) {
      return res.status(404).send({ error: "Poll not found" });
    }

    // Check if poll is published
    if (poll.status !== "published") {
      return res
        .status(400)
        .send({ error: "Poll is not available for voting" });
    }

    // Validate all choices are provided and are numbers 1-5
    const choices = [
      firstChoice,
      secondChoice,
      thirdChoice,
      fourthChoice,
      fifthChoice,
    ];

    if (choices.some((choice) => !choice || choice < 1 || choice > 5)) {
      return res
        .status(400)
        .send({ error: "All choices must be numbers between 1 and 5" });
    }

    // Validate all choices are unique
    const uniqueChoices = new Set(choices);
    if (uniqueChoices.size !== 5) {
      return res.status(400).send({ error: "All choices must be different" });
    }

    // Get user ID from authenticated request
    const userId = req.user.id;

    // Check for existing ballot from this user
    const existingBallot = await Ballot.findOne({
      where: { pollId: poll.id, userId: userId },
    });

    if (existingBallot) {
      return res
        .status(400)
        .send({ error: "You have already voted on this poll" });
    }

    // Create the ballot
    const ballot = await Ballot.create({
      pollId: poll.id,
      userId: userId,
      firstChoice: parseInt(firstChoice),
      secondChoice: parseInt(secondChoice),
      thirdChoice: parseInt(thirdChoice),
      fourthChoice: parseInt(fourthChoice),
      fifthChoice: parseInt(fifthChoice),
    });

    res.status(201).send({
      message: "Vote submitted successfully",
      ballot: {
        id: ballot.id,
        pollId: ballot.pollId,
        firstChoice: ballot.firstChoice,
        secondChoice: ballot.secondChoice,
        thirdChoice: ballot.thirdChoice,
        fourthChoice: ballot.fourthChoice,
        fifthChoice: ballot.fifthChoice,
      },
    });
  } catch (error) {
    console.error("Error submitting ballot:", error);
    res.status(500).send({ error: "Failed to submit vote" });
  }
});

module.exports = router;
