const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const logger = require('../logger.js');

exports.login = async (req, res, next) => {
    passport.authenticate('local', function (err, account) {
        req.logIn(account, function () {
            res.status(err ? 500 : 200).send(err ? err : account);
        });
    })(req, res, next);
}

exports.signup = async (req, res, next) => {
    const { name, email, password, password2 } = req.body;

    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        // TODO: use flashes to update this to the user
    } else {
        User.findOne({ $or:[{name: name}, {email: email}] }).then(user => {
            if (user) {
                // TODO: use flashes to update this to the user
                res.json({ success: false });
                errors.push({ msg: 'Email already exists' });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });
                newUser.save().then((user) => {
                    res.json({ success: true });
                }).catch(err => {
                    logger.warn(err)
                })
            }
        });
    }
}