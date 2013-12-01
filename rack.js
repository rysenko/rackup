var pkgcloud = require('pkgcloud');
var async = require('async');
var config = require('./config.json').rackspace;
var request = require('request');

var client = pkgcloud.dns.createClient({
    provider: 'rackspace',
    username: config.username,
    apiKey: config.apiKey
});

module.exports = function (callback) {
    request('http://myexternalip.com/raw', function (err, res, body) {
        if (err) {
            callback(err);
            return;
        }
        var matches = body.match(/(\d{1,3}\.){3}\d{1,3}/g);
        if (!matches) {
            callback('Cannot get public IP');
            return;
        }
        var ip = matches[0];
        client.getZones({name: config.zone}, function (err, zones) {
            if (err) {
                callback(err);
                return;
            }
            if (zones.length !== 1) {
                callback('Zone not found');
                return;
            }
            var zone = zones[0];
            client.getRecords(zone.id, function (err, records) {
                if (err) {
                    callback(err);
                    return;
                }
                var updates = [];
                records.forEach(function (record) {
                    if (config.records.indexOf(record.name) !== -1 && record.type === 'A' && record.data !== ip) {
                        record.data = ip;
                        updates.push(function (cb) {
                            client.updateRecord(zone.id, record, cb);
                        });
                    }
                });
                async.parallel(updates, function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, ip);
                });
            });
        });
    });
};

