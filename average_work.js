const Blockchain = require('./blockchain');
const blockchain = new Blockchain();

blockchain.addBlock({data: 'New Block Data'});

let prevTimestamp, nextTimestamp, nextBlock, timeDifference, average;
const times = [];

for (let i = 0; i < 10000; i++) {
    prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;
    blockchain.addBlock({data: `Block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length - 1];
    nextTimestamp = nextBlock.timestamp;

    timeDifference = nextTimestamp - prevTimestamp;
    times.push(timeDifference);

    average = times.reduce((total, num) => total + num, 0) / times.length;
    console.log(`Time to mine block ${i}: ${timeDifference}ms, Average: ${average}ms`);
}