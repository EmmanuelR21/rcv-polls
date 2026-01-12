import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./HomeStyles.css";
import { API_URL } from "../shared";

const Home = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [polls, setPolls] = useState([]);
  const [isLoadingPolls, setIsLoadingPolls] = useState(false);
  const [pollOptions, setPollOptions] = useState({
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    option5: "",
  });

  // Fetch user's polls
  const fetchPolls = useCallback(async () => {
    if (!user) return;

    setIsLoadingPolls(true);
    try {
      const response = await axios.get(`${API_URL}/api/polls`, {
        withCredentials: true,
      });
      setPolls(response.data.polls || []);
    } catch (error) {
      console.error("Error fetching polls:", error);
      setPolls([]);
    } finally {
      setIsLoadingPolls(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form when closing
    setPollOptions({
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      option5: "",
    });
  };

  const handleOptionChange = (e, optionNumber) => {
    const { value } = e.target;
    setPollOptions((prev) => ({
      ...prev,
      [`option${optionNumber}`]: value,
    }));
  };

  const handlePublishPoll = async () => {
    // Validate that all options are filled
    if (
      !pollOptions.option1 ||
      !pollOptions.option2 ||
      !pollOptions.option3 ||
      !pollOptions.option4 ||
      !pollOptions.option5
    ) {
      alert("Please fill in all 5 poll options");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/polls`,
        {
          ...pollOptions,
          status: "published",
        },
        {
          withCredentials: true,
        }
      );
      handleCloseModal();
      // Refresh polls list
      fetchPolls();
    } catch (error) {
      console.error("Error creating poll:", error);
      alert(
        error.response?.data?.error || "Failed to create poll. Please try again."
      );
    }
  };

  const handleSaveForLater = async () => {
    // Validate that all options are filled
    if (
      !pollOptions.option1 ||
      !pollOptions.option2 ||
      !pollOptions.option3 ||
      !pollOptions.option4 ||
      !pollOptions.option5
    ) {
      alert("Please fill in all 5 poll options");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/polls`,
        {
          ...pollOptions,
          status: "draft",
        },
        {
          withCredentials: true,
        }
      );
      handleCloseModal();
      // Refresh polls list
      fetchPolls();
    } catch (error) {
      console.error("Error saving poll:", error);
      alert(
        error.response?.data?.error || "Failed to save poll. Please try again."
      );
    }
  };

  const handleCopyLink = (shareableLink) => {
    const pollUrl = `${window.location.origin}/poll/${shareableLink}`;
    navigator.clipboard
      .writeText(pollUrl)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        // Fallback: select the text
        const textArea = document.createElement("textarea");
        textArea.value = pollUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Link copied to clipboard!");
      });
  };

  return (
    <div className="home">
      <h1>Welcome to the TTP Winter Frontend!</h1>
      {user ? (
        <>
          <p>Welcome, {user.username}!</p>
          <button className="create-poll-btn" onClick={handleOpenModal}>
            Create Poll
          </button>

          <div className="polls-section">
            <h2>Your Polls</h2>
            {isLoadingPolls ? (
              <p>Loading polls...</p>
            ) : polls.length === 0 ? (
              <p className="no-polls">You haven't created any polls yet.</p>
            ) : (
              <div className="polls-list">
                {polls.map((poll) => (
                  <div key={poll.id} className="poll-card">
                    <div className="poll-header">
                      <span className={`poll-status ${poll.status}`}>
                        {poll.status}
                      </span>
                    </div>
                    <div className="poll-options-list">
                      <div className="poll-option-item">
                        <span className="option-number">1.</span>
                        <span>{poll.option1}</span>
                      </div>
                      <div className="poll-option-item">
                        <span className="option-number">2.</span>
                        <span>{poll.option2}</span>
                      </div>
                      <div className="poll-option-item">
                        <span className="option-number">3.</span>
                        <span>{poll.option3}</span>
                      </div>
                      <div className="poll-option-item">
                        <span className="option-number">4.</span>
                        <span>{poll.option4}</span>
                      </div>
                      <div className="poll-option-item">
                        <span className="option-number">5.</span>
                        <span>{poll.option5}</span>
                      </div>
                    </div>
                    <div className="poll-share-section">
                      <div className="share-link-container">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/poll/${poll.shareableLink}`}
                          className="share-link-input"
                        />
                        <button
                          className="copy-link-btn"
                          onClick={() => handleCopyLink(poll.shareableLink)}
                          title="Copy link"
                        >
                          📋 Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <p>Please log in to view and create polls.</p>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Poll</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="poll-options">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="poll-option-group">
                    <label htmlFor={`option${num}`}>
                      Option {num}:
                    </label>
                    <input
                      type="text"
                      id={`option${num}`}
                      value={pollOptions[`option${num}`]}
                      onChange={(e) => handleOptionChange(e, num)}
                      placeholder={`Enter option ${num}`}
                      className="poll-option-input"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="publish-btn"
                onClick={handlePublishPoll}
              >
                Publish Poll
              </button>
              <button
                className="save-later-btn"
                onClick={handleSaveForLater}
              >
                Save for Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
