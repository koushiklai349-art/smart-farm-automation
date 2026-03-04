const { runtime } = require("../../store/runtime.store");

function evaluateSwarmVoting(deviceId, proposedAction) {

  runtime.swarmVotes = runtime.swarmVotes || {};

  if (!runtime.swarmVotes[proposedAction])
    runtime.swarmVotes[proposedAction] = 0;

  runtime.swarmVotes[proposedAction]++;

  const totalVotes =
    Object.values(runtime.swarmVotes)
      .reduce((a, b) => a + b, 0);

  if (totalVotes < 3)
    return false; // wait until enough votes

  const maxVoteAction =
    Object.entries(runtime.swarmVotes)
      .sort((a, b) => b[1] - a[1])[0][0];

  // Reset votes after decision
  runtime.swarmVotes = {};

  return maxVoteAction === proposedAction;
}

module.exports = {
  evaluateSwarmVoting
};