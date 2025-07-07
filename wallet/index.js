const { STATRING_BALANCE } = require("../config");
const { ec } = require("../utils");
const cryptoHash = require("../utils/crypto-hash");

class Wallet {
    constructor() {
        this.balance = STATRING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode("hex");
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }
}

module.exports = Wallet;