angular.module('starter.controllers', [])

.controller('BudgetCtrl', function($scope, $stateParams, $location, $state, $ionicPopup, MMViewBudget, MMCommon, Cache, Auth, Utils, API) {
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
    $scope.editBudget = function(budget) {
        budget.edit = 1;
        $location.path('/tab/budget/form').search(budget);
    }
    $scope.deleteBudget = function(budget) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to delete this Budget?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                var resp = API.delete('/budgets/:budget_id', {
                    ':budget_id': budget.budget_id
                }, {});
                if (resp.meta.code != 200) {
                    $ionicPopup.alert({
                        title: resp.meta.message
                    });
                    return;
                }
                Cache.removeAll();
                $state.go($state.current, {}, {reload: true});
            }
        });
    }
})
.controller('BudgetFormCtrl', function($scope, $stateParams, $location, $ionicViewService, $ionicPopup, MMCategory, MMAsset, Utils, API, Cache, Auth) {
    Auth.requireLogin();

    var year = parseInt($stateParams.year);
    var month = parseInt($stateParams.month);
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

    $scope.years = [];
    for (i = 2013; i <= parseInt(Utils.getCurrentYear()) + 1; i++) {
        $scope.years[$scope.years.length] = i;
    }
    $scope.months = [{id: 1, name: "January"}, {id: 2, name: "February"}, {id: 3, name: "March"}, {id: 4, name: "April"}, {id: 5, name: "May"}, {id: 6, name: "June"}, {id: 7, name: "July"}, {id: 8, name: "August"}, {id: 9, name: "September"}, {id: 10, name: "October"}, {id: 11, name: "November"}, {id: 12, name: "December"}];
    
    $scope.types = ['Income', 'Expense'];
    $scope.trackings = ['None', 'Day by day'];
    $scope.categories = MMCategory.getCategories();

    $scope.budget = {
        year: year,
        month: month,
        type: 'Expense',
        tracking: false
    };

    if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
        $scope.budget.category_id = $stateParams.category_id;
        $scope.budget.year = parseInt($stateParams.year);
        $scope.budget.month = parseInt($stateParams.month);
        $scope.budget.title = $stateParams.title;
        $scope.budget.amount = parseInt($stateParams.amount);
        $scope.budget.description = $stateParams.description;
        $scope.budget.type = $stateParams.type == 0 ? 'Income' : 'Expense';
        $scope.budget.tracking = $stateParams.day_tracking == 0 ? false : true;
    }

    $scope.submit = function(budget) {
        if (Utils.isEmpty(budget.category_id)) {
            $ionicPopup.alert({
                title: 'Category cannot be blank.'
            });
            return;
        }
        if (Utils.isEmpty(budget.title)) {
            $ionicPopup.alert({
                title: 'Title cannot be blank.'
            });
            return;
        }
        if (Utils.isEmpty(budget.amount)) {
            $ionicPopup.alert({
                title: 'Amount cannot be blank.'
            });
            return;
        }

        var postform = {};
        angular.forEach(budget, function(value, key) {
            postform[key] = value;
        });
        postform.tracking = budget.tracking == false ? 0 : 1;
        postform.type = budget.type == 'Income' ? 0 : 1;
        if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
            var resp = API.put('/budgets/:budget_id', {
                ':budget_id': $stateParams.budget_id
            }, postform);
        } else {
            var resp = API.post('/budgets', {}, postform);
        }
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
        $location.path('/tab/budget').search({
            year: year,
            month: month
        });
    }
})

