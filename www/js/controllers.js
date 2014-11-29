angular.module('starter.controllers', [])

.controller('BudgetCtrl', function($scope, $stateParams, $location, MMViewBudget, MMCommon, Auth, Utils) {
    Auth.requireLogin();

    var year = $stateParams.year;
    var month = $stateParams.month;
    if (Utils.isEmpty(year)) {
        year = Utils.getCurrentYear();
    }
    if (Utils.isEmpty(month)) {
        month = Utils.getCurrentMonth();
    }
    $scope.transferRequests = {
        year: year,
        month: month
    };
    $scope.budgets = MMViewBudget.getBudgetsByMonth(month, year);
    $scope.statistics = MMCommon.getStatistics(month, year);

    $scope.goBills = function(budget) {
        $location.path('/tab/bills').search({year:year, month:month, budget_id: budget.budget_id});
    }
})

.controller('BillsCtrl', function($scope, $stateParams, MMBill, MMCommon, Auth, Utils) {
    Auth.requireLogin();

    var year = $stateParams.year;
    var month = $stateParams.month;
    var budget_id = $stateParams.budget_id;
    if (Utils.isEmpty(year)) {
        year = Utils.getCurrentYear();
    }
    if (Utils.isEmpty(month)) {
        month = Utils.getCurrentMonth();
    }
    $scope.transferRequests = {
        year: year,
        month: month,
        budget_id: budget_id
    };
    $scope.bills = MMBill.getBillsByMonth(month, year, budget_id);
    $scope.statistics = MMCommon.getStatistics(month, year);
})

.controller('BillCreateCtrl', function($scope, $stateParams, $location, $ionicViewService, $ionicPopup, MMViewBudget, MMAsset, Utils, API, Cache) {
    var year = $stateParams.year;
    var month = $stateParams.month;
    var day = $stateParams.day;
    var type = $stateParams.type;
    if (Utils.isEmpty(type)) {
        type = 1;
    }
    if (Utils.isEmpty(year)) {
        year = Utils.getCurrentYear();
    }
    if (Utils.isEmpty(month)) {
        month = Utils.getCurrentMonth();
    }
    if (Utils.isEmpty(day)) {
        day = Utils.getCurrentDay();
    }
    $scope.transferRequests = {
        year: year,
        month: month,
        day: day
    };

    $scope.type = type;

    // day select
    var days = [];
    var totalDaysOfMonth = Utils.getTotalDaysOfMonth(year, month);
    for (i=1; i<=totalDaysOfMonth; i++) days[days.length] = i;
    $scope.days = days;

    // budget select
    $scope.budgets = MMViewBudget.getBudgets(month, year, type);

    // asset select
    $scope.assets = MMAsset.getAssets();

    $scope.bill = {
        day: year + '-' + month + '-' + day
    };

    $scope.submit = function(bill, isContinue) {
        if (Utils.isEmpty(bill.budget_id)) {
            $ionicPopup.alert({
                title: 'Budget cannot be blank.'
            });
            return;
        }
        if (Utils.isEmpty(bill.asset_id)) {
            $ionicPopup.alert({
                title: 'Asset cannot be blank.'
            });
            return;
        }
        if (Utils.isEmpty(bill.amount)) {
            $ionicPopup.alert({
                title: 'Amount cannot be blank.'
            });
            return;
        }
        bill.type = type;
        var resp = API.post('/bills', {}, bill);
        if (resp.meta.code != 200) {
            $ionicPopup.alert({
                title: resp.meta.message
            });
            return;
        }
        Cache.removeAll();

        $ionicViewService.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });
        $location.path("/tab/bills").search({year:year, month:month});
    }
})

.controller('AccountCtrl', function($scope) {
})

.controller('LoginCtrl', function($scope, $cookieStore, $location, $ionicPopup, Auth, Utils) {
    $cookieStore.remove('auth');
    $scope.submit = function(auth) {
        if (!Utils.isEmpty(auth) && !Utils.isEmpty(auth.user) && !Utils.isEmpty(auth.pass)) {
            $cookieStore.put('auth', {
                user: auth.user,
                pass: auth.pass
            });
            $location.path("/tab/budget");
        } else {
            $ionicPopup.alert({
                title: 'Username and password cannot be blank. Please try again.'
            });
        }
    }
})

.controller('CommonCtrl', function($scope, $stateParams, $location, $ionicViewService, $filter, Utils) {
    $scope.prevMonth = function() {
        var params = {};
        angular.forEach($stateParams, function(value, key) {
            params[key] = value;
        });
        var path = $location.$$path;
        var year = $stateParams.year;
        var month = $stateParams.month;
        if (Utils.isEmpty(year)) {
            year = Utils.getCurrentYear();
        }
        if (Utils.isEmpty(month)) {
            month = Utils.getCurrentMonth();
        }
        month--;
        if (month < 1) {
            month = 12;
            year--;
        }
        params.month = month;
        params.year = year;
        $ionicViewService.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });
        $location.path(path).search(params);
    }
    $scope.nextMonth = function() {
        var params = {};
        angular.forEach($stateParams, function(value, key) {
            params[key] = value;
        });
        var path = $location.$$path;
        var year = $stateParams.year;
        var month = $stateParams.month;
        if (Utils.isEmpty(year)) {
            year = Utils.getCurrentYear();
        }
        if (Utils.isEmpty(month)) {
            month = Utils.getCurrentMonth();
        }
        month++;
        if (month > 12) {
            month = 1;
            year++;
        }
        params.month = month;
        params.year = year;
        $ionicViewService.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });
        $location.path(path).search(params);
    }
    $scope.goBudgetsPage = function() {
        var year = $stateParams.year;
        var month = $stateParams.month;
        if (Utils.isEmpty(year)) {
            year = Utils.getCurrentYear();
        }
        if (Utils.isEmpty(month)) {
            month = Utils.getCurrentMonth();
        }
        $ionicViewService.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });
        $location.path('/tab/budget').search({year:year, month:month});
    }
    $scope.goBillsPage = function() {
        var year = $stateParams.year;
        var month = $stateParams.month;
        if (Utils.isEmpty(year)) {
            year = Utils.getCurrentYear();
        }
        if (Utils.isEmpty(month)) {
            month = Utils.getCurrentMonth();
        }
        $ionicViewService.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });
        $location.path('/tab/bills').search({year:year, month:month});
    }
    $scope.goCurrentDay = function() {
        var params = {};
        angular.forEach($stateParams, function(value, key) {
            params[key] = value;
        });
        var path = $location.$$path;
        var year = Utils.getCurrentYear();
        var month = Utils.getCurrentMonth();
        $ionicViewService.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });
        params.month = month;
        params.year = year;
        $location.path(path).search(params);
    }
    $scope.goCreateBill = function(type, day) {
        var year = $stateParams.year;
        var month = $stateParams.month;
        var budget_id = $stateParams.budget_id;
        if (Utils.isEmpty(year)) {
            year = Utils.getCurrentYear();
        }
        if (Utils.isEmpty(month)) {
            month = Utils.getCurrentMonth();
        }
        if (Utils.isEmpty(day)) {
            day = $stateParams.day;
            if (Utils.isEmpty(day)) {
                day = Utils.getCurrentDay();
            }
        }
        if (Utils.isEmpty(type)) {
            type = 1;
        }
        var params = {
            day: day,
            month: month,
            year: year,
            type: type
        };
        if (!Utils.isEmpty(budget_id)) {
            params.budget_id = budget_id;
        }
        $ionicViewService.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });
        $location.path('/tab/bills/create').search(params);
    }
})

;
