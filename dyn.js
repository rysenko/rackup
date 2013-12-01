var request = require('request');
var config = require('./config.json').dyndns;

module.exports = function (callback) {
    var recordsCount = config.records.length;
    config.records.forEach(function (record) {
        request.get({
            url: 'http://' + config.username + ':' + config.password +
                '@members.dyndns.org/nic/update?hostname=' + record,
            headers: {
                'User-Agent': 'Node - NodeUpdater - 1.0'
            }
        }, function (err, res, body) {
            if (err) {
                callback(err);
                return;
            }
            recordsCount -= 1;
            if (recordsCount == 0) {
                callback(null, '0.0.0.0');
            }
        });
    });
};
