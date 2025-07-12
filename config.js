let INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000; // milliseconds
const STATRING_BALANCE = 1000;

const REWARD_INPUT = { address: "*authorized-reward*" };
const MINITNG_REWARD = 50;

const GENESIS_DATA = {
    timestamp: 1,
    previousHash: '0',
    hash: '047da5364aad58b4a6aedeb609fd35817131090881a9d0448b18a110a41c348a',
    data: "Gemesis Block",
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0
};
  
module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STATRING_BALANCE,
    REWARD_INPUT,
    MINITNG_REWARD
};