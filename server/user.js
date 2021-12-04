const db = require('./db');
const passwords = require('./passwords');
const crypto = require('crypto');

/**
 * 
 * Create a new user
 * 
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} isAdmin 
 * @returns {db.User} created user
 */
async function createUser(name, email, password, isAdmin) {
    if (await db.User.count({ name }) > 0) {
        throw "A user with that name already exists";
    }
    if (await db.User.count({ email }) > 0) {
        throw "A user with that email already exists";
    }
    let hash = passwords.createPassword(password);
    let user = new db.User({
        name,
        email,
        password: hash,
        isAdmin,
    });
    await user.save();
    return user;
}

/**
 * Check the credentials of a user.
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {db.User?} the user if the password is correct
 */
async function checkCreds(username, password) {
    let user = await db.User.findOne({ name: username });
    if (user == null) {
        user = await db.User.findOne({ email: username });
    }
    if (user == null) {
        return null;
    }
    if (passwords.checkPassword(password, user.password)) {
        return user;
    }
    return null
}


/**
 * 
 * Create a new token
 * 
 * @param {db.User} user user to create the token for
 * @param {number?} lifetime time to live in seconds
 * @returns {db.Token} token
 */
async function createToken(user, lifetime) {
    if (lifetime == undefined) {
        lifetime = 7 * 24 * 3600; // Default 7 days
    }
    let time = new Date().getTime() + lifetime * 1000;
    let token = crypto.randomBytes(32 * 6 / 8).toString('base64');
    let t = new db.Token({
        userID: user._id,
        token: token,
        expires: time,
    });
    await t.save();
    return t;
}

/**
 * Check if a token is valid
 * 
 * @param {string} token 
 * @return {db.User?} user
 */
async function checkToken(token) {
    let found = await db.Token.findOne({ token });
    if (found == null) {
        return null;
    }
    if (found.expires < new Date().getTime()) {
        return null;
    }
    return await User.findById(found.userId);
}

/**
 * Remove the token
 * 
 * @param {string} token 
 * @returns number of removed tokens
 */
async function removeToken(token) {
    let result = await db.Token.deleteOne({ token });
    return result.deletedCount;
}

/**
 * Remove any expired tokens
 * 
 * @return number of removed tokens
 */
async function cleanTokens() {
    let now = new Date();
    let result = await db.Token.deleteMany({
        expires: { $lt: now.getTime() }
    });
    return result.deletedCount;
}

module.exports = {
    createUser,
    checkCreds,
    createToken,
    checkToken,
    cleanTokens,
    removeToken,
};