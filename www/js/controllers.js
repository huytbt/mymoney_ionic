angular.module('starter.controllers', [])

.controller('BudgetCtrl', function($scope, $stateParams, $location, $state, $ionicPopup, MMViewBudget, MMCommon, Cache, Auth, Utils, API, DB) {
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
    $scope.budgets = MMViewBudget.getBudgetsByMonth(month, year, function(budgets) {
        $scope.budgets = budgets;
    });
    $scope.statistics = MMCommon.getStatistics(month, year, function(statistics) {
        $scope.statistics = statistics;
    });

    $scope.goBills = function(budget) {
        $location.path('/tab/bills').search({year:year, month:month, budget_id: budget.budget_id});
    }
    $scope.editBudget = function(budget) {
        budget.edit = 1;
        $location.path('/tab/budget/form').search({
            year: budget.year,
            month: budget.month,
            budget_id: budget.budget_id,
            category_id: budget.category_id,
            title: budget.title ? budget.title : '',
            amount: budget.amount,
            type: budget.type,
            day_tracking: budget.day_tracking,
            description: budget.description ? budget.description : '',
            edit: 1
        });
    }
    $scope.deleteBudget = function(budget) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to delete this Budget?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                // var resp = API.delete('/budgets/:budget_id', {
                //     ':budget_id': budget.budget_id
                // }, {});
                DB.delete('mm_budgets', {id: budget.budget_id}, function (result) {
                    $state.go($state.current, {}, {reload: true});
                }, function (error) {
                    $ionicPopup.alert({
                        title: 'Cannot delete.'
                    });
                });
            }
        });
    }
})
.controller('BudgetFormCtrl', function($scope, $stateParams, $location, $ionicViewService, $ionicPopup, MMCategory, MMAsset, Utils, API, Cache, Auth, DB) {
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
    $scope.categories = MMCategory.getCategories(function(categories) {
        $scope.categories = categories;
    });

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

        var callback = function (result) {
            $ionicViewService.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            $location.path('/tab/budget').search({
                year: year,
                month: month
            });
        };
        var errback = function (error) {
            $ionicPopup.alert({
                title: 'Cannot execute.'
            });
        };

        var postform = {};
        angular.forEach(budget, function(value, key) {
            postform[key] = value;
        });
        postform.day_tracking = budget.tracking == false ? 0 : 1;
        postform.description = budget.description | "";
        delete(postform.tracking);
        MMCategory.getCategory(budget.category_id, function (category) {

            postform.type = category.type;
            if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
                DB.update('mm_budgets', postform, {id: $stateParams.budget_id}, callback, errback);
                // var resp = API.put('/budgets/:budget_id', {
                //     ':budget_id': $stateParams.budget_id
                // }, postform);
            } else {
                DB.insert('mm_budgets', postform, {}, callback, errback);
                // var resp = API.post('/budgets', {}, postform);
            }
        });
    }
})

.controller('BillsCtrl', function($scope, $stateParams, $location, $state, $ionicPopup, MMBill, MMCommon, Auth, API, Utils, Cache, DB) {
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
    $scope.bills = MMBill.getBillsByMonth(month, year, budget_id, function(bills) {
        $scope.bills = bills;
    });
    $scope.statistics = MMCommon.getStatistics(month, year, function(statistics) {
        $scope.statistics = statistics;
    });

    $scope.editBill = function(bill) {
        $location.path('/tab/bills/form').search({
            id: bill.id,
            type: bill.type,
            year: bill.year,
            month: bill.month,
            day: bill.day,
            title: bill.title ? bill.title : '',
            amount: bill.amount,
            description: bill.description ? bill.description : '',
            asset_id: bill.asset_id,
            budget_id: bill.budget_id,
            edit: 1
        });
    }
    $scope.deleteBill = function(bill) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to delete this Bill?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                DB.delete('mm_bills', {id: bill.id}, function (result) {
                    $state.go($state.current, {}, {reload: true});
                }, function (error) {
                    $ionicPopup.alert({
                        title: 'Cannot delete.'
                    });
                });
                // var resp = API.delete('/bills/:bill_id', {
                //     ':bill_id': bill.id
                // }, {});
            }
        });
    }
})
.controller('BillFormCtrl', function($scope, $stateParams, $location, $ionicViewService, $ionicPopup, MMViewBudget, MMAsset, Utils, API, Cache, Auth, DB) {
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
    $scope.budgets = MMViewBudget.getBudgets(month, year, type, function(budgets) {
        $scope.budgets = budgets;
    });

    // asset select
    $scope.assets = MMAsset.getAssets('', function(assets) {
        $scope.assets = assets;
        if ($scope.assets.length && Utils.isEmpty($scope.bill.asset_id)) {
            $scope.bill.asset_id = $scope.assets[0].id;
        }
    });

    $scope.bill = {
        day: year + '-' + Utils.numPad(month, 2) + '-' + Utils.numPad(day, 2)
    };

    if ($scope.assets.length && Utils.isEmpty($scope.bill.asset_id)) {
        $scope.bill.asset_id = $scope.assets[0].id;
    }

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

    $scope.changeDay = function(bill) {
        var arrDate = bill.day.split('-');
        if (parseInt(arrDate[0]) == parseInt(year) && parseInt(arrDate[1]) == parseInt(month)) {
            return;
        }
        year = parseInt(arrDate[0]);
        month = parseInt(arrDate[1]);
        // budget select
        $scope.budgets = MMViewBudget.getBudgets(month, year, type, function(budgets) {
            $scope.budgets = budgets;
        });
        // console.log(bill.day);
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

        var callback = function (result) {
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
        };
        var errback = function (error) {
            $ionicPopup.alert({
                title: 'Cannot execute.'
            });
        };

        bill.type = type;
        var postform = {};
        angular.forEach(bill, function(value, key) {
            postform[key] = value;
        });
        var arrDate = postform.day.split('-');
        postform.year = arrDate[0];
        postform.month = arrDate[1];
        postform.day = arrDate[2];
        postform.title = postform.title ? postform.title : '';
        postform.description = postform.description ? postform.description : '';
        if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
            DB.update('mm_bills', postform, { id: $stateParams.id }, callback, errback);
            // var resp = API.put('/bills/:bill_id', {
            //     ':bill_id': $stateParams.id
            // }, postform);
        } else {
            DB.insert('mm_bills', postform, {}, callback, errback);
            // var resp = API.post('/bills', {}, postform);
        }
    }
})

