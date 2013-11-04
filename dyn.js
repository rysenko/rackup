var request = require('request');
var config = require('./config.json').dyndns;

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
            console.error(err);
            return;
        }
        console.log(body);
        recordsCount -= 1;
        if (recordsCount == 0) {
            console.log('Updated!');
            process.exit();
        }
    });
});
