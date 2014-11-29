angular.module('starter.services', [])

.constant('DATABASE_API_URL', 'http://api-autotest.toancauxanh.vn/sqliteapi')
// .constant('DATABASE_API_URL', 'http://local.mymoney.com:8080/sqliteapi')

/**
 * Model Budget View
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMViewBudget', function(Database, Cache, Utils, API) {
  return {
    getBudgetsByMonth: function(month, year) {
      var cacheKey = 'getBudgetsByMonth'+year+month;
      var cache = Cache.get(cacheKey);
      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      var uri = '/budgets/:month/:year';
      var params = {
        ':month': month,
        ':year': year
      };
      var budgets = [];
      var data = API.get(uri, params);
      if (!Utils.isEmpty(data) && !Utils.isEmpty(data.items)) {
        budgets = data.items;
      }

      Cache.put(cacheKey, budgets);

      return budgets;
    },
    getBudgets: function(month, year, type) {
      var cacheKey = 'getBudgets'+year+month+'type'+type;
      var cache = Cache.get(cacheKey);
      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      var uri = '/budgets/:month/:year/:type';
      var params = {
        ':month': month,
        ':year': year,
        ':type': type
      };
      var budgets = [];
      var data = API.get(uri, params);
      if (!Utils.isEmpty(data) && !Utils.isEmpty(data.items)) {
        budgets = data.items;
      }

      Cache.put(cacheKey, budgets);

      return budgets;
    }
  }
})


/**
 * Asset Model
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMAsset', function(Cache, Database, Utils, API) {
  return {
    getAssets: function() {
      var cacheKey = 'assets';
      var cache = Cache.get(cacheKey);
      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      var uri = '/assets';
      var assets = [];
      var data = API.get(uri);
      if (!Utils.isEmpty(data) && !Utils.isEmpty(data.items)) {
        assets = data.items;
      }

      Cache.put(cacheKey, assets);

      return assets;
    }
  }
})


/**
 * Bill Model
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMBill', function(Cache, Database, Utils, API) {
  return {
    getBillsByMonth: function(month, year, budget_id) {
      var cacheKey = 'getBillsByMonth'+year+month;
      if (!Utils.isEmpty(budget_id)) {
        cacheKey += budget_id.toString();
      }
      var cache = Cache.get(cacheKey);
      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      var arrBills;

      var uri = '/bills/:month/:year';
      var params = {};
      params[':month'] = month;
      params[':year'] = year;
      if (!Utils.isEmpty(budget_id)) {
        uri += '/:budget_id';
        params[':budget_id'] = budget_id;
      }

      arrBills = [];
      var data = API.get(uri, params);
      if (!Utils.isEmpty(data) && !Utils.isEmpty(data.items)) {
        arrBills = data.items;
      }

      Cache.put(cacheKey, arrBills);

      return arrBills;
    }
  }
})

/**
 * Common Model
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMCommon', function(Database, Cache, Utils, API) {
  return {
    getStatistics: function(month, year) {
      var cacheKey = 'getStatistics'+year+month;
      var cache = Cache.get(cacheKey);
      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      var uri = '/statistics/:month/:year';
      var params = {
        ':month': month,
        ':year': year
      };
      var statistics = [];
      var data = API.get(uri, params);
      if (!Utils.isEmpty(data) && !Utils.isEmpty(data.stats)) {
        statistics = data.stats;
      }

      Cache.put(cacheKey, statistics);

      return statistics;
    }
  }
})

/**
 * Utilities Component
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('Utils', function($filter) {
  return {
    isEmpty: function(val) {
      return angular.isUndefined(val) || val === null;
    },
    getPercentDateOfMonth: function() {
      var currentYear = $filter('date')(new Date, 'yyyy');
      var currentMonth = $filter('date')(new Date, 'M');
      var currentDate = $filter('date')(new Date, 'd');
      var days = (new Date(currentYear, currentMonth, 0).getDate());

      return currentDate / days * 100;
    },
    getCurrentDay: function() {
      return $filter('date')(new Date, 'd');
    },
    getCurrentMonth: function() {
      return $filter('date')(new Date, 'M');
    },
    getCurrentYear: function() {
      return $filter('date')(new Date, 'yyyy');
    },
    getTotalDaysOfMonth: function(year, month) {
      return (new Date(year, month, 0)).getDate();
    }
  }
})

/**
 * Cache Component
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('Cache', function($cookieStore, $cacheFactory) {
  return $cacheFactory('super-cache');
})

/**
 * Auth component
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('Auth', function($cookieStore, $location, Utils) {
  return {
    requireLogin: function() {
      if (!this.isLogged()) {
        $location.path("/login");
      }
    },
    isLogged: function() {
      if (Utils.isEmpty($cookieStore.get('auth'))) {
        return false;
      }
      return true;
    }
  }
})

.factory('API', function($http, $cookieStore, DATABASE_API_URL, Utils) {
  return {
    get: function(uri, params) {
      var data = [];
      var request = new XMLHttpRequest();

      // binding parameters
      if (!Utils.isEmpty(params)) {
        angular.forEach(params, function(value, key) {
          uri = uri.replace(key, value);
        });
      }

      // open request
      request.open('GET', DATABASE_API_URL + uri, false);  // `false` makes the request synchronous

      // send request headers
      if (!Utils.isEmpty($cookieStore.get('auth'))) {
        angular.forEach($cookieStore.get('auth'), function(value, key) {
          if (!Utils.isEmpty(value)) {
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
          data = resp.data;
        }
      }

      return data;
    },
    post: function(uri, params, data) {
      var request = new XMLHttpRequest();

      // binding parameters
      if (!Utils.isEmpty(params)) {
        angular.forEach(params, function(value, key) {
          uri = uri.replace(key, value);
        });
      }

      // open request
      request.open('POST', DATABASE_API_URL + uri, false);  // `false` makes the request synchronous

      var strData = [];
      angular.forEach(data, function(value, key) {
        strData[strData.length] = key + '=' + encodeURIComponent(value);
      });
      strData = strData.join('&');

      // send request headers
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      // request.setRequestHeader("Content-length", strData.length);
      // request.setRequestHeader("Connection", "close");
      if (!Utils.isEmpty($cookieStore.get('auth'))) {
        angular.forEach($cookieStore.get('auth'), function(value, key) {
          if (!Utils.isEmpty(value)) {
            request.setRequestHeader(key, value);
          }
        });
      }

      // send request
      request.send(strData);

      // receiver response
      data = [];
      if (request.status === 200) {
        resp = angular.fromJson(request.responseText);
        data = resp;
      }

      return data;
    }
  }
})

/**
 * Database component
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('Database', function($http, $cookieStore, DATABASE_API_URL, Utils) {
  return {
    query: function(q, params, asynchronous) {
      var items = [];
      var request = new XMLHttpRequest();

      if (Utils.isEmpty(asynchronous)) {
        asynchronous = false;
      }

      // binding parameters
      if (!Utils.isEmpty(params)) {
        angular.forEach(params, function(value, key) {
          value = value.toString().replace(/'/g, "\\'");
          q = q.replace(key, "'" + value + "'");
        });
      }

      // open request
      request.open('GET', DATABASE_API_URL + '/query?query=' + encodeURIComponent(q), asynchronous);  // `false` makes the request synchronous

      // send request headers
      if (!Utils.isEmpty($cookieStore.get('auth'))) {
        angular.forEach($cookieStore.get('auth'), function(value, key) {
          if (!Utils.isEmpty(value)) {
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
      if (!Utils.isEmpty(params)) {
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
      if (!Utils.isEmpty($cookieStore.get('auth'))) {
        angular.forEach($cookieStore.get('auth'), function(value, key) {
          if (!Utils.isEmpty(value)) {
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
