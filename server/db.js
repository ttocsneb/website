const mongoose = require('mongoose');
const crypto = require('crypto');

mongoose.connect('mongodb://localhost:27017/projects', {
    useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isAdmin: Boolean,
});

const tokenSchema = new mongoose.Schema({
    userId: String,
    token: String,
    expires: Number,
});

const commentSchema = new mongoose.Schema({
    authorId: String,
    time: Number,
    comment: String,
    postId: String,
});

const User = mongoose.model('User', userSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Token = mongoose.model('Token', tokenSchema);

/**
 * 
 * Create a new token
 * 
 * @param {User} user user to create the token for
 * @param {number} lifetime time to live in seconds
 * @returns {Token} token
 */
async function createToken(user, lifetime) {
    let time = new Date().getTime() + lifetime * 1000;
    let token = crypto.randomBytes(128 / 8 * 6).toString('base64');
    let t = new Token({
        userID: user._id,
        token: token,
        expiers: time,
    });
    await t.save();
    return t;
}

/**
 * Check if a token is valid
 * 
 * @param {string} token 
 * @return {User?} user
 */
async function checkToken(token) {
    let found = await Token.findOne({ token });
    if (found == null) {
        return null;
    }
    if (found.expires < new Date().getTime()) {
        return null;
    }
    return await User.findById(found.userId);
}

module.exports = {
    userSchema,
    commentSchema,
    tokenSchema,
    User,
    Comment,
    Token,
    createToken,
    disconnect() {
        return mongoose.disconnect();
    }
};
