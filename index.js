var pkgcloud = require('pkgcloud');
var async = require('async');
var config = require('./config.json');
var request = require('request');

var client = pkgcloud.dns.createClient({
    provider: 'rackspace',
    username: config.username,
    apiKey: config.apiKey
});

request('http://myexternalip.com/raw', function (err, res, body) {
    if (err) {
        console.error(err);
        return;
    }
    var matches = body.match(/(\d{1,3}\.){3}\d{1,3}/g);
    if (!matches) {
        console.error('Cannot get public IP');
        return;
    }
    var ip = matches[0];
    console.log('Setting IP:', ip);
    client.getZones({name: config.zone}, function (err, zones) {
        if (err) {
            console.error(err);
            return;
        }
        if (zones.length !== 1) {
            console.error('Zone not found');
            return;
        }
        var zone = zones[0];
        client.getRecords(zone.id, function (err, records) {
            if (err) {
                console.error(err);
                return;
            }
            var updates = [];
            records.forEach(function (record) {
                if (config.records.indexOf(record.name) !== -1) {
                    record.data = ip;
                    updates.push(function (callback) {
                        client.updateRecord(zone.id, record, callback);
                    });
                }
            });
            async.parallel(updates, function (err, result) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Updated!');
                process.exit();
            });
        });
    });
});