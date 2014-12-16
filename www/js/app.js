// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCookies'])

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

        ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/budget');

})

.directive('fancySelect', ['$ionicModal', function($ionicModal) {
    return {
        /* Only use as <fancy-select> tag */
        restrict : 'E',

        /* Our template */
        templateUrl: 'templates/fancy-select.html',

        /* Attributes to set */
        scope: {
            'ngItems'      : '=', /* Items list is mandatory */
            'name'         : '=', /* Displayed text is mandatory */
            'value'        : '=', /* Selected value binding is mandatory */
            'callback'     : '&'
        },

        link: function (scope, element, attrs) {

            /* Default values */
            scope.multiSelect   = attrs.multiSelect === 'true' ? true : false;
            scope.allowEmpty    = attrs.allowEmpty === 'false' ? false : true;

            /* Header used in ion-header-bar */
            scope.headerText    = attrs.headerText || '';

            /* Text displayed on label */
            scope.defaultText   = attrs.textDefault || '';
            scope.text          = scope.defaultText;

            attrs.textField = attrs.textField || 'name';
            attrs.valueField = attrs.valueField || 'id';
            attrs.groupField = attrs.groupField || '';
            attrs.iconField = attrs.iconField || 'icon';
            angular.forEach(scope.ngItems, function(value, key) {
                if (typeof value == 'object') {
                    scope.ngItems[key].fancyDataType = 'object';
                    scope.ngItems[key].fancyTextShow = value[attrs.textField];
                    scope.ngItems[key].fancyValue = value[attrs.valueField];
                    scope.ngItems[key].fancyIsItem = true;
                    scope.ngItems[key].fancyIconShow = value[attrs.textField] || null;
                    if (scope.value && scope.value == value[attrs.valueField]) {
                        scope.ngItems[key].fancyChecked = true;
                        scope.text = value[attrs.textField];
                    } else {
                        scope.ngItems[key].fancyChecked = false;
                    }
                } else {
                    scope.ngItems[key] = {
                        fancyDataType: 'generic'
                    };
                    scope.ngItems[key].fancyValue = value;
                    scope.ngItems[key].fancyIsItem = true;
                    scope.ngItems[key].fancyTextShow = value;
                    scope.ngItems[key].fancyIconShow = value || null;
                    if (scope.value  == value) {
                        scope.ngItems[key].fancyChecked = true;
                        scope.text = value;
                    } else {
                        scope.ngItems[key].fancyChecked = false;
                    }
                }
            });

            // Group items
            if (attrs.groupField != '') {
                var groups = {};
                var groupItems = [];
                angular.forEach(scope.ngItems, function(value, key) {
                    if (typeof groups[value[attrs.groupField]] == 'undefined') {
                        groups[value[attrs.groupField]] = [];
                    }

                    groups[value[attrs.groupField]][groups[value[attrs.groupField]].length] = value;
                });
                angular.forEach(groups, function(group, gindex) {
                    angular.forEach(group, function(item, index) {
                        if (index == 0) {
                            var groupItem = {
                                fancyIsItem: false,
                                fancyTextShow: gindex,
                                fancyIconShow: null,
                                fancyChecked: false,
                                fancyDataType: 'generic',
                                fancyValue: gindex
                            };
                            groupItem[attrs.textField] = gindex;
                            groupItem[attrs.valueField] = gindex;
                            groupItems[groupItems.length] = groupItem;
                        }
                        groupItems[groupItems.length] = item;
                    });
                });
                scope.ngItems = groupItems;
            }

            if (scope.value && scope.value[attrs.textField]) {
                scope.text          = scope.value[attrs.textField];
            }

            /* Optionnal callback function */
            // scope.callback = attrs.callback || null;

            /* Instanciate ionic modal view and set params */

            /* Some additionnal notes here : 
             * 
             * In previous version of the directive,
             * we were using attrs.parentSelector
             * to open the modal box within a selector. 
             * 
             * This is handy in particular when opening
             * the "fancy select" from the right pane of
             * a side view. 
             * 
             * But the problem is that I had to edit ionic.bundle.js
             * and the modal component each time ionic team
             * make an update of the FW.
             * 
             * Also, seems that animations do not work 
             * anymore.
             * 
             */
            $ionicModal.fromTemplateUrl('templates/fancy-select-items.html',{
                'scope': scope,
                'animation': 'nav-title-slide-ios7'
            }).then(function(modal) {
                scope.modal = modal;
            });

            /* Validate selection from header bar */
            scope.validate = function (event) {
                // Construct selected values and selected text
                if (scope.multiSelect == true) {

                    // Clear values
                    scope.value = [];
                    scope.text = '';

                    // Loop on items
                    angular.forEach(scope.ngItems, function (item, index) {
                        if (item.checked) {
                            scope.value[scope.value.length] = item;
                            scope.text = scope.text + item.fancyTextShow+', ';
                        }
                    });

                    // Remove trailing comma
                    scope.text = scope.text.substr(0,scope.text.length - 2);
                }

                // Select first value if not nullable
                if (typeof scope.value == 'undefined' || scope.value == '' || scope.value == null ) {
                    if (scope.allowEmpty == false) {
                        scope.value = scope.ngItems[0].id;
                        scope.text = scope.ngItems[0].text;

                        // Check for multi select
                        scope.ngItems[0].checked = true;
                    } else {
                        scope.text = scope.defaultText;
                    }
                }

                // Hide modal
                scope.hideItems();
                
                // Execute callback function
                if (typeof scope.callback == 'function') {
                    scope.callback (scope.value);
                }
            }

            /* Show list */
            scope.showItems = function (event) {
                event.preventDefault();
                scope.modal.show();
            }

            /* Hide list */
            scope.hideItems = function () {
                scope.modal.hide();
            }

            /* Destroy modal */
            scope.$on('$destroy', function() {
              scope.modal.remove();
            });

            /* Validate single with data */
            scope.validateSingle = function (item) {
                if (!item.fancyIsItem) return;

                // Set selected text
                scope.text = item.fancyTextShow;

                // Set selected value
                scope.value = item.fancyValue;

                angular.forEach(scope.ngItems, function(value, key) {
                    scope.ngItems[key].fancyChecked = false;
                });
                item.fancyChecked = true;

                // Hide items
                scope.hideItems();

                // Execute callback function
                if (typeof scope.callback == 'function') {
                    scope.callback(item);
                }
            }
        }
    };
}])

