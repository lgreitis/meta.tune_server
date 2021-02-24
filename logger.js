module.exports = new function () {
    const color = require('colors');
    const dateFormat = require('dateformat');
    const util = require('util');

    this.log = function (text, args) {
        args = args || [];
        console.log(convert("[LOG]   ", text, arguments, args).green);
    };

    this.info = function (text, args) {
        args = args || [];
        this.log(text, args);
    };

    this.warn = function (text, args) {
        args = args || [];
        console.log(convert("[WARN]  ", text, arguments, args).red);
    };

    this.debug = function (text, args) {
        args = args || [];
        console.log(convert("[DEBUG] ", text, arguments, args).yellow);
    };

    var convert = function (prefix, text, args) {
        return util.format("%s %s> %s", prefix, getDate(),
            util.format.apply(text, args)
                .replaceLast("[]", ""))
            .replaceAll("\n",
                util.format("\n%s %s> ", prefix, getDate()));
    };

    var getDate = function () {
        return dateFormat(new Date(), "hh:MM:ss");
    }
}