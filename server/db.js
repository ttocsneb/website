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


module.exports = {
    userSchema,
    commentSchema,
    tokenSchema,
    User,
    Comment,
    Token,
    disconnect() {
        return mongoose.disconnect();
    }
};
