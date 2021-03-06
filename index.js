var updater = require('./rack');
var logger = require('./logger');
logger.info('Updating');
updater(function (err, ip) {
    if (err) {
        logger.error(err);
        process.exit(1);
        return;
    }
    logger.info('Updated', {ip: ip});
    process.exit(0);
});
setTimeout(function () {
    logger.error('Timeout');
    process.exit(1);
}, 60 * 1000);