.controller('TransfersCtrl', function($scope, $stateParams, $ionicPopup, $location, $state, MMAssetTransfer, MMCommon, Auth, API, Utils, Cache, DB) {
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
    $scope.transfers = MMAssetTransfer.getTransfersByMonth(month, year, function(transfers) {
        $scope.transfers = transfers;
    });

    $scope.editTransfer = function(transfer) {
        $location.path('/tab/transfers/form').search({
            id: transfer.id,
            type: transfer.type,
            year: transfer.year,
            month: transfer.month,
            day: transfer.day,
            title: transfer.title,
            description: transfer.description,
            amount: transfer.amount,
            fee: transfer.fee,
            from_account_id: transfer.from_account_id,
            to_account_id: transfer.to_account_id,
            edit: 1
        });
    }
    $scope.deleteTransfer = function(transfer) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to delete this Transfer?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                DB.delete('mm_asset_transfers', { id: transfer.id }, function (result) {
                    $state.go($state.current, {}, {reload: true});
                }, function (error) {
                    $ionicPopup.alert({
                        title: 'Cannot delete.'
                    });
                });
                // var resp = API.delete('/transfers/:transfer_id', {
                //     ':transfer_id': transfer.id
                // }, {});
            }
        });
    }
})
.controller('TransferFormCtrl', function($scope, $stateParams, $location, $ionicViewService, $ionicPopup, MMAssetTransfer, MMAsset, Utils, API, Cache, Auth, DB) {
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
    $scope.assets = MMAsset.getAssets('', function (assets) {
        $scope.assets = assets;
    });

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

        var callback = function (result) {
            $ionicViewService.nextViewOptions({
              disableAnimate: true,
              disableBack: true
            });

            $location.path("/tab/transfers").search({year:year, month:month});
        };
        var errback = function (error) {
            $ionicPopup.alert({
                title: 'Cannot execute.'
            });
        };

        var postform = {};
        angular.forEach(transfer, function(value, key) {
            postform[key] = value;
        });
        var arrDate = postform.day.split('-');
        postform.year = arrDate[0];
        postform.month = arrDate[1];
        postform.day = arrDate[2];
        if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
            DB.update('mm_asset_transfers', postform, { id: $stateParams.id }, callback, errback);
            // var resp = API.put('/transfers/:transfer_id', {
            //     ':transfer_id': $stateParams.id
            // }, postform);
        } else {
            DB.insert('mm_asset_transfers', postform, {}, callback, errback);
            // var resp = API.post('/transfers', {}, postform);
        }
    }
})

