const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const db = require('./db');
const passwords = require('./passwords');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.post('/api/user/create', async (req, res) => {
    // Assert account details
    if (req.body.name == undefined
        || req.body.email == undefined
        || req.body.password == undefined) {
        return res.send({
            success: false,
            msg: "A name, email, and password is required"
        });
    }
    if (req.body.password.length < 8) {
        return res.send({
            success: false,
            msg: "The password must be at least 8 characters long"
        });
    }
    try {
        if (await db.User.count({ name: req.body.name }) > 0) {
            return res.send({
                success: false,
                msg: "A user with that name already exists"
            });
        }
        if (await db.User.count({ email: req.body.email }) > 0) {
            return res.send({
                success: false,
                msg: "A user with that email already exists"
            });
        }

        const user = new db.User({
            name: req.body.name,
            email: req.body.email,
            password: passwords.createPassword(req.body.password),
            isAdmin: false,
        });
        await user.save();

        return res.send({
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }

});

app.listen(3000, () => console.log('Server listening on port 3000'));
