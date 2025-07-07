const { GENESIS_DATA, MINE_RATE } = require("../config");
const { cryptoHash } = require("../utils");
const HexToBinary = require('hex-to-binary');

class Block {
    constructor({
        timestamp,
        previousHash,
        hash,
        data,
        difficulty,
        nonce
    }) {
        this.timestamp = timestamp;
        this.previousHash = previousHash;
        this.hash = hash;
        this.data = data;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }

    /**
     * Return the predefined genesis block
     */
    static genesis() {
        return new this(GENESIS_DATA);
    }

    /**
     * Mine a new block based on the previous block and data
     * Performs Proof of Work until a hash matching the difficulty is found
     */
    static mineBlock({ previousBlock, data }) {
        let hash, timestamp;
        const previousHash = previousBlock.hash;
        let difficulty = previousBlock.difficulty;
        let nonce = 0;

        // Proof of Work loop
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: previousBlock, timestamp });
            hash = cryptoHash(timestamp, previousHash, data, difficulty, nonce);
        } while (HexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({
            timestamp,
            previousHash,
            data,
            difficulty,
            nonce,
            hash
        });
    }

    /**
     * Dynamically adjust the difficulty
     * - If the block is mined too quickly, increase difficulty
     * - If it's too slow, decrease it (minimum 1)
     */
    static adjustDifficulty({ originalBlock, timestamp }) {
        let { difficulty } = originalBlock;

        if ((timestamp - originalBlock.timestamp) < MINE_RATE) {
            return difficulty + 1;
        }

        const decreasedDifficulty = difficulty - 1;
        return decreasedDifficulty < 1 ? 1 : decreasedDifficulty;
    }
}

module.exports = Block;
