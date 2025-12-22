import React from "react";
import { useNavigate } from "react-router-dom";
import "./PollCardStyles.css";

const PollCard = ({ poll, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/my-polls/${poll.id}`);
  };

  const handleDelete = () => {
    onDelete(poll);
  };

  return (
    <div className="poll-card">
      <div className="poll-image-container">
        <img
          src={poll.imageUrl}
          alt={poll.title}
          className="poll-image"
        />
        <div className="ballot-badge">{poll.ballotCount}</div>
      </div>
      <h3 className="poll-title">{poll.title}</h3>
      <div className="poll-actions">
        <button onClick={handleEdit} className="action-btn edit-btn" aria-label="Edit poll">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button onClick={handleDelete} className="action-btn delete-btn" aria-label="Delete poll">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PollCard;
