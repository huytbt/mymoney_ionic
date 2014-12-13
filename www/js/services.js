angular.module('starter.services', [])

.constant('DATABASE_API_URL', 'http://api-autotest.toancauxanh.vn/sqliteapi')
// .constant('DATABASE_API_URL', 'http://mymoneyapi.gopagoda.com')
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
    getAssets: function(more) {
      var cacheKey = 'assets';
      if (!Utils.isEmpty(more)) {
        cacheKey += more;
      }
      var cache = Cache.get(cacheKey);
      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      var uri = '/assets';
      if (!Utils.isEmpty(more)) {
        uri += more;
      }
      var assets = [];
      var data = API.get(uri);
      if (!Utils.isEmpty(data) && !Utils.isEmpty(data.items)) {
        assets = data.items;
      }

      Cache.put(cacheKey, assets);

      return assets;
    },
    getGroups: function() {
      var cacheKey = 'asset-groups';
      var cache = Cache.get(cacheKey);
      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      var uri = '/asset-groups';
      var groups = [];
      var data = API.get(uri);
      if (!Utils.isEmpty(data) && !Utils.isEmpty(data.items)) {
        groups = data.items;
      }

      Cache.put(cacheKey, groups);

      return groups;
    }
  }
})


.factory('MMAssetTransfer', function(Cache, Database, Utils, API) {
  return {
    getTransfersByMonth: function(month, year) {
      var cacheKey = 'getTransfersByMonth'+year+month;
      var cache = Cache.get(cacheKey);
      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      var uri = '/transfers/:month/:year';
      var params = {
        ':month': month,
        ':year': year
      };
      var transfers = [];
      var data = API.get(uri, params);
      if (!Utils.isEmpty(data) && !Utils.isEmpty(data.items)) {
        transfers = data.items;
      }

      Cache.put(cacheKey, transfers);

      return transfers;
    }
  }
})


/**
 * Category Model
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMCategory', function(Cache, Database, Utils, API) {
  return {
    getCategories: function() {
      var cacheKey = 'categories';
      var cache = Cache.get(cacheKey);
      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      var uri = '/categories';
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
      return parseInt($filter('date')(new Date, 'd'));
    },
    getCurrentMonth: function() {
      return parseInt($filter('date')(new Date, 'M'));
    },
    getCurrentYear: function() {
      return parseInt($filter('date')(new Date, 'yyyy'));
    },
    getTotalDaysOfMonth: function(year, month) {
      return (new Date(year, month, 0)).getDate();
    },
    numPad: function(num, size) {
      var s = num+"";
      while (s.length < size) s = "0" + s;
      return s;
    }
  }
})

/**
 * Cache Component
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('Cache', function($cacheFactory, $localstorage, Utils) {
  return {
    get: function(key) {
      var cache = $localstorage.get('cache');
      if (Utils.isEmpty(cache)) {
        return null;
      }
      return cache[key];
    },
    put: function(key, value) {
      var cache = $localstorage.get('cache');
      if (Utils.isEmpty(cache)) {
        cache = {};
      }
      cache[key] = value;
      $localstorage.put('cache', cache);
    },
    remove: function(key) {
      var cache = $localstorage.get('cache');
      cache[key] = null;
      delete cache[key];
      $localstorage.put('cache', cache);
    },
    removeAll: function() {
      $localstorage.remove('cache');
    }
  }
  return $cacheFactory('super-cache');
})

/**
 * Cookie Component
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('CookieComponent', function($cookieStore, $localstorage) {
  return $localstorage;
})

/**
 * Auth component
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('Auth', function(CookieComponent, $location, Utils) {
  return {
    requireLogin: function() {
      if (!this.isLogged()) {
        $location.path("/login");
      }
    },
    isLogged: function() {
      if (Utils.isEmpty(CookieComponent.get('auth'))) {
        return false;
      }
      return true;
    },
    login: function(user, pass) {
      CookieComponent.put('auth', {
          user: user,
          pass: pass
      });
    },
    logout: function() {
      CookieComponent.remove('auth');
    }
  }
})

.factory('$localstorage', ['$window', function($window) {
  return {
    put: function(key, value) {
      if (typeof value == 'object') {
        $window.localStorage[key] = JSON.stringify(value);
      } else {
        $window.localStorage[key] = value;
      }
    },
    get: function(key) {
      try {
        return JSON.parse($window.localStorage[key]);
      } catch (e) {
        return $window.localStorage[key];
      }
    },
    remove: function(key) {
      $window.localStorage.removeItem(key);
    },
    removeAll: function() {
      $window.localStorage.clear();
    }
  }
}])

.factory('API', function($http, Cache, CookieComponent, DATABASE_API_URL, Utils) {
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
      if (!Utils.isEmpty(CookieComponent.get('auth'))) {
        angular.forEach(CookieComponent.get('auth'), function(value, key) {
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
    request: function(method, uri, params, data) {
      var request = new XMLHttpRequest();

      // binding parameters
      if (!Utils.isEmpty(params)) {
        angular.forEach(params, function(value, key) {
          uri = uri.replace(key, value);
        });
      }

      // open request
      request.open(method, DATABASE_API_URL + uri, false);  // `false` makes the request synchronous

      var strData = [];
      angular.forEach(data, function(value, key) {
        strData[strData.length] = key + '=' + encodeURIComponent(value);
      });
      strData = strData.join('&');

      // send request headers
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      // request.setRequestHeader("Content-length", strData.length);
      // request.setRequestHeader("Connection", "close");
      if (!Utils.isEmpty(CookieComponent.get('auth'))) {
        angular.forEach(CookieComponent.get('auth'), function(value, key) {
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
    },
    post: function(uri, params, data) {
      Cache.removeAll();
      return this.request('POST', uri, params, data);
    },
    put: function(uri, params, data) {
      Cache.removeAll();
      return this.request('PUT', uri, params, data);
    },
    delete: function(uri, params, data) {
      Cache.removeAll();
      return this.request('DELETE', uri, params, data);
    }
  }
})

/**
 * Database component
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('Database', function($http, CookieComponent, DATABASE_API_URL, Utils) {
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
      if (!Utils.isEmpty(CookieComponent.get('auth'))) {
        angular.forEach(CookieComponent.get('auth'), function(value, key) {
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
      if (!Utils.isEmpty(CookieComponent.get('auth'))) {
        angular.forEach(CookieComponent.get('auth'), function(value, key) {
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
