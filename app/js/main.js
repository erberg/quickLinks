
window.$ = window.jQuery = require('jquery');

(function () {

  'use strict';

  require('bootstrap');
  require('angular');
  require('angular-route');
  require('angular-animate');

  var mainCtrl = require('./controllers/mainctrl');

  angular.module('SampleApp', ['ngRoute', 'ngAnimate'])

  .config([
    '$locationProvider',
    '$routeProvider',
    function($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');
      // routes
      $routeProvider
        .when("/", {
          templateUrl: "./partials/partial1.html",
          controller: "MainController"
        })
        .otherwise({
           redirectTo: '/'
        });
    }
  ])

  //Load controller
  .controller('MainController', ['$scope', '$http', 'linkFactory', '$anchorScroll', mainCtrl])

  .factory('linkFactory', function($http) {
  var promise;
  var originWithoutPort = document.location.origin.split(':').slice(0,-1).join(':');
  var AllLinks = {
      async: function(query) {
        console.log('')
          var query = query || '';
          if (!promise) {
              // $http returns a promise, which has a then function, which also returns a promise
              promise = $http.get(originWithoutPort + ':8081/api/links').then(function(response) {
                  // The then function here is an opportunity to modify the response.
                  // The return value gets picked up by the then in the controller.
                  return response.data;
              });
          }
          // Return the promise to the controller
          return promise;
      }
  };
  return AllLinks;
  }).filter("sanitize", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode + ' ');
  }
}]).filter("cleanLink", function() {
  return function(linkHtml){
      return linkHtml.toString().replace(/<b>/g,'').replace(/<\/b>/g,''); //toString() is for link array case.
  }
}).filter("splitArray", function() {
  return function(itemValue){
      return typeof itemValue === 'object' ? itemValue.join('<br>') : itemValue;
  }
});


}());