.directive('fancyCalc', ['$ionicModal', function($ionicModal) {
    return {
        /* Only use as <fancy-calc> tag */
        restrict : 'E',

        /* Our template */
        templateUrl: 'templates/fancy-calc-button.html',

        /* Attributes to set */
        scope: {
            'value'     : '='
        },

        link: function (scope, element, attrs) {
            scope.calcValue = scope.value || 0;
            scope.memValue = '';
            scope.operator = '';
            scope.prevBtn = '';

            $ionicModal.fromTemplateUrl('templates/fancy-calc.html',{
                'scope': scope,
                'animation': 'nav-title-slide-ios7'
            }).then(function(modal) {
                scope.modal = modal;
            });

            /* Show list */
            scope.showCalc = function (event) {
                event.preventDefault();
                scope.calcValue = scope.value || 0;
                scope.memValue = '';
                scope.operator = '';
                scope.prevBtn = '';
                scope.modal.show();
            }

            /* Hide list */
            scope.hideCalc = function () {
                scope.modal.hide();
            }

            scope.done = function () {
                scope.value = parseInt(scope.calcValue);
                scope.modal.hide();
            }

            scope.btn = function(btn) {
                var clc = function(a, b, o) {
                    if (o == '+') return parseInt(a) + parseInt(b);
                    else if (o == '-') return parseInt(a) - parseInt(b);
                    else if (o == '*') return parseInt(a) * parseInt(b);
                    else if (o == '/') {
                        if (parseInt(a) == 0) return '#ERROR';
                        else return parseInt(a) * parseInt(b);
                    };
                };
                if (btn == '+' || btn == '-' || btn == '*' || btn == '/') {
                    scope.operator = btn;
                    if (scope.prevBtn == '+' || scope.prevBtn == '-' || scope.prevBtn == '*' || scope.prevBtn == '/') {
                        return;
                    }
                    if (scope.memValue != '') {
                        scope.calcValue = clc(scope.memValue, scope.calcValue, scope.operator);
                    }
                    scope.memValue = scope.calcValue;
                } else if (btn == '=') {
                    if (scope.memValue != '' && scope.operator != '') {
                        scope.calcValue = clc(scope.memValue, scope.calcValue, scope.operator);
                    }
                    scope.memValue = '';
                } else if (btn == 'ce') {
                    scope.calcValue = 0;
                } else if (btn == 'c') {
                    scope.calcValue = 0;
                    scope.memValue = '';
                    scope.operator = '';
                } else if (btn == '1k') {
                    scope.calcValue = parseInt(scope.calcValue) * 1000;
                } else {
                    if (scope.calcValue == 0 || scope.prevBtn == '=' || scope.prevBtn == '+' || scope.prevBtn == '-' || scope.prevBtn == '*' || scope.prevBtn == '/') {
                        scope.calcValue = '';
                    }
                    scope.calcValue += '' + btn;
                }
                scope.prevBtn = btn;
            }

            /* Destroy modal */
            scope.$on('$destroy', function() {
              scope.modal.remove();
            });
        }
    };
}])

;
