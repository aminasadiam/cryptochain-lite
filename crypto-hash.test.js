const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
    it('generates a SHA-256 hash', () => {
        expect(cryptoHash('foo')).toEqual(
            '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'
        );
    });

    it('produces the same hash with the same input in different orders', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(
            cryptoHash('three', 'two', 'one')
        );
    });

    it('produces a unique hash for different inputs', () => {
        expect(cryptoHash('one', 'two')).not.toEqual(cryptoHash('three', 'four'));
    });

    it('produces the same hash for objects with same properties in different order', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 2, a: 1 };

        expect(cryptoHash(obj1)).not.toBeUndefined();
       expect(cryptoHash(obj1)).toEqual(cryptoHash(obj2));
    });
});