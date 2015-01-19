angular.module('starter.directives', [])

.filter('monthName', [function() {
    return function (monthNumber) { //1 = January
        var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December' ];
        return monthNames[monthNumber - 1];
    }
}])

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

            var setItemList = function () {
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
                    scope.ngItems = scope.ngItems.sort(function(a, b){
                        keyA = a[attrs.groupField];
                        keyB = b[attrs.groupField];
                        if(keyA < keyB) return -1;
                        if(keyA > keyB) return 1;
                        return 0;
                    });
                    var pos = 0;
                    angular.forEach(groups, function(group, gindex) {
                        scope.ngItems.splice(pos, 0, {
                            fancyIsItem: false,
                            fancyTextShow: gindex,
                            fancyIconShow: null,
                            fancyChecked: false,
                            fancyDataType: 'generic',
                            fancyValue: gindex
                        });
                        pos = group.length + 1;
                    });
                }
            };

            setItemList();

            scope.$watch('ngItems', function(newValue, oldValue){
                if (oldValue == newValue) return;
                setItemList();
            });

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
            scope.value = scope.value || 0;
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
                scope.value = parseInt(Math.round(scope.calcValue));
                scope.modal.hide();
            }

            scope.btn = function(btn) {
                var clc = function(a, b, o) {
                    if (o == '+') return Number(a) + Number(b);
                    else if (o == '-') return Number(a) - Number(b);
                    else if (o == '*') return Number(a) * Number(b);
                    else if (o == '/') {
                        if (Number(a) == 0) return '#ERROR';
                        else return Number(a) / Number(b);
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
                } else if (btn == '<-') {
                    if (scope.calcValue != 0) {
                        var sNum = scope.calcValue.toString();
                        sNum = sNum.substr(0, sNum.length - 1);
                        if (sNum.length == 0) {
                            sNum = '0';
                        }
                        scope.calcValue = parseInt(sNum);
                    }
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
