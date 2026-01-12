const calculateRCVResults = (ballots, pollOptions) => {
  // Convert poll options to a map for easy lookup
  const optionsMap = {
    1: pollOptions.option1,
    2: pollOptions.option2,
    3: pollOptions.option3,
    4: pollOptions.option4,
    5: pollOptions.option5,
  };

  // Track all rounds of voting
  const rounds = [];
  let remainingCandidates = [1, 2, 3, 4, 5];
  let activeBallots = ballots.map(ballot => ({
    choices: [
      ballot.firstChoice,
      ballot.secondChoice,
      ballot.thirdChoice,
      ballot.fourthChoice,
      ballot.fifthChoice,
    ]
  }));

  let roundNumber = 1;

  while (remainingCandidates.length > 1) {
    // Count first choice votes for remaining candidates
    const voteCounts = {};
    remainingCandidates.forEach(candidate => {
      voteCounts[candidate] = 0;
    });

    // Count votes for each remaining candidate based on highest preference
    activeBallots.forEach(ballot => {
      // Find the highest preference candidate that's still in the race
      for (let choice of ballot.choices) {
        if (remainingCandidates.includes(choice)) {
          voteCounts[choice]++;
          break;
        }
      }
    });

    // Calculate total votes in this round
    const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

    // Check if any candidate has majority (>50%)
    const majority = Math.floor(totalVotes / 2) + 1;
    let winner = null;

    for (let candidate of remainingCandidates) {
      if (voteCounts[candidate] >= majority) {
        winner = candidate;
        break;
      }
    }

    // Create round result
    const roundResult = {
      round: roundNumber,
      voteCounts: { ...voteCounts },
      totalVotes,
      majorityNeeded: majority,
      eliminated: null,
      winner: winner,
    };

    if (winner) {
      rounds.push(roundResult);
      break;
    }

    // No winner, eliminate candidate with fewest votes
    let minVotes = Math.min(...Object.values(voteCounts));
    let candidatesToEliminate = remainingCandidates.filter(
      candidate => voteCounts[candidate] === minVotes
    );

    // If there's a tie for last place, eliminate the first one alphabetically by option text
    if (candidatesToEliminate.length > 1) {
      candidatesToEliminate.sort((a, b) =>
        optionsMap[a].localeCompare(optionsMap[b])
      );
    }

    const eliminatedCandidate = candidatesToEliminate[0];
    roundResult.eliminated = eliminatedCandidate;

    rounds.push(roundResult);

    // Remove eliminated candidate
    remainingCandidates = remainingCandidates.filter(
      candidate => candidate !== eliminatedCandidate
    );

    roundNumber++;
  }

  // If we exit the loop with only one candidate, they win
  if (remainingCandidates.length === 1 && rounds[rounds.length - 1].winner === null) {
    const lastRound = rounds[rounds.length - 1];
    lastRound.winner = remainingCandidates[0];
  }

  // Calculate final results summary
  const finalRound = rounds[rounds.length - 1];
  const winner = finalRound.winner;

  // Get vote breakdown for each option across all rounds
  const optionSummary = {};
  [1, 2, 3, 4, 5].forEach(option => {
    optionSummary[option] = {
      optionNumber: option,
      text: optionsMap[option],
      isWinner: option === winner,
      finalVotes: finalRound.voteCounts[option] || 0,
      eliminatedInRound: null,
    };
  });

  // Mark when each option was eliminated
  rounds.forEach(round => {
    if (round.eliminated) {
      optionSummary[round.eliminated].eliminatedInRound = round.round;
    }
  });

  return {
    winner,
    winnerText: optionsMap[winner],
    totalBallots: ballots.length,
    rounds,
    optionSummary,
    completed: true,
  };
};

// Helper function to get first choice vote counts (useful for simple display)
const getFirstChoiceVotes = (ballots) => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  ballots.forEach(ballot => {
    if (ballot.firstChoice) {
      counts[ballot.firstChoice]++;
    }
  });

  return counts;
};

module.exports = {
  calculateRCVResults,
  getFirstChoiceVotes,
};
