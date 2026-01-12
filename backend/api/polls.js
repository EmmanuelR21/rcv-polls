const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { Op } = require("sequelize");
const { Poll, Ballot } = require("../database");
const { authenticateJWT } = require("../auth");
const { calculateRCVResults } = require("../utils/rcvCalculator");

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

// Get all published and ended polls by other users
router.get("/public", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const polls = await Poll.findAll({
      where: {
        status: { [Op.in]: ["published", "ended"] },
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

// Get poll results (RCV calculation) - only for ended polls
router.get("/:shareableLink/results", async (req, res) => {
  try {
    const { shareableLink } = req.params;

    if (!shareableLink) {
      return res.status(400).send({ error: "Shareable link is required" });
    }

    // Get the poll
    const poll = await Poll.findOne({
      where: { shareableLink },
    });

    if (!poll) {
      return res.status(404).send({ error: "Poll not found" });
    }

    // Only show results for ended polls
    if (poll.status !== "ended") {
      return res.status(400).send({
        error: "Results are only available for ended polls",
      });
    }

    // Get all ballots for this poll
    const ballots = await Ballot.findAll({
      where: { pollId: poll.id },
      order: [["createdAt", "ASC"]],
    });

    // If no ballots, return empty results
    if (ballots.length === 0) {
      return res.send({
        poll: {
          id: poll.id,
          title: poll.title,
          status: poll.status,
          option1: poll.option1,
          option2: poll.option2,
          option3: poll.option3,
          option4: poll.option4,
          option5: poll.option5,
        },
        results: {
          winner: null,
          winnerText: null,
          totalBallots: 0,
          rounds: [],
          optionSummary: {},
          completed: false,
          message: "No votes were cast for this poll",
        },
      });
    }

    // Calculate RCV results
    const results = calculateRCVResults(ballots, poll);

    res.send({
      poll: {
        id: poll.id,
        title: poll.title,
        status: poll.status,
        option1: poll.option1,
        option2: poll.option2,
        option3: poll.option3,
        option4: poll.option4,
        option5: poll.option5,
      },
      results,
    });
  } catch (error) {
    console.error("Error calculating poll results:", error);
    res.status(500).send({
      error: "Failed to calculate poll results",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Endpoint to manually end a poll (for testing/admin purposes)
router.patch("/:shareableLink/end", authenticateJWT, async (req, res) => {
  try {
    const { shareableLink } = req.params;
    const userId = req.user.id;

    if (!shareableLink) {
      return res.status(400).send({ error: "Shareable link is required" });
    }

    const poll = await Poll.findOne({
      where: { shareableLink },
    });

    if (!poll) {
      return res.status(404).send({ error: "Poll not found" });
    }

    // Only poll owner can end their poll
    if (poll.ownerId !== userId) {
      return res
        .status(403)
        .send({ error: "Only poll owner can end the poll" });
    }

    // Update poll status to ended
    await poll.update({ status: "ended" });

    res.send({
      message: "Poll ended successfully",
      poll: {
        id: poll.id,
        title: poll.title,
        status: poll.status,
        shareableLink: poll.shareableLink,
      },
    });
  } catch (error) {
    console.error("Error ending poll:", error);
    res.status(500).send({ error: "Failed to end poll" });
  }
});

module.exports = router;
