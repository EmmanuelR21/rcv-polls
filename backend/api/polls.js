const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { Poll } = require("../database");
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

// Create a new poll
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { option1, option2, option3, option4, option5, status } = req.body;

    // Validate that all options are provided
    if (!option1 || !option2 || !option3 || !option4 || !option5) {
      return res
        .status(400)
        .send({ error: "All 5 poll options are required" });
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
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

module.exports = router;
