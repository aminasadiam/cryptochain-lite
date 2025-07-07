const crypto = require('crypto');

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256');

    const serializedInputs = inputs.map(input => {
        if (typeof input === 'object' && input !== null) {
            return JSON.stringify(sortObjectKeys(input));
        }
        return input;
    }).sort().join(' ');

    hash.update(serializedInputs);
    return hash.digest('hex');
};

const sortObjectKeys = obj => {
    return Object.keys(obj).sort().reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
    }, {});
};


module.exports = cryptoHash;
