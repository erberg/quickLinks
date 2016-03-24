module.exports = function($scope, $http, linkFactory, $anchorScroll) {

	var fuzzySearch = require('fuzzy');
  $scope.filteredLinks = [];
  $scope.allLinks = [];

  $scope.filterLinks = function(query) {

    // Parse is the opposite of stringify. It also leaves HTML bold tags on the matches.
    var parseFilteredLinks = function (matches) {
      var filteredLinks = [];
      for (var i = 0; i < matches.length; i++) {
            var match = JSON.parse(JSON.stringify(matches[i].original));
            var splitString = matches[i].string.split('|||');

            match.name = splitString[0];
            match.categories = splitString[1].split(':::');
            match.value = splitString[2].split(':::');

            filteredLinks.push(match);
        };
      return filteredLinks;
    }

    var options = {
        pre: '<b>',
        post: '</b>',
        extract: function(el) {   //In order for fuzzysearching to work with multiple array elems, we basically stringify them.
            var value = typeof el.value === 'object' ? el.value.join(':::') : el.value;
            var categories = typeof el.categories === 'object' ? el.categories.join(':::') : el.categories;
            return  el.name + '|||' + categories + '|||' + value;
        }
    };

    if (query) {
        var matches = fuzzySearch.filter(query.replace(/ /g,''), $scope.allLinks, options);
        $scope.filteredLinks = parseFilteredLinks(matches);
        $scope.activeLink = $scope.filteredLinks[0];
    } else {
        $scope.filteredLinks = $scope.allLinks;
    }
  };

  var getLinkById = function (array, id) {
    var result = array.filter(function( obj ) {
      return obj['_id'] == id;
    });
    return result;
  };

  var getIndexById = function (array, id) {
    var matchIndex;
    $.grep(array, function (item, index) {
      if(item['_id'] == id){
        matchIndex = index;
      }
    });
    return matchIndex;
  };

  var nextItem = function () {
    if($scope.activeLink){
      return getNextLinkItem(getCurrentIndex(), $scope.filteredLinks);
    } else {
      return getNextLinkItem(($scope.filteredLinks.length-1), $scope.filteredLinks);
    }
  };

  var getNextLinkItem = function (currentIndex, linkList) {
    if (currentIndex === ($scope.filteredLinks.length - 1)) {
        return linkList[0];
    } else {
        return linkList[currentIndex + 1];
    }
  };

  var previousItem = function () {
    if($scope.activeLink){
      return getPrevLinkItem(getCurrentIndex(), $scope.filteredLinks);
    } else {
      return getPrevLinkItem(0, $scope.filteredLinks);
    }
  };

  var getCurrentIndex = function () {
    if($scope.activeLink){ 
      return getIndexById($scope.filteredLinks, $scope.activeLink['_id']);
    } else return undefined;
  };

  var getPrevLinkItem = function (currentIndex, linkList) {
    if (currentIndex === 0) {
      return linkList[linkList.length - 1];
    } else if (currentIndex > 0) {
      return linkList[currentIndex - 1];
    }
  };

  var scrollToActiveLink = function () {
    $('#linkIndex' + getCurrentIndex()).focus();
    $('input').focus();
  };
  
  var getService = function (urlArray) {
    if(urlArray.length){
      $http.get(urlArray.pop()).then(function () {
        getService(urlArray);
        $scope.activeLink.ajaxResult = 'success';
      }, function (error) {
        $scope.activeLink.ajaxResult = 'failure';
      });
    }
  };

  $scope.performAction = function (linkItem) {
    $scope.activeLink = linkItem;
    if(linkItem.type ==='url'){
      window.open($scope.activeLink.value.toString().replace(/<b>/g,'').replace(/<\/b>/g,'')); 
    } else if(linkItem.type === 'getService'){
      getService($scope.activeLink.value.slice());
    }
  };

  $scope.keyPress = function (event) {
    if(event.keyCode == 38){
      $scope.activeLink = previousItem();
      scrollToActiveLink();
    } else if(event.keyCode == 40){
      $scope.activeLink = nextItem();
      scrollToActiveLink();
    } else if(event.keyCode == 13 && $scope.activeLink){
      $scope.performAction($scope.activeLink);
    }
  };

  $scope.initLinks = function () {
  	linkFactory.async().then(function (data) {
  		$scope.allLinks = data;
      $scope.filteredLinks = data;
  	});
  };

};
