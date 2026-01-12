import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./HomeStyles.css";
import { API_URL } from "../shared";

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [polls, setPolls] = useState([]);
  const [publicPolls, setPublicPolls] = useState([]);

  const [isLoadingPolls, setIsLoadingPolls] = useState(false);
  const [isLoadingPublicPolls, setIsLoadingPublicPolls] = useState(false);

  const [pollOptions, setPollOptions] = useState({
    title: "",
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

  // Fetch public polls by other users
  const fetchPublicPolls = useCallback(async () => {
    if (!user) return;

    setIsLoadingPublicPolls(true);
    try {
      const response = await axios.get(`${API_URL}/api/polls/public`, {
        withCredentials: true,
      });
      const allPublicPolls = response.data.polls || [];
      setPublicPolls(allPublicPolls);
    } catch (error) {
      console.error("Error fetching public polls:", error);
      setPublicPolls([]);
    } finally {
      setIsLoadingPublicPolls(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPolls();
    fetchPublicPolls();
  }, [fetchPolls, fetchPublicPolls]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form when closing
    setPollOptions({
      title: "",
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
    // Validate that title and all options are filled
    if (
      !pollOptions.title ||
      !pollOptions.option1 ||
      !pollOptions.option2 ||
      !pollOptions.option3 ||
      !pollOptions.option4 ||
      !pollOptions.option5
    ) {
      alert("Please fill in the title and all 5 poll options");
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
        },
      );
      handleCloseModal();
      // Refresh polls list
      fetchPolls();
      fetchPublicPolls();
    } catch (error) {
      console.error("Error creating poll:", error);
      alert(
        error.response?.data?.error ||
          "Failed to create poll. Please try again.",
      );
    }
  };

  const handleSaveForLater = async () => {
    // Validate that title and all options are filled
    if (
      !pollOptions.title ||
      !pollOptions.option1 ||
      !pollOptions.option2 ||
      !pollOptions.option3 ||
      !pollOptions.option4 ||
      !pollOptions.option5
    ) {
      alert("Please fill in the title and all 5 poll options");
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
        },
      );
      handleCloseModal();
      // Refresh polls list
      fetchPolls();
      fetchPublicPolls();
    } catch (error) {
      console.error("Error saving poll:", error);
      alert(
        error.response?.data?.error || "Failed to save poll. Please try again.",
      );
    }
  };

  const handleEndPoll = async (shareableLink, event) => {
    event.stopPropagation();

    if (
      !confirm(
        "Are you sure you want to end this poll? This action cannot be undone and will make results available.",
      )
    ) {
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/api/polls/${shareableLink}/end`,
        {},
        {
          withCredentials: true,
        },
      );

      // Refresh polls list to show updated status
      fetchPolls();
      fetchPublicPolls();
      alert("Poll has been ended successfully!");
    } catch (error) {
      console.error("Error ending poll:", error);
      alert(
        error.response?.data?.error || "Failed to end poll. Please try again.",
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

  const handlePollClick = (shareableLink) => {
    navigate(`/poll/${shareableLink}`);
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
                  <div
                    key={poll.id}
                    className="poll-card user-poll clickable-poll"
                    onClick={() => handlePollClick(poll.shareableLink)}
                  >
                    <div className="poll-header">
                      <h3 className="poll-title">{poll.title}</h3>
                      <span className={`poll-status ${poll.status}`}>
                        {poll.status}
                      </span>
                    </div>
                    <div className="owner-indicator">
                      <span className="owner-badge">👤 Your Poll</span>
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
                        <div className="share-link-row">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/poll/${poll.shareableLink}`}
                            className="share-link-input"
                          />
                        </div>
                        <div className="share-buttons-row">
                          <button
                            className="copy-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(poll.shareableLink, e);
                            }}
                            title="Copy link"
                          >
                            📋 Copy Link
                          </button>
                          {poll.status === "published" && (
                            <button
                              className="end-poll-btn"
                              onClick={(e) =>
                                handleEndPoll(poll.shareableLink, e)
                              }
                              title="End poll"
                            >
                              🏁 End Poll
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="polls-section public-polls-section">
            <h2>Published Polls by Others</h2>
            {isLoadingPublicPolls ? (
              <p>Loading public polls...</p>
            ) : publicPolls.length === 0 ? (
              <p className="no-polls">No public polls available.</p>
            ) : (
              <div className="polls-list">
                {publicPolls
                  .filter((poll) => poll.status === "published")
                  .map((poll) => (
                    <div
                      key={poll.id}
                      className="poll-card public-poll clickable-poll"
                      onClick={() => handlePollClick(poll.shareableLink)}
                    >
                      <div className="poll-header">
                        <h3 className="poll-title">{poll.title}</h3>
                        <span className="poll-status published">Published</span>
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
                          <div className="share-link-row">
                            <input
                              type="text"
                              readOnly
                              value={`${window.location.origin}/poll/${poll.shareableLink}`}
                              className="share-link-input"
                            />
                          </div>
                          <div className="share-buttons-row">
                            <button
                              className="copy-link-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLink(poll.shareableLink, e);
                              }}
                              title="Copy link"
                            >
                              📋 Copy Link
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="polls-section ended-polls-section">
            <h2>Ended Polls by Others</h2>
            {isLoadingPublicPolls ? (
              <p>Loading ended polls...</p>
            ) : publicPolls.filter((poll) => poll.status === "ended").length ===
              0 ? (
              <p className="no-polls">No ended polls available.</p>
            ) : (
              <div className="polls-list">
                {publicPolls
                  .filter((poll) => poll.status === "ended")
                  .map((poll) => (
                    <div
                      key={poll.id}
                      className="poll-card ended-poll clickable-poll"
                      onClick={() => handlePollClick(poll.shareableLink)}
                    >
                      <div className="poll-header">
                        <h3 className="poll-title">{poll.title}</h3>
                        <span className="poll-status ended">Ended</span>
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
                          <div className="share-link-row">
                            <input
                              type="text"
                              readOnly
                              value={`${window.location.origin}/poll/${poll.shareableLink}`}
                              className="share-link-input"
                            />
                          </div>
                          <div className="share-buttons-row">
                            <button
                              className="copy-link-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLink(poll.shareableLink, e);
                              }}
                              title="Copy link"
                            >
                              📋 Copy Link
                            </button>
                          </div>
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
                <div className="poll-option-group">
                  <label htmlFor="pollTitle">Poll Title:</label>
                  <input
                    type="text"
                    id="pollTitle"
                    value={pollOptions.title}
                    onChange={(e) =>
                      setPollOptions((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter poll title"
                    className="poll-option-input"
                  />
                </div>
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="poll-option-group">
                    <label htmlFor={`option${num}`}>Option {num}:</label>
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
              <button className="publish-btn" onClick={handlePublishPoll}>
                Publish Poll
              </button>
              <button className="save-later-btn" onClick={handleSaveForLater}>
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
