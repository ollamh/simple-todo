(function(){

    var app = angular.module('todo', [
        'ngCookies',
        'ui.date',
        'ui.sortable',
        'restangular',
        'ngRoute']);

    app.config(['$routeProvider', function($routeProvider) {

        $routeProvider.
            when('/', {
                controller: 'ListController',
                templateUrl:'list.html'
            }).
            when('/edit/:entryId', {
                controller: 'EditController',
                templateUrl:'/add_todo',
                resolve: {
                    entry: function(TodoRestangular, $route){
                        return TodoRestangular.one('entries', $route.current.params.entryId).get();
                    }
                }
            }).
            when('/new', {
                controller: 'AddController',
                templateUrl:'/add_todo'
            }).
            otherwise({redirectTo:'/'});
    }]);

    app.run(function run($http, $cookies) {
        $http.defaults.headers.post['X-CSRFToken'] = $cookies['csrftoken'];
    });

    app.controller('ListController', ['$scope', 'TodoRestangular', function($scope, TodoRestangular) {
        $scope.entries = [];

        TodoRestangular.all('entries').getList().then(function(entries) {
            $scope.entries = entries;
        });

        $scope.todoSortable = {
	        containment : "parent",
	        cursor : "move",
	        tolerance : "pointer",
            stop: function(event, ui) {
                // Should be sorting by order field (also collection update on server)
                // here, but not optimal solution, so skipped it
            }
	    };

        $scope.completeTodo = function(val) {
            val.patch();
        };

        $scope.orderDirection = true;
        $scope.orderProperty = 'order';

        $scope.ordering = function(property) {
            if ($scope.orderProperty === property) {
                $scope.orderDirection = !$scope.orderDirection;
            } else {
                $scope.orderProperty = property;
                $scope.orderDirection = true;
            }
        };


    }]);


    app.controller('AddController', ['$scope', '$location', 'TodoRestangular', function($scope, $location, TodoRestangular) {
        $scope.dateOptions = {
            changeYear: true,
            changeMonth: true,
            dateFormat: 'yy-mm-dd',
            minDate: 0
        };

        $scope.saveEntry = function() {
            TodoRestangular.all('entries').post($scope.entry).then(function(entry) {
                $location.path('/');
            });
        }

    }]);

    app.controller('EditController', ['$scope', '$location', 'TodoRestangular', 'entry', function($scope, $location, TodoRestangular, entry) {

        var original = entry;
        $scope.entry = TodoRestangular.copy(original);

        $scope.isClean = function() {
            return angular.equals(original, $scope.entry);
        }

        $scope.dateOptions = {
            changeYear: true,
            changeMonth: true,
            dateFormat: 'yy-mm-dd',
            minDate: 0
        };

        $scope.saveEntry = function() {
            $scope.entry.put().then(function() {
                $location.path('/');
            });
        };

        $scope.removeEntry = function() {
            original.remove().then(function() {
                $location.path('/');
            });
        }

    }]);


    app.factory('TodoRestangular', function (Restangular) {
    return Restangular.withConfig(function (RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl('/api/v1');
        RestangularConfigurer.addResponseInterceptor(function(response, operation, what, url) {
            var newResponse;
            // Tastypie returns object, but we need only list part
            if (operation === "getList") {
                newResponse = response.objects;
                newResponse.metadata = response.meta;
            } else {
                newResponse = response;
            }
            return newResponse;
        });
        RestangularConfigurer.setRequestSuffix('/?format=json');
    });
});

})();