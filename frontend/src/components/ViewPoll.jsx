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
  const [results, setResults] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/polls/${shareableLink}`,
        );
        setPoll(response.data.poll);

        // If poll is ended, fetch results
        if (response.data.poll.status === "ended") {
          await fetchResults();
        }
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

    const fetchResults = async () => {
      setIsLoadingResults(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/polls/${shareableLink}/results`,
        );
        setResults(response.data.results);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setIsLoadingResults(false);
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

  const isOwner = user && poll && user.id === poll.ownerId;
  const canVote = poll.status === "published" && !hasVoted && user && !isOwner;

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

        {poll.status === "ended" ? (
          <div className="results-view">
            <h2>Poll Results</h2>
            {isLoadingResults ? (
              <p>Loading results...</p>
            ) : results ? (
              <div className="results-content">
                {results.completed && results.winner ? (
                  <div className="winner-announcement">
                    <h3>🏆 Winner: {results.winnerText}</h3>
                    <p>Total votes cast: {results.totalBallots}</p>
                  </div>
                ) : (
                  <div className="no-results">
                    <p>{results.message || "No results available"}</p>
                  </div>
                )}

                {results.optionSummary && (
                  <div className="results-breakdown">
                    <h4>Vote Breakdown:</h4>
                    <div className="options-results">
                      {Object.values(results.optionSummary).map((option) => (
                        <div
                          key={option.optionNumber}
                          className={`result-option ${
                            option.isWinner ? "winner-option" : ""
                          } ${
                            option.eliminatedInRound ? "eliminated-option" : ""
                          }`}
                        >
                          <div className="result-option-header">
                            <div className="option-number-badge">
                              {option.optionNumber}
                            </div>
                            <div className="option-text">{option.text}</div>
                            {option.isWinner && (
                              <div className="winner-badge">Winner</div>
                            )}
                          </div>
                          <div className="option-stats">
                            <div className="final-votes">
                              Final votes: {option.finalVotes}
                            </div>
                            {option.eliminatedInRound && (
                              <div className="elimination-info">
                                Eliminated in round {option.eliminatedInRound}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.rounds && results.rounds.length > 0 && (
                  <div className="rounds-breakdown">
                    <h4>Round-by-Round Results:</h4>
                    {results.rounds.map((round) => (
                      <div key={round.round} className="round-result">
                        <h5>Round {round.round}</h5>
                        <div className="round-votes">
                          {Object.entries(round.voteCounts).map(
                            ([option, votes]) => {
                              const optionText = poll[`option${option}`];
                              return (
                                <div key={option} className="round-vote-count">
                                  {optionText}: {votes} votes
                                </div>
                              );
                            },
                          )}
                        </div>
                        {round.eliminated && (
                          <p className="eliminated-text">
                            Eliminated: {poll[`option${round.eliminated}`]}
                          </p>
                        )}
                        {round.winner && (
                          <p className="winner-text">
                            Winner: {poll[`option${round.winner}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p>Failed to load results</p>
            )}
          </div>
        ) : (
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
        )}

        {hasVoted ? (
          <div className="voting-section">
            <div className="vote-success">
              <p>✅ Thank you for voting!</p>
              <p>Your ranked choice ballot has been recorded.</p>
            </div>
          </div>
        ) : poll?.status === "published" && isOwner ? (
          <div className="voting-section">
            <div className="owner-restriction">
              <p>👤 You cannot vote on your own poll.</p>
              <p>As the creator of this poll, you can only view the options.</p>
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