.controller('BillsCtrl', function($scope, $stateParams, $location, $state, $ionicPopup, MMBill, MMCommon, Auth, API, Utils, Cache) {
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

    $scope.editBill = function(bill) {
        bill.edit = 1;
        $location.path('/tab/bills/form').search(bill);
    }
    $scope.deleteBill = function(bill) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to delete this Bill?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                var resp = API.delete('/bills/:bill_id', {
                    ':bill_id': bill.id
                }, {});
                if (resp.meta.code != 200) {
                    $ionicPopup.alert({
                        title: resp.meta.message
                    });
                    return;
                }
                Cache.removeAll();
                $state.go($state.current, {}, {reload: true});
            }
        });
    }
})
.controller('BillFormCtrl', function($scope, $stateParams, $location, $ionicViewService, $ionicPopup, MMViewBudget, MMAsset, Utils, API, Cache, Auth) {
    Auth.requireLogin();

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

    // budget select
    $scope.budgets = MMViewBudget.getBudgets(month, year, type);

    // asset select
    $scope.assets = MMAsset.getAssets();

    $scope.bill = {
        day: year + '-' + Utils.numPad(month, 2) + '-' + Utils.numPad(day, 2),
        asset_id: $scope.assets[0].id,
    };

    if (!Utils.isEmpty($stateParams.budget_id)) {
        $scope.bill.budget_id = $stateParams.budget_id;
    }

    if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
        if (!Utils.isEmpty($stateParams.budget_id)) {
            $scope.bill.budget_id = $stateParams.budget_id;
        }
        if (!Utils.isEmpty($stateParams.asset_id)) {
            $scope.bill.asset_id = $stateParams.asset_id;
        }
        $scope.bill.title = $stateParams.title;
        $scope.bill.amount = parseInt($stateParams.amount);
        $scope.bill.description = $stateParams.description;
    }

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
        var postform = {};
        angular.forEach(bill, function(value, key) {
            postform[key] = value;
        });
        if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
            var resp = API.put('/bills/:bill_id', {
                ':bill_id': $stateParams.id
            }, postform);
        } else {
            var resp = API.post('/bills', {}, postform);
        }
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

        if (Utils.isEmpty(isContinue) || isContinue == 0) {
            $location.path("/tab/bills").search({year:year, month:month});
        } else {
            var params = {};
            angular.forEach($stateParams, function(value, key) {
                params[key] = value;
            });
            $scope.bill.title = '';
            $scope.bill.amount = '';
            $scope.bill.description = '';
            $stateParams.edit = 0;
        }
    }
})

.controller('TransfersCtrl', function($scope, $stateParams, $ionicPopup, $location, $state, MMAssetTransfer, MMCommon, Auth, API, Utils, Cache) {
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
    $scope.transfers = MMAssetTransfer.getTransfersByMonth(month, year);

    $scope.editTransfer = function(transfer) {
        transfer.edit = 1;
        $location.path('/tab/transfers/form').search(transfer);
    }
    $scope.deleteTransfer = function(transfer) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to delete this Transfer?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                var resp = API.delete('/transfers/:transfer_id', {
                    ':transfer_id': transfer.id
                }, {});
                if (resp.meta.code != 200) {
                    $ionicPopup.alert({
                        title: resp.meta.message
                    });
                    return;
                }
                Cache.removeAll();
                $state.go($state.current, {}, {reload: true});
            }
        });
    }
})
.controller('TransferFormCtrl', function($scope, $stateParams, $location, $ionicViewService, $ionicPopup, MMAssetTransfer, MMAsset, Utils, API, Cache, Auth) {
    Auth.requireLogin();

    var year = $stateParams.year;
    var month = $stateParams.month;
    var day = $stateParams.day;
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

    // asset select
    $scope.assets = MMAsset.getAssets();

    $scope.transfer = {
        day: year + '-' + Utils.numPad(month, 2) + '-' + Utils.numPad(day, 2)
    };

    if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
        if (!Utils.isEmpty($stateParams.from_account_id)) {
            $scope.transfer.from_account_id = $stateParams.from_account_id;
        }

        if (!Utils.isEmpty($stateParams.to_account_id)) {
            $scope.transfer.to_account_id = $stateParams.to_account_id;
        }
        $scope.transfer.title = $stateParams.title;
        $scope.transfer.amount = parseInt($stateParams.amount);
        $scope.transfer.fee = parseInt($stateParams.fee);
        $scope.transfer.description = $stateParams.description;
    }

    $scope.submit = function(transfer) {
        if (Utils.isEmpty(transfer.from_account_id)) {
            $ionicPopup.alert({
                title: 'Account Source cannot be blank.'
            });
            return;
        }
        if (Utils.isEmpty(transfer.to_account_id)) {
            $ionicPopup.alert({
                title: 'Account Destination cannot be blank.'
            });
            return;
        }
        if (transfer.from_account_id == transfer.to_account_id) {
            $ionicPopup.alert({
                title: 'Account Source and Destination must difference.'
            });
            return;
        }
        if (Utils.isEmpty(transfer.amount)) {
            $ionicPopup.alert({
                title: 'Amount cannot be blank.'
            });
            return;
        }
        var postform = {};
        angular.forEach(transfer, function(value, key) {
            postform[key] = value;
        });
        if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
            var resp = API.put('/transfers/:transfer_id', {
                ':transfer_id': $stateParams.id
            }, postform);
        } else {
            var resp = API.post('/transfers', {}, postform);
        }
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

         $location.path("/tab/transfers").search({year:year, month:month});
    }
})

