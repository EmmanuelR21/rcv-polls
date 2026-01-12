import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ViewPollStyles.css";
import { API_URL } from "../shared";

const ViewPoll = ({ user }) => {
  const { shareableLink } = useParams();
  const [poll, setPoll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votes, setVotes] = useState({
    firstChoice: "",
    secondChoice: "",
    thirdChoice: "",
    fourthChoice: "",
    fifthChoice: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/polls/${shareableLink}`,
        );
        setPoll(response.data.poll);
      } catch (err) {
        console.error("Error fetching poll:", err);
        if (err.response?.status === 404) {
          setError("Poll not found");
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError(`Failed to load poll: ${err.message || "Unknown error"}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (shareableLink) {
      fetchPoll();
    }
  }, [shareableLink]);

  if (isLoading) {
    return (
      <div className="view-poll-container">
        <p>Loading poll...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-poll-container">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="view-poll-container">
        <h1>Poll not found</h1>
      </div>
    );
  }

  const canVote = poll.status === "published" && !hasVoted && user;

  const pollOptions = poll
    ? [
        { value: 1, label: poll.option1 },
        { value: 2, label: poll.option2 },
        { value: 3, label: poll.option3 },
        { value: 4, label: poll.option4 },
        { value: 5, label: poll.option5 },
      ]
    : [];

  const handleVoteChange = (position, value) => {
    setVotes((prev) => ({
      ...prev,
      [position]: value,
    }));
  };

  const validateVotes = () => {
    const voteValues = Object.values(votes);

    // Check if all votes are filled
    if (voteValues.some((vote) => !vote)) {
      return "Please rank all 5 options";
    }

    // Check if all votes are unique
    const uniqueVotes = new Set(voteValues);
    if (uniqueVotes.size !== 5) {
      return "Each option must be ranked exactly once";
    }

    return null;
  };

  const handleSubmitVote = async () => {
    const validationError = validateVotes();
    if (validationError) {
      setVoteMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setVoteMessage("");

    try {
      await axios.post(`${API_URL}/api/polls/${shareableLink}/vote`, votes, {
        withCredentials: true,
      });

      setHasVoted(true);
      setVoteMessage("Your vote has been submitted successfully!");
    } catch (error) {
      console.error("Error submitting vote:", error);
      if (error.response?.data?.error) {
        setVoteMessage(error.response.data.error);
      } else {
        setVoteMessage("Failed to submit vote. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableOptions = (currentPosition) => {
    const selectedValues = Object.entries(votes)
      .filter(([position, value]) => position !== currentPosition && value)
      .map(([, value]) => value);

    return pollOptions.filter(
      (option) => !selectedValues.includes(option.value.toString()),
    );
  };

  return (
    <div className="view-poll-container">
      <div className="poll-view-card">
        <div className="poll-view-header">
          <h1>{poll.title}</h1>
          <span className={`poll-status ${poll.status}`}>{poll.status}</span>
        </div>

        {!canVote && (
          <div className="poll-message">
            {poll.status === "draft" && (
              <p className="info-message">
                ⚠️ This poll is still in draft mode and cannot be voted on yet.
              </p>
            )}
            {poll.status === "ended" && (
              <p className="info-message">
                🏁 This poll has ended and voting is no longer available.
              </p>
            )}
          </div>
        )}

        <div className="poll-options-view">
          <h2>Poll Options:</h2>
          <div className="poll-options-list-view">
            <div className="poll-option-item-view">
              <div className="option-number-badge">1</div>
              <div className="option-text">{poll.option1}</div>
            </div>
            <div className="poll-option-item-view">
              <div className="option-number-badge">2</div>
              <div className="option-text">{poll.option2}</div>
            </div>
            <div className="poll-option-item-view">
              <div className="option-number-badge">3</div>
              <div className="option-text">{poll.option3}</div>
            </div>
            <div className="poll-option-item-view">
              <div className="option-number-badge">4</div>
              <div className="option-text">{poll.option4}</div>
            </div>
            <div className="poll-option-item-view">
              <div className="option-number-badge">5</div>
              <div className="option-text">{poll.option5}</div>
            </div>
          </div>
        </div>

        {hasVoted ? (
          <div className="voting-section">
            <div className="vote-success">
              <p>✅ Thank you for voting!</p>
              <p>Your ranked choice ballot has been recorded.</p>
            </div>
          </div>
        ) : poll?.status === "published" && !user ? (
          <div className="voting-section">
            <div className="auth-required">
              <p>🔐 Please log in to vote on this poll.</p>
              <p>You need to be signed in to submit your ranked choices.</p>
            </div>
          </div>
        ) : canVote ? (
          <div className="voting-section">
            <h2>Rank Your Choices</h2>
            <p className="voting-instructions">
              Please rank all options from 1st choice (most preferred) to 5th
              choice (least preferred):
            </p>

            <div className="voting-form">
              {[
                "firstChoice",
                "secondChoice",
                "thirdChoice",
                "fourthChoice",
                "fifthChoice",
              ].map((position, index) => (
                <div key={position} className="vote-row">
                  <label className="vote-label">
                    {["1st", "2nd", "3rd", "4th", "5th"][index]} Choice:
                  </label>
                  <select
                    value={votes[position]}
                    onChange={(e) => handleVoteChange(position, e.target.value)}
                    className="vote-select"
                    disabled={isSubmitting}
                  >
                    <option value="">Select an option...</option>
                    {getAvailableOptions(position).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {votes[position] && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}

              {voteMessage && (
                <div
                  className={`vote-message ${voteMessage.includes("successfully") ? "success" : "error"}`}
                >
                  {voteMessage}
                </div>
              )}

              <button
                onClick={handleSubmitVote}
                disabled={isSubmitting}
                className="submit-vote-btn"
              >
                {isSubmitting ? "Submitting..." : "Submit Vote"}
              </button>
            </div>
          </div>
        ) : poll?.status === "published" && hasVoted ? (
          <div className="voting-section">
            <p className="info-message">
              ✅ You have already voted on this poll.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ViewPoll;