.controller('BackupsCtrl', function($scope, $stateParams, $ionicLoading, $ionicPopup, $timeout, $location, $state, MMBackup, MMCommon, Auth, API, Utils, DB, Cache) {
    Auth.requireLogin();

    $scope.backups = MMBackup.getBackups();

    MMBackup.getTotalRecords(function(total) {
        $scope.totalRecords = total;
    });

    $scope.restoreBackup = function(backup) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to restore this Backup?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                $ionicLoading.show({
                    template: '<i class="icon ion-looping"></i> Restoring...'
                });
                $timeout(function() {
                    MMBackup.resetDb();
                    var queries = [];
                    queries = MMBackup.restore(backup.name, 'mm_asset_groups');
                    queries = queries.concat(MMBackup.restore(backup.name, 'mm_assets'));
                    queries = queries.concat(MMBackup.restore(backup.name, 'mm_asset_transfers'));
                    queries = queries.concat(MMBackup.restore(backup.name, 'mm_categories'));
                    queries = queries.concat(MMBackup.restore(backup.name, 'mm_budgets'));
                    queries = queries.concat(MMBackup.restore(backup.name, 'mm_bills'));
                    DB.executeMultipleQueries(queries);
                    $ionicLoading.hide();
                }, 100);
            }
        });
    }
    $scope.saveBackup = function(backup) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to save all data to this Backup?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                $ionicLoading.show({
                    template: '<i class="icon ion-looping"></i> Saving...'
                });
                $timeout(function() {
                    MMBackup.newBackup(backup.name);
                    MMBackup.backup(backup.name, 'mm_asset_groups', function() {
                        MMBackup.backup(backup.name, 'mm_assets', function() {
                            MMBackup.backup(backup.name, 'mm_asset_transfers', function() {
                                MMBackup.backup(backup.name, 'mm_categories', function() {
                                    MMBackup.backup(backup.name, 'mm_budgets', function() {
                                        MMBackup.backup(backup.name, 'mm_bills', function() {
                                            $ionicLoading.hide();
                                        });
                                    });
                                });
                            });
                        });
                    });
                }, 100);
            }
        });
    }
    $scope.deleteBackup = function(backup) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to delete this Backup?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                var resp = API.delete('/backups/:filename', {
                    ':filename': backup.name
                }, {});
                if (resp.meta.code != 200) {
                    $ionicPopup.alert({
                        title: resp.meta.message
                    });
                    return;
                }
                $state.go($state.current, {}, {reload: true});
            }
        });
    }
})
.controller('BackupsFormCtrl', function($scope, $stateParams, $ionicLoading, $ionicPopup, $timeout, $location, $state, MMBackup, MMCommon, Auth, API, Utils, DB, Cache) {
    Auth.requireLogin();

    $scope.submit = function(backup) {
        backup = backup || '';
        var validator = /^[0-9a-zA-Z_-]+$/;
        if (!backup.name.match(validator)) {
            $ionicPopup.alert({
                title: 'Name contains invalid characters.'
            });
            return;
        }
        $ionicLoading.show({
            template: '<i class="icon ion-looping"></i> Saving...'
        });
        $timeout(function() {
            MMBackup.newBackup(backup.name);
            MMBackup.backup(backup.name, 'mm_asset_groups', function() {
                MMBackup.backup(backup.name, 'mm_assets', function() {
                    MMBackup.backup(backup.name, 'mm_asset_transfers', function() {
                        MMBackup.backup(backup.name, 'mm_categories', function() {
                            MMBackup.backup(backup.name, 'mm_budgets', function() {
                                MMBackup.backup(backup.name, 'mm_bills', function() {
                                    $ionicLoading.hide();
                                    $location.path("/tab/backups");
                                });
                            });
                        });
                    });
                });
            });
        }, 100);
    }
})

.controller('AssetsCtrl', function($scope, $stateParams, $ionicPopup, $location, $state, MMAsset, MMCommon, Auth, API, Utils, Cache, DB) {
    $scope.assets = MMAsset.getAssets('?more=amount_current', function(assets) {
        $scope.assets = assets;
    });

    $scope.editAsset = function(asset) {
        $location.path('/tab/assets/form').search({
            id: asset.id,
            group_id: asset.group_id,
            title: asset.title,
            description: asset.description,
            amount: asset.amount,
            keep_amount: asset.keep_amount,
            is_save_account: asset.is_save_account,
            is_enable: asset.is_enable,
            edit: 1
        });
    }
    $scope.deleteAsset = function(asset) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure to delete this Account?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                DB.delete('mm_assets', { id: asset.id }, function (result) {
                    $state.go($state.current, {}, {reload: true});
                }, function (error) {
                    $ionicPopup.alert({
                        title: 'Cannot delete.'
                    });
                });
                // var resp = API.delete('/assets/:asset_id', {
                //     ':asset_id': asset.id
                // }, {});
            }
        });
    }
})
.controller('AssetFormCtrl', function($scope, $stateParams, $location, $ionicViewService, $ionicPopup, MMAsset, Utils, API, Cache, Auth, DB) {
    // asset select
    $scope.groups = MMAsset.getGroups(function (groups) {
        $scope.groups = groups;
    });

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

        var callback = function (result) {
            $ionicViewService.nextViewOptions({
              disableAnimate: true,
              disableBack: true
            });

             $location.path("/tab/assets").search({year:year, month:month});
        };
        var errback = function (error) {
            $ionicPopup.alert({
                title: 'Cannot execute.'
            });
        };

        var postform = {};
        angular.forEach(asset, function(value, key) {
            postform[key] = value;
        });
        postform.is_save_account = asset.is_save_account == false ? 0 : 1;
        if (!Utils.isEmpty($stateParams.edit) && $stateParams.edit == 1) {
            DB.update('mm_assets', postform, { id: $stateParams.id }, callback, errback);
            // var resp = API.put('/assets/:asset_id', {
            //     ':asset_id': $stateParams.id
            // }, postform);
        } else {
            DB.insert('mm_assets', postform, {}, callback, errback);
            // var resp = API.post('/assets', {}, postform);
        }
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
