const Transaction = require("./transaction");

class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        if (!(transaction instanceof Transaction)) {
            const restoredTransaction = new Transaction({
                senderWallet: {
                    publicKey: transaction.input.address,
                    balance: transaction.input.amount,
                    sign: () => transaction.input.signature
                },
                recipient: Object.keys(transaction.outputMap)
                    .find(key => key !== transaction.input.address),
                amount: transaction.outputMap[Object.keys(transaction.outputMap)
                    .find(key => key !== transaction.input.address)]
            });
            
            Object.assign(restoredTransaction, transaction);
            transaction = restoredTransaction;
        }
        this.transactionMap[transaction.id] = transaction;
    }

    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap);
        return transactions.find(transaction => transaction.input.address === inputAddress);
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }
}

module.exports = TransactionPool;