const express = require("express");
const router = express.Router();
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

    const poll = await Poll.create({
      option1,
      option2,
      option3,
      option4,
      option5,
      status: validStatus,
      ownerId: userId,
    });

    res.status(201).send({ poll });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).send({ error: "Failed to create poll" });
  }
});

module.exports = router;
