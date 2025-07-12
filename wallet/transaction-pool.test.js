const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require("../blockchain")

describe('Transaction Pool', () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        senderWallet = new Wallet();
        transactionPool = new TransactionPool();
        transaction = new Transaction({
            senderWallet: senderWallet,
            recipient: "test-recipient",
            amount: 50
        });
    });


    describe("setTransaction()", () => {
        it("adds a transaction", () => {
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });

    describe("existingTransaction()", () => {
        it("returns an existing transaction given an input address", () => {
            transactionPool.setTransaction(transaction);
            expect(
                transactionPool.existingTransaction({
                    inputAddress: senderWallet.publicKey,
                })
            ).toBe(transaction);
        });
    });

    describe('validTransactions()', () => {
        let validTransactions, errorMock;

        beforeEach(() => {
            validTransactions = [];
            errorMock = jest.fn();

            global.console.error = errorMock;

            for (let i = 0; i < 10; i++) {
                transaction = new Transaction({
                    senderWallet, recipient: 'any-recipient', amount: 50
                });

                if (i % 3 === 0) {
                    transaction.input.amount = 99999;
                } else if (i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign('foo');
                } else {
                    validTransactions.push(transaction);
                }

                transactionPool.setTransaction(transaction);
            }
        });

        it('retuens valid transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });

        it('log errors for the invalid transacrions', () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('clear()', () => {
        it('clears the transactions', () => {
            transactionPool.clear();
            expect(transactionPool.transactionMap).toEqual({});
        });
    });

    describe('clearBlockchainTranactions()', () => {
        it('clear the pool of any existing blockchain tranactions', () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for (let i = 0; i < 6; i++) {
                const transaction = new Wallet().createTransaction({
                    recipient: 'foo',
                    amount: 20
                });

                transactionPool.setTransaction(transaction);

                if (i%2 === 0) {
                    blockchain.addBlock({data: [transaction]})
                } else {
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }

            transactionPool.clearBlockchainTranactions({chain: blockchain.chain});
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
});