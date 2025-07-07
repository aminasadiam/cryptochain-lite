const Block = require('./block');
const Blockchain = require('.');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
    });

    // Basic structure test
    it('contains a `chain` array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    // Genesis block test
    it('initializes with a genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    // Block addition test
    it('adds a new block to the chain', () => {
        const newData = 'foo';
        blockchain.addBlock({ data: newData });

        const lastBlock = blockchain.chain[blockchain.chain.length - 1];
        expect(lastBlock instanceof Block).toBe(true);
        expect(lastBlock.data).toEqual(newData);
    });

    describe('isValidChain', () => {
        describe('when the chain does not start with the genesis block', () => {
            // Invalid genesis block
            it('returns false', () => {
                blockchain.chain[0] = { data: 'fake-genesis' };
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({ data: 'block1' });
                blockchain.addBlock({ data: 'block2' });
                blockchain.addBlock({ data: 'block3' });
            });

            // Invalid previousHash link
            it('returns false if previousHash is invalid', () => {
                blockchain.chain[2].previousHash = 'fake-hash';
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });

            // Tampered data
            it('returns false if a block has invalid data', () => {
                blockchain.chain[1].data = 'tampered-data';
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });

            // Valid chain
            it('returns true if the chain is valid', () => {
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
            });
        });
    });

    describe('replaceChain', () => {
        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();
            global.console.error = errorMock;
            global.console.log = logMock;
        });

        // Reject shorter chain
        it('does not replace the chain with a shorter one', () => {
            newChain[0] = { new: 'chain' };
            blockchain.replaceChain(newChain.chain);
            expect(blockchain.chain).toEqual(originalChain);
        });

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data: 'block1' });
                newChain.addBlock({ data: 'block2' });
                newChain.addBlock({ data: 'block3' });
            });

            // Reject invalid longer chain
            it('does not replace the chain if the new one is invalid', () => {
                newChain.chain[2].data = 'invalid-data';
                blockchain.replaceChain(newChain.chain);
                expect(blockchain.chain).toEqual(originalChain);
            });

            // Accept valid longer chain
            it('replaces the chain if the new one is valid', () => {
                blockchain.replaceChain(newChain.chain);
                expect(blockchain.chain).toEqual(newChain.chain);
            });
        });
    });
});
