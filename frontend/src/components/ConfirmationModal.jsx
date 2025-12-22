import React from "react";
import "./ConfirmationModalStyles.css";

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, pollTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Delete Poll</h2>
        <p>Are you sure you want to delete "{pollTitle}"?</p>
        <div className="modal-buttons">
          <button onClick={onCancel} className="modal-btn cancel-btn">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-btn confirm-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
