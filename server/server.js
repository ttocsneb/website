const express = require('express');
const bodyParser = require('body-parser');
const users = require('./user');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('../dist'));

app.post('/api/user/create', async (req, res) => {
    // Assert account details
    if (req.body.name == undefined
        || req.body.email == undefined
        || req.body.password == undefined) {
        return res.status(400).send({
            success: false,
            msg: "A name, email, and password is required"
        });
    }
    if (req.body.password.length < 8) {
        return res.status(400).send({
            success: false,
            msg: "The password must be at least 8 characters long"
        });
    }
    try {
        let user = await users.createUser(req.body.name, req.body.email, req.body.password, false);
        let token = await users.createToken(user);

        return res.status(400).send({
            success: true,
            token: {
                token: token.token,
                expires: token.expires,
            },
        });

    } catch (error) {
        if (typeof(error) === 'string') {
            return res.status(400).send({
                success: false,
                msg: error,
            });
        }
        console.error(error);
        return res.sendStatus(500);
    }

});

app.post('/api/user/login', async (req, res) => {
    // Assert parameters
    if (req.body.login == undefined
        || req.body.password == undefined) {
            return res.status(400).send({
                success: false,
                msg: "login, password is required",
            });
    }

    try {
        await users.cleanTokens();
        let user = await users.checkCreds(req.body.login, req.body.password);
        if (user == null) {
            return res.status(400).send({
                success: false,
                msg: "Invalid login or password",
            });
        }
        let token = await users.createToken(user);

        return res.send({
            success: true,
            token: {
                token: token.token,
                expires: token.expires,
            },
            user: {
                _id: user._id,
                name: user.name,
                isAdmin: user.isAdmin,
            }
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.get('/api/user/logout', async (req, res) => {
    if (req.headers['xtoken'] == undefined) {
        return res.status(400).send({
            success: false,
            msg: "You must be logged in to log out",
        });
    }
    try {
        await users.cleanTokens();
        await users.removeToken(req.headers['xtoken']);
        return res.send({
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.post('/api/comment/new', async (req, res) => {
    // Assert parameters
    if (req.headers['xtoken'] == undefined) {
        return res.status(400).send({
            success: false,
            msg: "You must be logged in",
        });
    }

    if (req.body.comment == undefined
        || req.body.post == undefined) {
            return res.status(400).send({
                success: false,
                msg: "comment and post is required",
            });
    }

    try {
        let user = await users.checkToken(req.headers['xtoken']);
        if (user == null) {
            return res.status(403).send({
                success: false,
                msg: "You must be logged in",
            });
        }

        let comment = new db.Comment({
            authorId: user._id,
            time: new Date().getTime(),
            comment: req.body.comment,
            postId: req.body.post,
        });
        await comment.save();
        let returned_comment = {
            author: {
                _id: comment.authorId,
                name: user.name,
            },
            comment: comment.comment,
            postId: comment.postId,
            time: comment.time,
            _id: comment._id,
        };
        return res.send({
            success: true,
            comment: returned_comment,
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.delete('/api/comment/delete/:id', async (req, res) => {
    if (req.headers['xtoken'] == undefined) {
        return res.status(400).send({
            success: false,
            msg: "You must be logged in",
        });
    }

    try {
        let user = await users.checkToken(req.headers['xtoken']);
        if (user == null) {
            return res.status(403).send({
                success: false,
                msg: "You must be logged in",
            });
        }

        let comment = await db.Comment.findById(req.params.id);
        if (comment == null || (comment.authorId != user._id && !user.isAdmin)) {
            return res.status(403).send({
                success: false,
                msg: "You are not allowed to remove that comment",
            });
        }
        await db.Comment.findByIdAndDelete(req.params.id);
        return res.send({
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.post('/api/comment/edit/:id', async (req, res) => {
    if (req.headers['xtoken'] == undefined) {
        return res.status(400).send({
            success: false,
            msg: "You must be logged in",
        });
    }

    if (req.body.comment == undefined) {
        return res.status(400).send({
            success: false,
            msg: "comment is required",
        });
    }

    try {
        let user = await users.checkToken(req.headers['xtoken']);
        if (user == null) {
            return res.status(403).send({
                success: false,
                msg: "You must be logged in",
            });
        }

        let comment = await db.Comment.findById(req.params.id);
        if (comment == null || comment.authorId != user._id) {
            return res.status(403).send({
                success: false,
                msg: "You are not allowed to edit that comment",
            });
        }
        let new_time = new Date().getTime();
        await db.Comment.findByIdAndUpdate(req.params.id, {
            comment: req.body.comment,
            time: new_time,
        });
        let returned_comment = {
            comment: req.body.comment,
            postId: comment.postId,
            time: new_time,
            _id: comment._id,
            author: {
                _id: user._id,
                name: user.name,
            },
        };
        return res.send({
            success: true,
            comment: returned_comment,
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.get('/api/post/:id', async (req, res) => {
    try {
        let comments = await db.Comment.find({ postId: req.params.id }).sort({ time: 'desc' });
        // Populate the users for each comment
        let comment_items = [];
        let users = {};
        for (let comment of comments) {
            if (users[comment.authorId] == undefined) {
                let user = await db.User.findById(comment.authorId);
                users[comment.authorId] = {
                    _id: user._id,
                    name: user.name,
                };
            }
            comment_items.push({
                comment: comment.comment,
                postId: comment.postId,
                time: comment.time,
                _id: comment._id,
                author: users[comment.authorId],
            });
        }
        return res.send({
            comments: comment_items,
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.listen(3000, () => console.log('Server listening on port 3000'));
