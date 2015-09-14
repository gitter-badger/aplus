'use strict';

var aplus = exports;

aplus.Promise = global.Promise;

// Use the promise polyfill for old versions of node.
/* istanbul ignore next */
if (!aplus.Promise) {
    aplus.Promise = require('promise-polyfill');
}

aplus.mapLimit = aplus.forEachLimit = aplus.eachLimit = function eachLimit(arr, limit, iterator) {
    if (Number.isNaN(Math.floor(limit))) {
        limit = 1; // Fallback if non number provided
    }
    return new aplus.Promise(function (resolve, reject) {
        var results = [],
            finished = 0,
            started = 0,
            active = 0,
            done = false;

        function onReject(error) {
            done = true;
            reject(error);
        }

        function getCompleter(idx) {
            return function onComplete(value) {
                results[idx] = value;
                active -= 1;
                finished += 1;
                if (!done && finished === arr.length) {
                    done = true;
                    return resolve(results);
                }
                spawn();
            };
        }

        function spawn() {
            while (!done && started < arr.length && active < limit) {
                var index = started;
                active += 1;
                started += 1;
                iterator(arr[index], index, arr).then(getCompleter(index)).catch(onReject);
            }
        }
        spawn();
    });
};

aplus.map = aplus.forEach = aplus.each = function each(arr, iterator) {
    return aplus.eachLimit(arr, Number.POSITIVE_INFINITY, iterator);
};

aplus.mapSeries = aplus.forEachSeries = aplus.eachSeries = function eachSeries(arr, iterator) {
    return aplus.eachLimit(arr, 1, iterator);
};