angular.module('starter.services', [])

.constant('DATABASE_API_URL', 'http://api-autotest.toancauxanh.vn/sqliteapi')

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var friends = [
        { id: 0, name: 'Scruff McGruff' },
        { id: 1, name: 'G.I. Joe' },
        { id: 2, name: 'Miss Frizzle' },
        { id: 3, name: 'Ash Ketchum' }
    ];

    return {
        all: function() {
            return friends;
        },
        get: function(friendId) {
            // Simple index lookup
            return friends[friendId];
        }
    }
})

/**
 * Auth component
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('Auth', function($cookieStore, $location) {
    return {
        requireLogin: function() {
            if (!angular.isDefined($cookieStore.get('auth'))) {
                $location.path("/tab/login");
            }
        }
    }
})

/**
 * Model Budget View
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMViewBudget', function(Database) {
    return {
        getBudgetsByMonth: function(month, year) {
            return Database.query('select * from mm_asset_groups');
        }
    }
})



.factory('Database', function($http, $cookieStore, DATABASE_API_URL) {
    return {
        query: function(q, params) {
            var items = [];
            var request = new XMLHttpRequest();

            // binding parameters
            if (angular.isDefined(params)) {
                angular.forEach(params, function(value, key) {
                    value = value.replace(/'/g, "\\'");
                    q = q.replace(key, "'" + value + "'");
                });
            }

            // open request
            request.open('GET', DATABASE_API_URL + '/query?query=' + encodeURIComponent(q), false);  // `false` makes the request synchronous

            // send request headers
            if (angular.isDefined($cookieStore.get('auth'))) {
                angular.forEach($cookieStore.get('auth'), function(value, key) {
                    if (angular.isDefined(value)) {
                        request.setRequestHeader(key, value);
                    }
                });
            }

            // send request
            request.send(null);

            // receiver response
            if (request.status === 200) {
                resp = angular.fromJson(request.responseText);
                if (resp.meta.code == 200) {
                    items = resp.data.items;
                }
            }

            return items;
        },
        exec: function(q, params) {
            var result = false;
            var request = new XMLHttpRequest();

            // binding parameters
            if (angular.isDefined(params)) {
                angular.forEach(params, function(value, key) {
                    value = value.replace(/'/g, "\\'");
                    q = q.replace(key, "'" + value + "'");
                });
            }

            // open request
            request.open('POST', DATABASE_API_URL + '/exec', false);  // `false` makes the request synchronous

            var strParams = 'query='+encodeURIComponent(q);

            // send request headers
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.setRequestHeader("Content-length", strParams.length);
            request.setRequestHeader("Connection", "close");
            if (angular.isDefined($cookieStore.get('auth'))) {
                angular.forEach($cookieStore.get('auth'), function(value, key) {
                    if (angular.isDefined(value)) {
                        request.setRequestHeader(key, value);
                    }
                });
            }

            // send request
            request.send(strParams);

            // receiver response
            if (request.status === 200) {
                resp = angular.fromJson(request.responseText);
                if (resp.meta.code == 200) {
                    result = resp.data.result;
                }
            }

            return result;
        }
    };
})

;
