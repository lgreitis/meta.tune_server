/* eslint-disable no-unused-vars */
const passport = require("passport");
const User = require("../models/User");

exports.isloggedin = async (req, res, next) => {
    if (req.user) {
        res.status(200).send();
    }
    else {
        res.status(401).send();
    }
};

exports.login = async (req, res, next) => {
    passport.authenticate("local", function (err, account, message) {
        req.logIn(account, function () {
            res.status(err ? 500 : 200).send(message ? message : true);
        });
    })(req, res, next);
};

exports.signup = async (req, res, next) => {
    const { name, email, password, password2 } = req.body;

    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please enter all fields" });
    }

    if (password != password2) {
        errors.push({ msg: "Passwords do not match" });
    }

    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 characters" });
    }

    if (errors.length > 0) {
        res.status(400).json(errors);
    } else {
        User.findOne({ $or: [{ name: name }, { email: email }] }).then(user => {
            if (user) {
                errors.push({ msg: "Email or username already exists" });
                res.status(400).json(errors);
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });
                newUser.save().then((user) => {
                    res.status(201).send();
                }).catch(err => {
                    console.log(err);
                });
            }
        });
    }
};