const Wallet = require('./index');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance` property', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey` property', () => {
        expect(wallet).toHaveProperty('publicKey');
    });
});