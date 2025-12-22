/**
 * Test file for MyPolls component
 * 
 * To run these tests, install the following dependencies:
 * npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom babel-jest
 * 
 * Then add a jest.config.js file with appropriate configuration for React and JSX.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MyPolls from "./MyPolls";

// Mock PollCard and ConfirmationModal to isolate MyPolls component testing
jest.mock("./PollCard", () => {
  return function MockPollCard({ poll, onDelete }) {
    return (
      <div data-testid={`poll-card-${poll.id}`}>
        <span>{poll.title}</span>
        <button onClick={() => onDelete(poll)}>Delete</button>
      </div>
    );
  };
});

jest.mock("./ConfirmationModal", () => {
  return function MockConfirmationModal({ isOpen, onConfirm, onCancel, pollTitle }) {
    if (!isOpen) return null;
    return (
      <div data-testid="confirmation-modal">
        <p>Delete {pollTitle}?</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>Confirm Delete</button>
      </div>
    );
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("MyPolls Component", () => {
  test("renders My Polls title", () => {
    renderWithRouter(<MyPolls />);
    const title = screen.getByText("My Polls");
    expect(title).toBeInTheDocument();
  });

  test("renders all poll cards from dummy data", () => {
    renderWithRouter(<MyPolls />);
    
    expect(screen.getByTestId("poll-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("poll-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("poll-card-3")).toBeInTheDocument();
    expect(screen.getByTestId("poll-card-4")).toBeInTheDocument();
    expect(screen.getByTestId("poll-card-5")).toBeInTheDocument();
  });

  test("displays poll titles correctly", () => {
    renderWithRouter(<MyPolls />);
    
    expect(screen.getByText("Goodest Dog")).toBeInTheDocument();
    expect(screen.getByText("Best Planet")).toBeInTheDocument();
    expect(screen.getByText("Best Ballot Order")).toBeInTheDocument();
    expect(screen.getByText("Karaoke Song")).toBeInTheDocument();
    expect(screen.getByText("Untitled")).toBeInTheDocument();
  });

  test("opens confirmation modal when delete button is clicked", () => {
    renderWithRouter(<MyPolls />);
    
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
    expect(screen.getByText(/Delete Goodest Dog\?/)).toBeInTheDocument();
  });

  test("closes confirmation modal when cancel is clicked", () => {
    renderWithRouter(<MyPolls />);
    
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
    
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    
    expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
  });

  test("deletes poll when confirmation is confirmed", () => {
    renderWithRouter(<MyPolls />);
    
    const initialCards = screen.getAllByTestId(/poll-card-/);
    expect(initialCards).toHaveLength(5);
    
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);
    
    const confirmButton = screen.getByText("Confirm Delete");
    fireEvent.click(confirmButton);
    
    // Poll should be removed
    expect(screen.queryByTestId("poll-card-1")).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/poll-card-/)).toHaveLength(4);
  });

  test("confirmation modal displays correct poll title", () => {
    renderWithRouter(<MyPolls />);
    
    const deleteButtons = screen.getAllByText("Delete");
    // Click delete on "Best Planet" (second poll)
    fireEvent.click(deleteButtons[1]);
    
    expect(screen.getByText(/Delete Best Planet\?/)).toBeInTheDocument();
  });
});
