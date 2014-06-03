(function (){
var app = angular.module('todoApp', [
    'ui.router',
    'ui.sortable',
    'restangular',
    'ng.django.forms'
]);


app.config(function ($stateProvider, $urlRouterProvider, RestangularProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('index', {
            url: "/",
            templateUrl: "/list",
            controller: "todoList"
        })
       .state('new', {
            url: "/new",
            templateUrl: "/add_todo",
            controller: "todoFormController"
        })
        .state('edit', {
            url: "/edit/:entry_id",
            templateUrl: function(stateParams) {
                return "/edit_todo/" + stateParams.entry_id + '/'
            },
            controller: "todoFormController"
        })
});


app.factory('TodoRestangular', function (Restangular) {
    return Restangular.withConfig(function (RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl('/api/v1');
        RestangularConfigurer.setResponseExtractor(function(response, operation, what, url) {
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


app.controller("todoFormController", ['$scope', '$state', 'Restangular', 'TodoRestangular', '$q',
    function ($scope, $state, Restangular, TodoRestangular, $q) {
        $scope.submitTodo = function (id) {

            var post_data = {
                title: $scope.entry.title,
                content: $scope.entry.content,
                due_date: $scope.entry.due_date,
                priority: $scope.entry.priority
            };

            if (id) {
                post_data['id'] = id;
                $scope.putEntry(post_data, id);
            } else {
                $scope.postEntry(post_data);
            }
        };

        $scope.postEntry = function(entry) {
            TodoRestangular.all('entries').post(entry).then(
                function (obj) {
                    // success!
                    $state.go('index');
                },

                function (obj){
                    // error!
                    //console.log(obj.data)
                }

            );
        };

        $scope.putEntry = function(entry, id) {
            TodoRestangular.one('entries', id).get().then(function(data) {
                var todo_entry = data;
                todo_entry = angular.extend(todo_entry, entry);
            console.log(todo_entry);
            todo_entry.put().then(function(obj){
                $state.go('index');
            });
            });


        };

}]);

app.controller("todoList", ['$scope', '$state', 'Restangular', 'TodoRestangular',
    function($scope, $state, Restangular, TodoRestangular, $q) {

        $scope.entriesList = {'objects': []};

        var get_entries = TodoRestangular.all('entries');

        get_entries.getList().then(function(entries) {
            $scope.entriesList = entries;
        });

        $scope.editEntry = function(id){
            $state.go('edit', {entry_id: id});
        };

        $scope.todoSortable = {
	        containment : "parent",
	        cursor : "move",
	        tolerance : "pointer",
            stop: function(event, ui) {
                var data = {'objects': []};
                data.objects = $scope.entriesList.map(function(el, idx, arr) {
                    return {
                        id: el.id,
                        order: idx,
                        due_date: el.due_date
                    }
                });
                // TODO: fix patch  - it removes some data
                get_entries.patch(data).then(function(obj){
                    // do nothing =)
                });

            }
	    };
}]);
})();