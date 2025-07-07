const Block = require("./block");
const cryptoHash = require("../utils/crypto-hash");
const HexToBinary = require("hex-to-binary"); // Used for precise difficulty validation

class Blockchain {
    constructor() {
        // Initialize the chain with the genesis block
        this.chain = [Block.genesis()];
    }

    /**
     * Add a new block to the chain with the given data
     */
    addBlock({ data }) {
        const previousBlock = this.chain[this.chain.length - 1];

        const block = Block.mineBlock({
            previousBlock,
            data,
        });

        this.chain.push(block);
        return block;
    }

    /**
     * Validate an entire blockchain
     * - Must start with a valid genesis block
     * - Each block must correctly reference previous hash
     * - Hash must be valid based on block contents
     * - Hash must meet the difficulty criteria
     * - Difficulty should only adjust by ±1 from previous block
     */
    static isValidChain(chain) {
        // Check if the first block is exactly the genesis block
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];

            // Ensure the block links correctly to the previous one
            if (block.previousHash !== lastBlock.hash) {
                return false;
            }

            // Recalculate hash and compare to stored hash
            const validatedHash = cryptoHash(
                block.timestamp,
                block.previousHash,
                block.data,
                block.difficulty,
                block.nonce
            );

            if (block.hash !== validatedHash) {
                return false;
            }

            // Validate hash meets proof-of-work requirement (binary-based)
            if (HexToBinary(block.hash).substring(0, block.difficulty) !== '0'.repeat(block.difficulty)) {
                return false;
            }

            // Prevent difficulty manipulation: must adjust by only ±1
            if (Math.abs(lastBlock.difficulty - block.difficulty) > 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * Replace current chain with a new one
     * - Only if the new chain is longer
     * - And the new chain is valid
     */
    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.error("Received chain is not longer than the current chain.");
            return;
        }

        if (!Blockchain.isValidChain(newChain)) {
            console.error("Received chain is not valid.");
            return;
        }

        console.log("Replacing blockchain with the new chain.");
        this.chain = newChain;
    }
}

module.exports = Blockchain;
