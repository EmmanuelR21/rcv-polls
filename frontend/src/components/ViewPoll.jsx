import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ViewPollStyles.css";
import { API_URL } from "../shared";

const ViewPoll = () => {
  const { shareableLink } = useParams();
  const [poll, setPoll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/polls/${shareableLink}`
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

  const canVote = poll.status === "published";

  return (
    <div className="view-poll-container">
      <div className="poll-view-card">
        <div className="poll-view-header">
          <h1>Poll Options</h1>
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
          <h2>Please review the following options:</h2>
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

        {canVote && (
          <div className="voting-section">
            <p className="voting-message">
              📊 Voting functionality will be available here soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPoll;
