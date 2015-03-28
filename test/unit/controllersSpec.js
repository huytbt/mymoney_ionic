describe('BudgetCtrl', function(){
    var scope;//we'll use this scope in our tests
 
    //mock starter to allow us to inject our own dependencies
    beforeEach(angular.mock.module('starter', 'starter.controllers'));
    //mock the controller for the same reason and include $rootScope and $controller
    beforeEach(angular.mock.inject(function($rootScope, $controller){
        //create an empty scope
        scope = $rootScope.$new();
        //declare the controller and inject our empty scope
        $controller('BudgetCtrl', {$scope: scope});
    }));
    // tests start here
     it('should declair a function = "goBills"', function(){
        expect(typeof scope.goBills).toEqual('function');
    });
});