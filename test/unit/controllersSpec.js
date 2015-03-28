'use strict';

/* jasmine specs for controllers go here */
describe('Budget controllers', function() {

  describe('BudgetCtrl', function(){

    beforeEach(module('starter'));

    it('should create "phones" model with 3 phones', inject(function($controller) {
      var scope = {},
          ctrl = $controller('BudgetCtrl', {$scope:scope});

      expect(scope.phones.length).toBe(3);
    }));

  });
});
