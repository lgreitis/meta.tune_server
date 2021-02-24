module.exports = new function () {

    String.prototype.replaceLast = function (find, replace) {
        var index = this.lastIndexOf(find);
        if (index >= 0)
            return this.substring(0, index) + replace + this.substring(index + find.length);
        return this.toString();
    };

    String.prototype.before = function (str) {
        return this.substring(0, this.indexOf(str));
    };

    String.prototype.replaceAll = function (search, last) {
        return this.split(search).join(last);
    };

};
