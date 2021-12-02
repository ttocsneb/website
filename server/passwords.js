const crypto = require('crypto');

// crypto.createHash('sha256');

/**
 * 
 * Generate a hash of the password that can be stored in a database
 * 
 * @param {string} password Password to encrypt
 * @param {string?} pepper Optional secret to keep passwords more secure (This should not be stored in the database)
 * 
 * @returns {string}
 */
function createPassword(password, pepper) {
    if (pepper == undefined) {
        pepper = '';
    }
    const salt_length = 32;
    let salt = crypto.randomBytes(Math.round(salt_length * 6 / 8)).toString('base64');
    let hash = crypto.createHash('sha256').update(password + salt + pepper).digest('base64');
    return `${hash}&${salt}`;
}

/**
 * 
 * Check if the provided password is correct
 * 
 * @param {string} password Password to check
 * @param {string} hash The hashed password
 * @param {string?} pepper Optional secret to keep passwords more secure (This must be the same secret used when creating the password)
 * 
 * @returns {boolean} whether the password is correct
 */
function checkPassword(password, hash, pepper) {
    if (pepper == undefined) {
        pepper = '';
    }
    let hash_salt = hash.split('&', 2);
    let test_hash = crypto.createHash('sha256').update(password + hash_salt[1] + pepper).digest('base64');
    return hash_salt[0] == test_hash;
}

module.exports = {
    createPassword,
    checkPassword,
};