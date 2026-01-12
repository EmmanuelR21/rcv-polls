const { calculateRCVResults } = require('./utils/rcvCalculator');

// Test data - simulating ballots for a music genre poll
const testBallots = [
  {
    firstChoice: 1,  // Rock
    secondChoice: 3, // Hip Hop
    thirdChoice: 5,  // Jazz
    fourthChoice: 2, // Pop
    fifthChoice: 4   // Classical
  },
  {
    firstChoice: 3,  // Hip Hop
    secondChoice: 1, // Rock
    thirdChoice: 2,  // Pop
    fourthChoice: 5, // Jazz
    fifthChoice: 4   // Classical
  },
  {
    firstChoice: 5,  // Jazz
    secondChoice: 4, // Classical
    thirdChoice: 1,  // Rock
    fourthChoice: 2, // Pop
    fifthChoice: 3   // Hip Hop
  },
  {
    firstChoice: 1,  // Rock
    secondChoice: 2, // Pop
    thirdChoice: 3,  // Hip Hop
    fourthChoice: 4, // Classical
    fifthChoice: 5   // Jazz
  },
  {
    firstChoice: 2,  // Pop
    secondChoice: 1, // Rock
    thirdChoice: 3,  // Hip Hop
    fourthChoice: 4, // Classical
    fifthChoice: 5   // Jazz
  }
];

const pollOptions = {
  option1: 'Rock',
  option2: 'Pop',
  option3: 'Hip Hop',
  option4: 'Classical',
  option5: 'Jazz'
};

console.log('🎵 Testing RCV Calculation for Music Genre Poll');
console.log('================================================');
console.log(`Total ballots: ${testBallots.length}\n`);

const results = calculateRCVResults(testBallots, pollOptions);

console.log('🏆 WINNER:', results.winnerText);
console.log('📊 Total Ballots:', results.totalBallots);
console.log('\n📋 ROUND-BY-ROUND BREAKDOWN:');
console.log('===============================');

results.rounds.forEach(round => {
  console.log(`\n🗳️  Round ${round.round}:`);
  console.log(`   Majority needed: ${round.majorityNeeded}`);
  console.log('   Vote counts:');

  Object.entries(round.voteCounts).forEach(([option, votes]) => {
    const optionText = pollOptions[`option${option}`];
    console.log(`     ${optionText}: ${votes} votes`);
  });

  if (round.eliminated) {
    const eliminatedText = pollOptions[`option${round.eliminated}`];
    console.log(`   ❌ Eliminated: ${eliminatedText}`);
  }

  if (round.winner) {
    const winnerText = pollOptions[`option${round.winner}`];
    console.log(`   🏆 Winner: ${winnerText}`);
  }
});

console.log('\n📈 FINAL SUMMARY:');
console.log('==================');
Object.values(results.optionSummary).forEach(option => {
  const status = option.isWinner ? '🏆 WINNER' :
                 option.eliminatedInRound ? `❌ Eliminated in round ${option.eliminatedInRound}` :
                 '✅ Final round';
  console.log(`${option.text}: ${option.finalVotes} final votes - ${status}`);
});
