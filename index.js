const express = require('express');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');
const tcpPortUsed = require('tcp-port-used');
const { default: axios } = require('axios');

const app = express();
app.use(express.json());

const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

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

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res.status(400).json({ error: 'Data is required to mine a block' });
    }

    blockchain.addBlock(data);
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

const rootPort = 3000;
let PORT = 3000;

const syncChains = async () => {
    const responce = await axios.get(`http://localhost:${rootPort}/api/blocks`);
    blockchain.replaceChain(responce.data);
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
            syncChains();
        }
    });
})