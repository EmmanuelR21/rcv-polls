import React from "react";
import { useParams } from "react-router-dom";
import "./PollDetailStyles.css";

const PollDetail = () => {
  const { pollId } = useParams();

  return (
    <div className="poll-detail">
      <h1>Poll Detail</h1>
      <p>This is a placeholder page for poll ID: {pollId}</p>
      <p>Poll editing functionality will be implemented here.</p>
    </div>
  );
};

export default PollDetail;
