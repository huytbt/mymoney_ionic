// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.config', 'starter.directives', 'starter.controllers', 'starter.services', 'ngCookies'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.run(function(DB) {
    DB.init();
})

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

        // setup an abstract state for the tabs directive
        .state('tab', {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html"
        })

        // Each tab has its own nav history stack:

        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
        })

        .state('tab.budget', {
            url: '/budget?year&month',
            views: {
                'tab-budget': {
                    templateUrl: 'templates/tab-budget.html',
                    controller: 'BudgetCtrl'
                }
            }
        })
        .state('tab.budget-form', {
            url: '/budget/form?year&month&budget_id&category_id&title&amount&type&day_tracking&description&edit',
            views: {
                'tab-budget': {
                    templateUrl: 'templates/budget-form.html',
                    controller: 'BudgetFormCtrl'
                }
            }
        })

        .state('tab.bills', {
            url: '/bills?year&month&budget_id',
            views: {
                'tab-bills': {
                    templateUrl: 'templates/tab-bills.html',
                    controller: 'BillsCtrl'
                }
            }
        })
        .state('tab.bill-form', {
            url: '/bills/form?id&type&year&month&day&title&amount&description&asset_id&budget_id&edit',
            views: {
                'tab-bills': {
                    templateUrl: 'templates/bill-form.html',
                    controller: 'BillFormCtrl'
                }
            }
        })

        .state('tab.transfer', {
            url: '/transfers?year&month',
            views: {
                'tab-transfers': {
                    templateUrl: 'templates/tab-transfers.html',
                    controller: 'TransfersCtrl'
                }
            }
        })
        .state('tab.transfer-form', {
            url: '/transfers/form?id&type&year&month&day&title&description&amount&fee&from_account_id&to_account_id&edit',
            views: {
                'tab-transfers': {
                    templateUrl: 'templates/transfer-form.html',
                    controller: 'TransferFormCtrl'
                }
            }
        })

        .state('tab.asset', {
            url: '/assets?year&month',
            views: {
                'tab-assets': {
                    templateUrl: 'templates/tab-assets.html',
                    controller: 'AssetsCtrl'
                }
            }
        })
        .state('tab.asset-form', {
            url: '/assets/form?id&group_id&title&description&amount&keep_amount&is_save_account&is_enable&edit',
            views: {
                'tab-assets': {
                    templateUrl: 'templates/asset-form.html',
                    controller: 'AssetFormCtrl'
                }
            }
        })

        .state('tab.backups', {
            url: '/backups',
            views: {
                'tab-hidden': {
                    templateUrl: 'templates/tab-backups.html',
                    controller: 'BackupsCtrl'
                }
            }
        })
        .state('tab.backups-form', {
            url: '/backups/form',
            views: {
                'tab-hidden': {
                    templateUrl: 'templates/backups-form.html',
                    controller: 'BackupsFormCtrl'
                }
            }
        })

        ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/budget');

})

;