.controller('AssetsCtrl', function($scope, $stateParams, $ionicPopup, $location, $state, MMAsset, MMCommon, Auth, API, Utils, Cache) {
    Auth.requireLogin();

    $scope.assets = MMAsset.getAssets('?more=amount_current');

    $scope.editAsset = function(asset) {
        asset.edit = 1;
        $location.path('/tab/assets/form').search(asset);
    }
    $scope.deleteAsset = function(asset) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to delete this Account?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                var resp = API.delete('/assets/:asset_id', {
                    ':asset_id': asset.id
                }, {});
                if (resp.meta.code != 200) {
                    $ionicPopup.alert({
                        title: resp.meta.message
                    });
                    return;
                }
                Cache.removeAll();
                $state.go($state.current, {}, {reload: true});
            }
        });
    }
})
.controller('AssetFormCtrl', function($scope, $stateParams, $location, $ionicViewService, $ionicPopup, MMAsset, Utils, API, Cache, Auth) {
    Auth.requireLogin();

    // asset select
    $scope.groups = MMAsset.getGroups();

    $scope.asset = {
        is_save_account: false
    };

    if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
        if (!Utils.isEmpty($stateParams.group_id)) {
            $scope.asset.group_id = $stateParams.group_id;
        }

        $scope.asset.title = $stateParams.title;
        $scope.asset.amount = parseInt($stateParams.amount);
        $scope.asset.keep_amount = parseInt($stateParams.keep_amount);
        $scope.asset.description = $stateParams.description;
        $scope.asset.is_save_account = $stateParams.is_save_account == 0 ? false : true;
    }

    $scope.submit = function(asset) {
        if (Utils.isEmpty(asset.group_id)) {
            $ionicPopup.alert({
                title: 'Group cannot be blank.'
            });
            return;
        }
        if (Utils.isEmpty(asset.title)) {
            $ionicPopup.alert({
                title: 'Title cannot be blank.'
            });
            return;
        }
        if (Utils.isEmpty(asset.amount)) {
            $ionicPopup.alert({
                title: 'Amount cannot be blank.'
            });
            return;
        }
        var postform = {};
        angular.forEach(asset, function(value, key) {
            postform[key] = value;
        });
        postform.is_save_account = asset.is_save_account == false ? 0 : 1;
        if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
            var resp = API.put('/assets/:asset_id', {
                ':asset_id': $stateParams.id
            }, postform);
        } else {
            var resp = API.post('/assets', {}, postform);
        }
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

         $location.path("/tab/assets").search({year:year, month:month});
    }
})

.controller('LoginCtrl', function($scope, CookieComponent, $location, $ionicPopup, Auth, Utils, Cache) {
    Cache.removeAll();
    Auth.logout();
    $scope.submit = function(auth) {
        var user = '';
        var pass = '';
        if (!Utils.isEmpty(auth) && !Utils.isEmpty(auth.user) && !Utils.isEmpty(auth.pass)) {
            user = auth.user;
            pass = auth.pass;
        }
        Auth.login(user, pass);
        $location.path("/tab/budget");
    }
})

.controller('CommonCtrl', function($scope, $stateParams, $location, $state, $ionicViewService, $filter, Utils, Cache) {
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
    $scope.goToPage = function(path) {
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
        $location.path(path).search({year:year, month:month});
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
        $location.path('/tab/bills/form').search(params);
    }
    $scope.reloadAll = function() {
        Cache.removeAll();
        $state.go($state.current, {}, {reload: true});
    }
})

;
