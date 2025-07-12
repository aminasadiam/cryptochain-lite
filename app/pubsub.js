const redis = require('redis');

const CHANNEL = {
    TEST: 'test',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
};

class PubSub {
    constructor({blockchain, transactionPool}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();
    }

    async connect() {
        await this.publisher.connect();
        await this.subscriber.connect();

        this.subscribeToChannels();
    }

    async publish(channel, message) {
        await this.publisher.publish(channel, message);
    }

    async subscribeToChannels() {
        Object.values(CHANNEL).forEach(async (channel) => {
            await this.subscriber.subscribe(channel, (message) => {
                this.handleMessage(channel, message);
            });
        });
    }

    broadcastChain() {
        const message = JSON.stringify(this.blockchain.chain);
        this.publish(CHANNEL.BLOCKCHAIN, message);
    }

    broadcastTransaction(transaction) {
        const message = JSON.stringify(transaction);
        this.publish(CHANNEL.TRANSACTION, message);
    }

    handleMessage(channel, message) {
        const parsedMessage = JSON.parse(message);

        switch (channel) {
            case CHANNEL.TEST:
                console.log(`Received message on ${channel}: ${message}`);
                break;
            case CHANNEL.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, () => {
                    this.transactionPool.clearBlockchainTranactions({
                        chain: parsedMessage
                    });
                });
                break;
            case CHANNEL.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                break;
        }
    }
}

module.exports = PubSub;