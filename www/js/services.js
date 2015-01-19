angular.module('starter.services', [])

/**
 * Model Budget View
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMViewBudget', function(Cache, Utils, API, DB) {
  var self = this;
  self.getBudgetsByMonth = function(month, year, callback) {
    var cacheKey = 'getBudgetsByMonth'+year+month;
    var cache = Cache.get(cacheKey);

    DB.query('SELECT * FROM view_budget WHERE year=? AND month=? ORDER BY type', [year, month]).then(function(result) {
      budgets = DB.fetchAll(result);
      angular.forEach(budgets, function(budget, index) {
        budgets[index].percentDayTracking = Math.round(budget.actual_amount / budget.amount * 100);
        budgets[index].statusTracking = self.budgetGetStatusTracking(budget, month, year);
      });
      Cache.put(cacheKey, budgets);
      Cache.put('getBudgetsByMonth', budgets);
      if (typeof callback == 'function') callback(budgets);
    });

    if (Utils.isEmpty(cache)) {
      cache = Cache.get('getBudgetsByMonth');
    }

    if (!Utils.isEmpty(cache)) {
      return cache;
    }

    return [];
  };
  self.getBudgets = function(month, year, type, callback) {
    var cacheKey = 'getBudgets'+year+month+'type'+type;
    var cache = Cache.get(cacheKey);

    DB.query('SELECT * FROM mm_budgets WHERE month=? AND year=? AND type=?', [month, year, type]).then(function(result) {
      budgets = DB.fetchAll(result);
      Cache.put(cacheKey, budgets);
      if (typeof callback == 'function') callback(budgets);
    });

    if (!Utils.isEmpty(cache)) {
      return cache;
    }

    return [];
  };
  self.budgetGetStatusTracking = function(budget, month, year) {
    var currentYear = Utils.getCurrentYear();
    var currentMonth = Utils.getCurrentMonth();
    var percentDateOfMonth = 10;
    var isCurrentMonth = Utils.getCurrentYear() == currentYear && Utils.getCurrentMonth() == currentMonth;
    var percentDateOfMonth = Utils.getCurrentDay() / Utils.getTotalDaysOfMonth(year, month) * 100;
    if (budget.type == 0) {
      percentSafe = 100;
      percentWarning = 95;
      if (budget.day_tracking == 1 && isCurrentMonth) {
        percentSafe = percentDateOfMonth;
        percentWarning = percentDateOfMonth;
      }
      return budget.percentDayTracking>=percentSafe?0:(budget.percentDayTracking<percentWarning?10:5);
    } else {
      percentSafe = 90;
      percentWarning = 100;
      if (budget.day_tracking == 1 && isCurrentMonth) {
        percentSafe = percentDateOfMonth - 10;
        percentWarning = percentDateOfMonth;
      }
      return budget.percentDayTracking<percentSafe?0:(budget.percentDayTracking>percentWarning?10:5);
    }
    return budget.percentDayTracking;
  }

  self.budgetsGetTotalAmount = function(attributes, field, type, callback) {
    if (Utils.isEmpty(type)) type = 1;
    select = 'SELECT SUM('+field+') as total ';
    from = 'FROM view_budget ';
    where = 'WHERE type=? ';
    params = [type];
    angular.forEach(attributes, function(value, attr) {
      where += 'AND ' + attr + '=? ';
      params[params.length] = value;
    });
    DB.query(select + from + where, params).then(function(result) {
      total = DB.fetch(result);
      total = total.total || 0;
      if (typeof callback == 'function') callback(total);
    });
  }

  return self;
})


/**
 * Asset Model
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMAsset', function(Cache, Utils, API, DB) {
  var self = this;
  self.getAssets = function(more, callback) {
    var cacheKey = 'assets';
    if (!Utils.isEmpty(more)) {
      cacheKey += more;
    }
    var cache = Cache.get(cacheKey);

    select = 'SELECT t.*, ag.name as group_name ';
    from = 'FROM mm_assets as t INNER JOIN mm_asset_groups as ag ON t.group_id = ag.id ';
    if (!Utils.isEmpty(more) && more == '?more=amount_current') {
        select += ', va.amount_current as amount_current ';
        from += 'INNER JOIN view_assets as va ON va.asset_id = t.id ';
    }
    DB.query(select + from).then(function(result) {
      assets = DB.fetchAll(result);
      Cache.put(cacheKey, assets);
      if (typeof callback == 'function') callback(assets);
    });

    if (!Utils.isEmpty(cache)) {
      return cache;
    }

    return [];
  };
  self.getGroups = function(callback) {
    var cacheKey = 'asset-groups';
    var cache = Cache.get(cacheKey);

    DB.query('SELECT t.* FROM mm_asset_groups as t').then(function (result) {
      groups = DB.fetchAll(result);
      Cache.put(cacheKey, groups);
      if (typeof callback == 'function') callback(groups);
    });

    if (!Utils.isEmpty(cache)) {
      return cache;
    }

    return [];
  }
  self.assetsGetTotalAmount = function(attributes, field, callback) {
    select = 'SELECT SUM('+field+') as total ';
    from = 'FROM view_assets ';
    where = 'WHERE 1=1 ';
    params = [];
    angular.forEach(attributes, function(value, attr) {
      where += 'AND ' + attr + '=? ';
      params[params.length] = value;
    });
    DB.query(select + from + where, params).then(function(result) {
      total = DB.fetch(result);
      total = total.total || 0;
      if (typeof callback == 'function') callback(total);
    });
  }
  return self;
})


.factory('MMAssetTransfer', function(Cache, Utils, API, DB) {
  return {
    getTransfersByMonth: function(month, year, callback) {
      var cacheKey = 'getTransfersByMonth'+year+month;
      var cache = Cache.get(cacheKey);

      query = 'SELECT t.*, assetF.title as from_account_text, assetT.title as to_account_text ';
      query+= 'FROM mm_asset_transfers as t ';
      query+= 'INNER JOIN mm_assets as assetF ON assetF.id=t.from_account_id ';
      query+= 'INNER JOIN mm_assets as assetT ON assetT.id=t.to_account_id ';
      query+= 'WHERE t.year=? AND t.month=?';
      params = [year, month];
      DB.query(query, params).then(function(result) {
        transfers = DB.fetchAll(result);
        Cache.put(cacheKey, transfers);
        if (typeof callback == 'function') callback(transfers);
      });

      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      return [];
    }
  }
})


/**
 * Category Model
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMCategory', function(Cache, Utils, API, DB) {
  return {
    getCategories: function(callback) {
      var cacheKey = 'categories';
      var cache = Cache.get(cacheKey);

      DB.query('SELECT * from mm_categories').then(function(result) {
        categories = DB.fetchAll(result);
        angular.forEach(categories, function(cat, key) {
          categories[key].type_name = cat.type == 0 ? 'Income' : 'Expense';
        })
        Cache.put(cacheKey, categories);
        if (typeof callback == 'function') callback(categories);
      });

      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      return [];
    },
    getCategory: function(id, callback) {
      var cacheKey = 'category' + id;
      var cache = Cache.get(cacheKey);

      DB.query('SELECT * FROM mm_categories WHERE id=?', [id]).then(function(result) {
        category = DB.fetch(result);
        Cache.put(cacheKey, category);
        if (typeof callback == 'function') callback(category);
      });

      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      return null;
    }
  }
})


/**
 * MMBackup Model
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMBackup', function(Cache, Utils, API, DB) {
  var self = this;
  self.getTotalRecords = function(callback) {
    var total = 0;
    DB.query('SELECT count(*) as total FROM mm_asset_groups').then(function(result) {
      rs = DB.fetch(result);
      total += rs.total;
      DB.query('SELECT count(*) as total FROM mm_assets').then(function(result) {
        rs = DB.fetch(result);
        total += rs.total;
        DB.query('SELECT count(*) as total FROM mm_asset_transfers').then(function(result) {
          rs = DB.fetch(result);
          total += rs.total;
          DB.query('SELECT count(*) as total FROM mm_categories').then(function(result) {
            rs = DB.fetch(result);
            total += rs.total;
            DB.query('SELECT count(*) as total FROM mm_budgets').then(function(result) {
              rs = DB.fetch(result);
              total += rs.total;
              DB.query('SELECT count(*) as total FROM mm_bills').then(function(result) {
                rs = DB.fetch(result);
                total += rs.total;
                if (typeof callback == 'function') callback(total);
              });
            });
          });
        });
      });
    });
  }
  self.getBackups = function() {
    var uri = '/backups';
    var backups = [];
    var data = API.get(uri);
    if (!Utils.isEmpty(data) && !Utils.isEmpty(data.items)) {
      backups = data.items;
      backups = backups.sort(function (a, b) {
        return (a.modified < b.modified);
      });
    }
    return backups;
  };
  self.restore = function(filename, tablename, page) {
    var queries = [];
    if (Utils.isEmpty(page)) page = 1;
    var data = API.get('/backups/:filename/:tablename?page=:page', {':filename':filename, ':tablename':tablename, ':page':page});
    if (!Utils.isEmpty(data) && !Utils.isEmpty(data.items)) {
      if (page == 1) {
        queries[queries.length] = "DELETE FROM "+tablename+"";
      }
      angular.forEach(data.items, function(row) {
        fields = []; values = [];
        angular.forEach(row, function(value, field) {
          fields[fields.length] = field;
          value = value || '';
          value = value.toString().replace(/'/g, "\'\'");
          values[values.length] = "'"+value+"'";
        });
        queries[queries.length] = "INSERT INTO "+tablename+" ("+fields.join(',')+") VALUES ("+values.join(',')+")";
      });
      if (data.pages.currentPage < data.pages.totalPages) {
        queries = queries.concat(self.restore(filename, tablename, page + 1));
      }
      return queries;
    }
    return false;
  };
  self.newBackup = function(filename) {
    API.post('/backups/:filename', {':filename':filename}, {});
  };
  self.backup = function(filename, tablename, callback) {
    var limit = 100; var offset = 0;
    DB.query('SELECT count(*) as total FROM ' + tablename + '').then(function(result){
      rs = DB.fetch(result);
      var total = rs.total;
      var totalPages = Math.ceil(total / limit);
      for (page = 1; page <= totalPages; page++) {
        offset = (page - 1) * limit;
        DB.query('SELECT * FROM ' + tablename + ' LIMIT ' + offset + ',' + limit).then(function(result){
          var data = angular.toJson(DB.fetchAll(result));
          API.post('/backups/:filename/:tablename', {':filename':filename, ':tablename':tablename}, {data: data});
        });
      }
      if (typeof callback == 'function') {
        if (typeof callback == 'function') callback();
      }
    });
  };
  self.resetDb = function() {
    var queries = [
      'DROP TABLE mm_bills',
      'DROP TABLE mm_budgets',
      'DROP TABLE mm_categories',
      'DROP TABLE mm_asset_transfers',
      'DROP TABLE mm_assets',
      'DROP TABLE mm_asset_groups',
      'DROP VIEW view_assets',
      'DROP VIEW view_budget',
      'DELETE FROM sqlite_sequence'
    ];
    DB.executeMultipleQueries(queries);
    DB.init();
  }
  return self;
})


/**
 * Bill Model
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMBill', function(Cache, Utils, API, DB) {
  return {
    getBillsByMonth: function(month, year, budget_id, callback) {
      var cacheKey = 'getBillsByMonth'+year+month;
      if (!Utils.isEmpty(budget_id)) {
        cacheKey += budget_id.toString();
      }
      var cache = Cache.get(cacheKey);

      var arrBills = [];
      var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December' ];

      // get days has bill of month
      select = 'SELECT day ';
      from = 'FROM mm_bills t ';
      where = 'WHERE t.month=? AND t.year=? ';
      params = [month, year];
      if (!Utils.isEmpty(budget_id)) {
          where += 'AND t.budget_id=? ';
          params[params.length] = budget_id;
      }
      order = 'ORDER BY t.day DESC ';
      group = 'GROUP BY t.day ';
      DB.query(select + from + where + group + order, params).then(function(result) {
        daysHasBills = DB.fetchAll(result);

        // get bills each day
        select = 'SELECT t.*, bud.title as budget_title, cat.name as budget_category_name ';
        from += 'INNER JOIN mm_budgets bud ON t.budget_id=bud.id ';
        from += 'INNER JOIN mm_categories cat ON bud.category_id=cat.id ';
        angular.forEach(daysHasBills, function(bill, key) {
          from = 'FROM mm_bills t ';
          from += 'INNER JOIN mm_budgets bud ON t.budget_id=bud.id ';
          from += 'INNER JOIN mm_categories cat ON bud.category_id=cat.id ';
          where = 'WHERE t.month=? AND t.year=? ';
          params = [month, year];
          if (!Utils.isEmpty(budget_id)) {
              where += 'AND t.budget_id=? ';
              params[params.length] = budget_id;
          }
          where += 'AND t.day=? ';
          params2 = [];
          for (i=0;i<params.length;i++) params2[i] = params[i];
          params2[params2.length] = bill.day;

          DB.query(select + from + where, params2).then(function(result) {
            bills = DB.fetchAll(result);
            totalParams = {day: bill.day, month: month, year: year};
            if (!Utils.isEmpty(budget_id)) {
                totalParams.budget_id = budget_id;
            }
            var totalExpenseAmount = 0;
            var totalIncomeAmount = 0;
            angular.forEach(bills, function (bill, index) {
              if (bill.type == 0) {
                totalIncomeAmount += bill.amount
              }
              if (bill.type == 1) {
                totalExpenseAmount += bill.amount
              }
            });
            arrBills[arrBills.length] = {
              day: bill.day,
              year_month: year + ' ' + monthNames[month - 1].substr(0, 3),
              bills: bills,
              totalExpenseAmount: totalExpenseAmount,
              totalIncomeAmount: totalIncomeAmount
            };

            if (key == daysHasBills.length - 1) {
              Cache.put(cacheKey, arrBills);
              Cache.put('getBillsByMonth', arrBills);
              callback(arrBills);
            }
          });
        });
        if (daysHasBills.length == 0) {
          Cache.put(cacheKey, []);
          Cache.put('getBillsByMonth', []);
          callback([]);
        }
      });

      if (Utils.isEmpty(cache)) {
        cache = Cache.get('getBillsByMonth');
      }

      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      return [];
    }
  }
})

/**
 * Common Model
 *
 * @author HuyTBT <huytbt@gmail.com>
 */
