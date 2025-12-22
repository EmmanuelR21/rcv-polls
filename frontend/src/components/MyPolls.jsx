import React, { useState } from "react";
import PollCard from "./PollCard";
import ConfirmationModal from "./ConfirmationModal";
import "./MyPollsStyles.css";

const MyPolls = () => {
  // Dummy data matching the wireframe
  const [polls, setPolls] = useState([
    { id: 1, title: "Goodest Dog", ballotCount: 3, imageUrl: "https://via.placeholder.com/150" },
    { id: 2, title: "Best Planet", ballotCount: 3, imageUrl: "https://via.placeholder.com/150" },
    { id: 3, title: "Best Ballot Order", ballotCount: 3, imageUrl: "https://via.placeholder.com/150" },
    { id: 4, title: "Karaoke Song", ballotCount: 3, imageUrl: "https://via.placeholder.com/150" },
    { id: 5, title: "Untitled", ballotCount: 3, imageUrl: "https://via.placeholder.com/150" },
  ]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    pollToDelete: null,
  });

  const handleDeleteClick = (poll) => {
    setModalState({
      isOpen: true,
      pollToDelete: poll,
    });
  };

  const handleConfirmDelete = () => {
    if (modalState.pollToDelete) {
      setPolls(polls.filter((poll) => poll.id !== modalState.pollToDelete.id));
    }
    setModalState({
      isOpen: false,
      pollToDelete: null,
    });
  };

  const handleCancelDelete = () => {
    setModalState({
      isOpen: false,
      pollToDelete: null,
    });
  };

  return (
    <div className="my-polls">
      <h1 className="my-polls-title">My Polls</h1>
      <div className="polls-grid">
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} onDelete={handleDeleteClick} />
        ))}
      </div>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        pollTitle={modalState.pollToDelete?.title || ""}
      />
    </div>
  );
};

export default MyPolls;
