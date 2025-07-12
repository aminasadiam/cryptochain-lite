const express = require('express');
const Blockchain = require('./blockchain');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet/index');
const TransactionMiner = require('./app/transacrion-miner');
const PubSub = require('./app/pubsub');
const tcpPortUsed = require('tcp-port-used');
const { default: axios } = require('axios');

const app = express();
app.use(express.json());

const transactionPool = new TransactionPool();
const wallet = new Wallet();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({blockchain, transactionPool, wallet, pubsub});

setTimeout(() => {
    pubsub.connect()
        .then(() => {
            console.log('PubSub connected');
            pubsub.broadcastChain();
        })
        .catch(err => {
            console.error('Error connecting PubSub:', err);
        });
}, 1000);

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();
    res.redirect('/api/blocks');
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res.status(400).json({ error: 'Data is required to mine a block' });
    }

    blockchain.addBlock(data);
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

app.get('/api/transact-pool', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.post('/api/transact', (req, res) => {
    let { amount, recipient } = req.body;
    amount = parseInt(amount);

    let transaction = transactionPool.existingTransaction({
        inputAddress: wallet.publicKey,
    });

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({ recipient, amount });
        }
    } catch (error) {
        return res.json({ type: "error", message: error.message });
    }

    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
    res.json({ transaction });
});

const rootPort = 3000;
let PORT = 3000;

const syncOnConenct = async () => {
    let responce = await axios.get(`http://localhost:${rootPort}/api/blocks`);
    blockchain.replaceChain(responce.data);

    responce = await axios.get(`http://localhost:${rootPort}/api/transact-pool`);
    transactionPool.setMap(responce.data);
}

tcpPortUsed.check(PORT, '127.0.0.1')
    .then(used => {
        if (used) {
            console.log(`Port ${PORT} is already in use. Trying another port...`);
            PORT += Math.ceil(Math.random() * 1000);
        }
        app.listen(PORT, () => {
            console.log('Server is running on port ' + PORT);
            if (PORT !== rootPort) {
                syncOnConenct();
            }
        });
    });