.factory('MMCommon', function(Cache, Utils, API, DB, MMViewBudget, MMAsset) {
  return {
    getStatistics: function(month, year, callback) {
      var cacheKey = 'getStatistics'+year+month;
      var cache = Cache.get(cacheKey);

      MMAsset.assetsGetTotalAmount({is_save_account: 0}, 'amount_current', function(assetCurrentAmount) {
        MMAsset.assetsGetTotalAmount({is_save_account: 0}, 'keep_amount', function(assetKeepAmount) {
          var totalAssets = assetCurrentAmount - assetKeepAmount;

          var params = {month: month, year: year};
          MMViewBudget.budgetsGetTotalAmount(params, 'amount', 0, function(totalIncomePlanAmount) {
            MMViewBudget.budgetsGetTotalAmount(params, 'actual_amount', 0, function(totalIncomeActualAmount) {
              MMViewBudget.budgetsGetTotalAmount(params, 'amount', 1, function(totalExpensePlanAmount) {
                MMViewBudget.budgetsGetTotalAmount(params, 'actual_amount', 1, function(totalExpenseActualAmount) {
                  MMViewBudget.budgetsGetTotalAmount(params, 'need_income_amount', 1, function(totalNeedIncomeAmount) {
                    totalNeedIncomeActualAmount = Math.max(0, totalNeedIncomeAmount - totalAssets);
                    statistics = {
                      totalIncomePlanAmount: totalIncomePlanAmount,
                      totalIncomeActualAmount: totalIncomeActualAmount,
                      totalExpensePlanAmount: totalExpensePlanAmount,
                      totalExpenseActualAmount: totalExpenseActualAmount,
                      totalNeedIncomeAmount: totalNeedIncomeAmount,
                      totalNeedIncomeActualAmount: totalNeedIncomeActualAmount
                    };

                    Cache.put(cacheKey, statistics);
                    Cache.put('getStatistics', statistics);
                    if (typeof callback == 'function') callback(statistics);
                  });
                });
              });
            });
          });
        })
      });

      if (Utils.isEmpty(cache)) {
        cache = Cache.get('getStatistics');
      }

      if (!Utils.isEmpty(cache)) {
        return cache;
      }

      return {
        totalIncomePlanAmount: 0,
        totalIncomeActualAmount: 0,
        totalExpensePlanAmount: 0,
        totalExpenseActualAmount: 0,
        totalNeedIncomeAmount: 0,
        totalNeedIncomeActualAmount: 0
      };
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
    getTimestamp: function () {
      return Date.now() / 1000 | 0;
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
      try {
        // send request
        request.send(null);
      } catch (e) {
        return {
          meta: {
            code: 500,
            message: 'Cannot connect to server.'
          }
        };
      }

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

      try {
        // send request
        request.send(strData);
      } catch (e) {
        return {
          meta: {
            code: 500,
            message: 'Cannot connect to server.'
          }
        };
      }

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

// DB wrapper
.factory('DB', function($q, DB_CONFIG, Utils) {
  var self = this;
  self.db = null;

  self.init = function() {
      // self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); // Use in production
      self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', 2 * 1024 * 1024);

      angular.forEach(DB_CONFIG.tables, function(table) {
          var columns = [];

          angular.forEach(table.columns, function(column) {
              columns.push(column.name + ' ' + column.type);
          });

          var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
          self.query(query);
      });

      angular.forEach(DB_CONFIG.views, function(view) {
          var query = 'CREATE VIEW IF NOT EXISTS ' + view.name + ' AS ' + view.query + '';
          self.query(query);
      });
  };

  self.query = function(query, bindings) {
      bindings = typeof bindings !== 'undefined' ? bindings : [];
      var deferred = $q.defer();

      self.db.transaction(function(transaction) {
          transaction.executeSql(query, bindings, function(transaction, result) {
            deferred.resolve(result);
          }, function(transaction, error) {
            deferred.reject(error);
            // console.log(error);
          });
      });

      return deferred.promise;
  };

  self.executeMultipleQueries = function(queries, bindings) {
      bindings = typeof bindings !== 'undefined' ? bindings : [];

      self.db.transaction(function(transaction) {
        angular.forEach(queries, function(query) {
          transaction.executeSql(query, bindings, function(transaction, result) {
          }, function(transaction, error) {
            // console.log(error);
            // console.log(query);
          });
        });
      });

      return true;
  };

  self.fetchAll = function(result) {
      var output = [];

      for (var i = 0; i < result.rows.length; i++) {
          output.push(result.rows.item(i));
      }
      
      return output;
  };

  self.fetch = function(result) {
      return result.rows.item(0);
  };

  self.insert = function (tablename, data, condition, callback, errback) {
    var query = 'INSERT INTO ' + tablename;
    var sets = [];
    var setValues = [];
    var params = [];
    var conds = [];
    data.created = Utils.getTimestamp();
    angular.forEach(data, function (value, key) {
      sets[sets.length] = key;
      setValues[setValues.length] = '?';
      params[params.length] = value;
    });
    angular.forEach(condition, function (value, key) {
      conds[conds.length] = key + '=?';
      params[params.length] = value;
    });
    query += ' ( ' + sets.join(', ') + ') VALUES ( ' + setValues.join(', ') + ' )';
    if (conds.length) {
      query += ' WHERE ' + conds.join(' AND ');
    }
    self.query(query, params).then(function(result) {
      if (typeof callback == 'function') callback(result);
    }, function(error) {
      if (typeof errback == 'function') errback(error);
    });
  }

  self.update = function (tablename, data, condition, callback, errback) {
    var query = 'UPDATE ' + tablename;
    var sets = [];
    var params = [];
    var conds = [];
    data.modified = Utils.getTimestamp();
    angular.forEach(data, function (value, key) {
      sets[sets.length] = key + '=?';
      params[params.length] = value;
    });
    angular.forEach(condition, function (value, key) {
      conds[conds.length] = key + '=?';
      params[params.length] = value;
    });
    query += ' SET ' + sets.join(', ');
    if (conds.length) {
      query += ' WHERE ' + conds.join(' AND ');
    }
    self.query(query, params).then(function(result) {
      if (typeof callback == 'function') callback(result);
    }, function(error) {
      if (typeof errback == 'function') errback(error);
    });
  }

  self.delete = function (tablename, condition, callback, errback) {
    var query = 'DELETE FROM ' + tablename;
    var params = [];
    var conds = [];
    angular.forEach(condition, function (value, key) {
      conds[conds.length] = key + '=?';
      params[params.length] = value;
    });
    if (conds.length) {
      query += ' WHERE ' + conds.join(' AND ');
    }
    self.query(query, params).then(function(result) {
      if (typeof callback == 'function') callback(result);
    }, function(error) {
      if (typeof errback == 'function') errback(error);
    });
  }

  return self;
})

;
