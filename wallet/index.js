const { STATRING_BALANCE } = require("../config");
const { ec, cryptoHash } = require("../utils");

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