const Wallet = require('./index');
const { verifySignature } = require('../utils');
const Transaction = require('./transaction');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance` property', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey` property', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'test-data';

        it('verifies a signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: wallet.sign(data)
            })).toBe(true);
        });
        it('does not verify an invalid signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: new Wallet().sign(data)
            })).toBe(false);
        });
    });

    describe('createTransaction', () => {
        describe('and the amount exceedn the balance', () => {
            it('throws an error', () => {
                expect(() => {
                    wallet.createTransaction({
                        amount: 999999,
                        recipient: 'recipient-public-key'
                    });
                }).toThrow('Amount exceeds balance');
            });
        });
        describe('and the amount is valid', () => {
            let transaction, recipient, amount;

            beforeEach(() => {
                recipient = 'recipient-public-key';
                amount = 50;
                transaction = wallet.createTransaction({
                    amount,
                    recipient
                });
            });

            it('create an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });
            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });
            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });
    });
});