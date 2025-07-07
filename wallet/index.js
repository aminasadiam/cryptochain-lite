const { STATRING_BALANCE } = require("../config");

class Wallet {
    constructor() {
        this.balance = STATRING_BALANCE;
    }
}

module.exports = Wallet;