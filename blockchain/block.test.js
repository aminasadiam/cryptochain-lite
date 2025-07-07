const hexToBinary = require("hex-to-binary");
const Block = require("./block");
const { GENESIS_DATA, MINE_RATE } = require('../config');
const { cryptoHash } = require("../utils");

describe('Block', () => {
    const timestamp = 1234567890;
    const previousHash = '0000000000000000';
    const hash = 'abcdef1234567890';
    const data = 'Sample block data';
    const difficulty = 1;
    const nonce = 1;

    const block = new Block({ timestamp, previousHash, hash, data, difficulty, nonce });

    // Test block property assignment
    it('should create a block with the correct properties', () => {
        expect(block.timestamp).toBe(timestamp);
        expect(block.previousHash).toBe(previousHash);
        expect(block.hash).toBe(hash);
        expect(block.data).toBe(data);
        expect(block.difficulty).toBe(difficulty);
        expect(block.nonce).toBe(nonce);
    });

    describe('Genesis', () => {
        const genesisBlock = Block.genesis();

        // Ensure genesis returns a Block instance
        it('returns a block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        // Ensure genesis block matches GENESIS_DATA
        it('returns a block with the correct properties', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe("MineBlock", () => {
        const newData = "New block data";
        const lastBlock = Block.genesis();
        const minedBlock = Block.mineBlock({ previousBlock: lastBlock, data: newData });

        // Check if mined block is a Block instance
        it('returns a block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        // Validate mined block fields and proper linking
        it('returns a block with the correct properties', () => {
            expect(minedBlock.timestamp).toBeDefined();
            expect(minedBlock.previousHash).toBe(lastBlock.hash);
            expect(minedBlock.data).toBe(newData);
            expect(minedBlock.hash).toBeDefined();
            expect(Math.abs(minedBlock.difficulty - lastBlock.difficulty)).toBeLessThanOrEqual(1);
            expect(minedBlock.nonce).toBeDefined();
        });

        // Ensure hash is correctly generated from block fields
        it('creates a block with a valid hash', () => {
            expect(minedBlock.hash).toBe(
                cryptoHash(
                    minedBlock.timestamp,
                    lastBlock.hash,
                    newData,
                    minedBlock.difficulty,
                    minedBlock.nonce,
                )
            );
        });

        // Ensure hash meets the difficulty requirement (Proof of Work)
        it('sets a hash that matches difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
                .toEqual('0'.repeat(minedBlock.difficulty));
        });
    });

    describe('adjustDifficulty', () => {

        // If block is mined too fast, difficulty should increase
        it('raises the difficulty for a quickly mined block', () => {
            const now = Date.now();
            const lastBlock = new Block({
                timestamp: now,
                previousHash: 'foo-hash',
                hash: 'foo-hash',
                data: [],
                difficulty: 3,
                nonce: 0,
            });

            const minedBlock = Block.mineBlock({ previousBlock: lastBlock, data: 'foo' });

            expect(minedBlock.difficulty).toBe(lastBlock.difficulty + 1);
        });

        // If block is mined too slow, difficulty should decrease
        it('lowers the difficulty for a slowly mined block', () => {
            const lastBlock = new Block({
                timestamp: Date.now(),
                previousHash: 'foo-hash',
                hash: 'bar-hash',
                data: [],
                difficulty: 3,
                nonce: 0
            });

            const laterTimestamp = lastBlock.timestamp + MINE_RATE + 1000;

            const adjustedDifficulty = Block.adjustDifficulty({
                originalBlock: lastBlock,
                timestamp: laterTimestamp,
            });

            expect(adjustedDifficulty).toBe(lastBlock.difficulty - 1);
        });

        // Difficulty should never go below 1
        it('has a lower limit of 1 for difficulty', () => {
            const block = new Block({
                timestamp: Date.now(),
                previousHash: 'foo',
                hash: 'bar',
                data: [],
                difficulty: 1,
                nonce: 0
            });

            const adjustedDifficulty = Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + 10000
            });

            expect(adjustedDifficulty).toBe(1);
        });
    });

    describe('block linkage', () => {
        // Ensure blocks correctly reference the previous block's hash
        it('links the hash of the previous block correctly', () => {
            const genesisBlock = Block.genesis();
            const block1 = Block.mineBlock({ previousBlock: genesisBlock, data: 'block-1-data' });
            const block2 = Block.mineBlock({ previousBlock: block1, data: 'block-2-data' });

            expect(block1.previousHash).toBe(genesisBlock.hash);
            expect(block2.previousHash).toBe(block1.hash);
        });

        // Ensure mined block's hash is correctly calculated
        it('generates correct hash for the mined block', () => {
            const genesisBlock = Block.genesis();
            const block1 = Block.mineBlock({ previousBlock: genesisBlock, data: 'block-1-data' });

            const expectedHash = cryptoHash(
                block1.timestamp,
                genesisBlock.hash,
                'block-1-data',
                block1.difficulty,
                block1.nonce
            );

            expect(block1.hash).toBe(expectedHash);
        });
    });
});
