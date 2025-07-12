const Transaction = require('./transaction');
const Wallet = require('../wallet');
const { verifySignature } = require('../utils');
const e = require('express');
const { REWARD_INPUT, MINITNG_REWARD } = require('../config');

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-address';
        amount = 50;
        transaction = new Transaction({
            senderWallet,
            recipient,
            amount
        });
    });

    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('output map', () => {
        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance for the sender', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
                senderWallet.balance - amount
            );
        });
    });

    describe('input', () => {
        it('has an `input`', () => {
            expect(transaction).toHaveProperty('input');
        });

        it('has a `timestamp` in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it('sets the `amount` to the sender\'s balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('sets the `address` to the sender\'s public key', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('signs the input with the sender\'s key', () => {
            expect(verifySignature({
                publicKey: senderWallet.publicKey,
                data: transaction.outputMap,
                signature: transaction.input.signature
            })).toBe(true);
        });
    });

    describe('validTransaction()', () => {
        let errorMock;

        beforeEach(() => {
            errorMock = jest.fn();
            global.console.error = errorMock;
        });

        describe('when the transaction is valid', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        });
        describe('when the transaction is invalid', () => {
            describe('and the outputMap value is invalid', () => {
                it('returns false', () => {
                    transaction.outputMap[recipient] = 999999;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('and the input signature is invalid', () => {
                it('returns false', () => {
                    transaction.input.signature = new Wallet().sign('data');
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });
    });

    describe('update()', () => {
        let originalSignature, originalSenderOutput, newRecipient, newAmount;

        describe('and the amount is not valid', () => {
            it('throws an error', () => {
                expect(() => {
                    transaction.update({ senderWallet, recipient: 'foo', amount: 99999 })
                }).toThrow('amount exceeds balance');
            });
        });

        describe('and the amount is valid', () => {
            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                newRecipient = "New-Recipient-Address";
                newAmount = 50

                transaction.update({
                    senderWallet, recipient: newRecipient, amount: newAmount
                });
            });

            it('outputs the amount to the next recipient', () => {
                expect(transaction.outputMap[newRecipient]).toEqual(newAmount);
            });

            it('subtracts the amount from the original sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - newAmount);
            });

            it('maintains a total output that matches the input amount', () => {
                expect(Object.values(transaction.outputMap).reduce(
                    (total, outputAmount) => total + outputAmount
                )).toEqual(transaction.input.amount);
            });

            it('resign the transaction', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });

            describe('and another update for the same recipient', () => {
                let addedAmount;

                beforeEach(()=> {
                    addedAmount = 80;
                    transaction.update({
                        senderWallet,
                        recipient: newRecipient,
                        amount: addedAmount
                    });
                });

                it('add to the recipient amount', () => {
                    expect(transaction.outputMap[newRecipient]).toEqual(newAmount + addedAmount);
                })

                it('subtracts the amount from the original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - newAmount - addedAmount);
                })
            })
        });
    });

    describe('rewardTransaction()', () => {
        let rewardTransaction, minerWallet;

        beforeEach(() => {
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({minerWallet});
        });

        it('creates transactions with the reward input', () => {
           expect(rewardTransaction.input).toEqual(REWARD_INPUT); 
        });

        it('creates one transaction for miner with the `MINING_REWARD`', () => {
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINITNG_REWARD);
        });
    });
});