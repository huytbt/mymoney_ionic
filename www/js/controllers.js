angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $stateParams, $filter, MMViewBudget, Auth) {
    Auth.requireLogin();
    var year = $stateParams.year;
    var month = $stateParams.month;
    if (!angular.isDefined(year)) {
        year = $filter('date')(new Date, 'yyyy');
    }
    if (!angular.isDefined(month)) {
        month = $filter('date')(new Date, 'M');
    }
    console.log(MMViewBudget.getBudgetsByMonth(month, year));
})

.controller('FriendsCtrl', function($scope, Friends) {
    $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
})

.controller('LoginCtrl', function($scope, $cookieStore) {
    $cookieStore.put('auth', {
        user: 'huytbt',
        pass: '6e0ff2196991e1c6abfc805d985b7abe'
    });
})

;
