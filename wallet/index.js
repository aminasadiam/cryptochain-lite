const { STATRING_BALANCE } = require("../config");
const { ec } = require("../utils");

const keyPair = ec.genKeyPair();

class Wallet {
    constructor() {
        this.balance = STATRING_BALANCE;
        this.publicKey = keyPair.getPublic("hex");
    }
}

module.exports = Wallet;