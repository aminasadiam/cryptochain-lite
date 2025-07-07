const redis = require('redis');

const CHANNEL = {
    TEST: 'test',
    BLOCKCHAIN: 'BLOCKCHAIN',
};

class PubSub {
    constructor({blockchain}) {
        this.blockchain = blockchain;
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
                if (channel === CHANNEL.TEST) {
                    console.log(`Received message on ${channel}: ${message}`);
                } else if (channel === CHANNEL.BLOCKCHAIN) {
                    const chain = JSON.parse(message);
                    this.blockchain.replaceChain(chain);
                }
            });
        });
    }

    broadcastChain() {
        const message = JSON.stringify(this.blockchain.chain);
        this.publish(CHANNEL.BLOCKCHAIN, message);
    }
}

module.exports = PubSub;