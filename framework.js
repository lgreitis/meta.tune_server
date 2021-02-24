require("./JSPrototypes.js");

const util = require("util"),
      readline = require('readline'),
      logger = require("./logger.js");

module.exports = function (index, errOff) {
    errOff = !errOff;
    index = index || {};
    
    index.onError = index.onError || function (e) {
        if (errOff)
            logger.warn("Unhandled error %s!", e.stack);    
    };
    
    index.onLaunch = index.onLaunch || function () {
        if (errOff)
            logger.warn("Unhandled ready!");    
    };
    
    index.onStopping = index.onStopping || function () {
        if (errOff)
            logger.warn("Unhandled shutdown!");
        return true;
    };
    
    index.onConsoleInput = index.onConsoleInput || function (e) {
        if (errOff)
            logger.warn("Unhandled console input %s!", e);    
    };

    process.on('uncaughtException', (e) => {
        try { 
            index.onError(e);
        } catch (i)  {
            logger.warn("------ON ERROR FAILED-----");
            logger.warn("----Original Exception:---");
            logger.warn(e.stack);
            logger.warn("-------New Exception:-----");
            logger.warn(i.stack);
            logger.warn("------ON ERROR FAILED-----");
        }
    });

    index.onLaunch();
}