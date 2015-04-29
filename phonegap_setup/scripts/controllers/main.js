newsApp.controller('loadCtrl', ['$scope',
    function ($scope) {
		'use strict';
		$scope.$on('LOAD', function () {
			$scope.title = undefined;
			$scope.loading = true;
		});
		$scope.$on('LOADDONE', function () {
			$scope.loading = false;
		});

		$scope.$on('FETCHING', function () {
			$scope.fetching = true;
		});
		$scope.$on('FETCHDONE', function () {
			$scope.fetching = false;
		});

		$scope.$on('FUNK', function (event, data) {
			$scope.url = data.url;
			$scope.title = data.title;
			$scope.title = data.title;

			$scope.theFunk = function () {
				window.plugins.socialsharing.share(
					'Checkout this story on Golfweek.', // message
					$scope.title, // subject
					null, // image  ***adding image adds the availability to add the story to contacts on ios (weird)
					$scope.url // link
				);
			}
		});

    }]);

newsApp.controller('newsHome', ['$scope', '$routeParams', '$window', '$location', 'gw',
    function ($scope, $routeParams, $window, $location, gw) {
		'use strict';
		$scope.$emit('LOAD');

		gw.home({
			success: function (d) {
				$scope.feedData = d;
				$scope.$emit('LOADDONE');
			}
		});

		$scope.side = 'moveleft';

		$scope.sideToggle = function () {
			$scope.side = ($scope.side === 'moveleft') ? 'moveright' : 'moveleft';
		};

		$scope.route = function (route) {
			$location.path(route);
		};

		$scope.close = function () {
			$scope.side = 'moveleft';
		};

		$scope.open = function () {
			$scope.side = 'moveright';
		};

		$scope.$on('$viewContentLoaded', function () {
			$window.ga('send', 'pageview');
			//$window.ga('send', 'pageview', {'title': titler.title() });
			// ^-- we dont have the title function on this app yet
		});
    }]);

newsApp.controller('newsSection', ['$scope', '$routeParams', '$window', 'gw', 'styler',
    function ($scope, $routeParams, $window, gw, styler) {
		'use strict';

		$scope.$emit('LOAD');

		$scope.linkify = function (thing) {
			return $routeParams.section + '/' + thing.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
		};

		$scope.count = 15;

		gw.section($routeParams, {
			success: function (d) {
				styler.makeRows(d.stories);
				$scope.sectionData = d;
				$scope.$emit('LOADDONE');
			},
			count: $scope.count
		});


		$scope.refresh = function () {
			$scope.count = 15;
			if (!$scope.loading && $scope.position <= 2) {
				$scope.$emit('LOAD');
				gw.section($routeParams, {
					success: function (d) {
						styler.makeRows(d.stories);
						$scope.sectionData = d;
						$scope.$emit('LOADDONE');
					},
					count: $scope.count
				});
			}
		};

		$scope.fetching = false;

		$scope.fetchMore = function () {
			if ($scope.position >= 87 && !$scope.fetching && $scope.count < 60) {
				$scope.fetching = true;
				$scope.$emit('LOAD')
				$scope.$emit('FETCHING');
				$scope.count = ($scope.count === 60) ? 60 : $scope.count + 15;
				gw.section($routeParams, {
					success: function (d) {
						// d.stories = d.stories.slice($scope.count - 16, d.stories.length - 1);
						styler.makeRows(d.stories);
						$scope.$emit('LOADDONE');
						var less = d.stories.slice($scope.count - 15, d.stories.length);
						angular.forEach(less, function (value, key) {
							this.push(value);
						}, $scope.sectionData.stories);
						//$scope.sectionData.stories += d.stories;
						$scope.fetching = false;
					},
					count: $scope.count
				});
			}
		};

		$scope.$emit('FETCHDONE');

		$scope.$on('$viewContentLoaded', function () {
			$window.ga('send', 'pageview');
			//$window.ga('send', 'pageview', {'title': titler.title() });
			// ^-- we dont have the title function on this app yet
		});

		gw.nav($routeParams, {
			success: function (d) {
				$scope.navItems = d;
			}
		});

    }]);
angular


// newsApp.controller('rankingSection', ['$scope', '$routeParams', '$window', '$location', 'gw', '$route', '$http',

//     function ($scope, $routeParams, $window, $location, gw, $route, $http) {
// 		'use strict';

// 		$scope.$emit('LOAD');

// 		gw.rankings($routeParams, {
// 			success: function (d) {
// 				console.log(d);
// 				$scope.rankingsData = d;
// 				$scope.tour = $routeParams.tour;
// 				$scope.$emit('LOADDONE');
// 			}
// 		});

// 		$scope.$on('$viewContentLoaded', function () {
// 			$window.ga('send', 'pageview');
// 			//$window.ga('send', 'pageview', {'title': titler.title() });
// 			// ^-- we dont have the title function on this app yet
// 		});

//     }]);


newsApp.controller('leaderboardSection', ['$scope', '$routeParams', '$window', '$location', 'gw', '$route',
    function ($scope, $routeParams, $window, $location, gw, $route) {
		'use strict';

		$scope.$emit('LOAD');

		$scope.url = 'http://rankings.golfweek.com/fetchurl/assets/leaderboard_expanded_app.asp?tour=' + $routeParams.tour;

		gw.leaderboard($routeParams, {
			success: function (d) {
				//console.log(d);
				$scope.leaderboardData = d;
				$scope.$emit('LOADDONE');
			}
		});

		$scope.$on('$viewContentLoaded', function () {
			$window.ga('send', 'pageview');
			//$window.ga('send', 'pageview', {'title': titler.title() });
			// ^-- we dont have the title function on this app yet
		});

    }]);


newsApp.controller('newsStory', ['$scope', '$routeParams', '$window', '$location', 'gw', '$route',
    function ($scope, $routeParams, $window, $location, gw, $route) {
		'use strict';

		$scope.$emit('LOAD');

		$scope.url = 'http://golfweek.com/' + $location.path().replace('/story/', '');

		gw.story($routeParams, {
			success: function (d) {
				//				console.log(d);
				angular.forEach(d.body.vids, function (val, key) {
					this['vid' + (key + 1)] = 'tube-player="' + val + '"';
				}, $scope);
				$scope.body = d.body.text;
				$scope.storyData = d.other;
				$scope.title = $scope.storyData.story[0].headline;
				$scope.descr = $scope.storyData.story[0].tease;
				$scope.$emit('LOADDONE');

				$scope.theFunk = function () {
					window.plugins.socialsharing.share(
						'Checkout this story on Golfweek.', // message
						$scope.title, // subject
						null, // $scope.storyData.story[0].photourl, 			// image  ***adding image ads the availability to add the story to contacts on ios (weird)
						$scope.url // link
					);
				};


				$scope.$emit('FUNK', {
					url: $scope.url,
					title: $scope.title,
					msg: 'Checkout this story on Golfweek.'
				});
			}
		});

		$scope.$on('$viewContentLoaded', function () {
			$window.ga('send', 'pageview');
			//$window.ga('send', 'pageview', {'title': titler.title() });
			// ^-- we dont have the title function on this app yet
		});

    }]);

newsApp.controller('mediaSection', ['$scope', '$routeParams', '$window', 'gw', 'styler', '$q',
    function ($scope, $routeParams, $window, gw, styler, $q) {
		'use strict';

		$scope.$emit('LOAD');

		$scope.section = $routeParams.section;

		$scope.linkify = function (thing) {
			return $routeParams.section + '/' + thing.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
		};

		$scope.count = 15;

		gw.media($routeParams, {
			success: function (d) {
				styler.makeRows(d.stories);
				$scope.sectionData = d;
				$scope.$emit('LOADDONE');
			},
			count: $scope.count
		});

		$scope.refresh = function () {
			$scope.count = 15;
			if (!$scope.loading && $scope.position <= 2) {
				$scope.$emit('LOAD');
				gw.media($routeParams, {
					success: function (d) {
						styler.makeRows(d.stories);
						$scope.sectionData = d;
						$scope.$emit('LOADDONE');
					},
					count: $scope.count
				});
			}
		}

		$scope.fetching = false;

		$scope.fetchMore = function () {
			if ($scope.position >= 87 && !$scope.fetching && $scope.count < 60) {
				$scope.fetching = true;
				$scope.$emit('LOAD');
				$scope.$emit('FETCHING');
				$scope.count = ($scope.count === 60) ? 60 : $scope.count + 15;
				gw.media($routeParams, {
					success: function (d) {
						// d.stories = d.stories.slice($scope.count - 16, d.stories.length - 1);
						styler.makeRows(d.stories);
						$scope.$emit('LOADDONE');
						var less = d.stories.slice($scope.count - 15, d.stories.length);
						angular.forEach(less, function (value, key) {
							this.push(value);
						}, $scope.sectionData.stories);
						//$scope.sectionData.stories += d.stories;
						$scope.fetching = false;
					},
					count: $scope.count
				});
			}
		};

		$scope.$on('$viewContentLoaded', function () {
			$window.ga('send', 'pageview');
			//$window.ga('send', 'pageview', {'title': titler.title() });
			// ^-- we dont have the title function on this app yet
		});

		gw.nav($routeParams, {
			success: function (d) {
				$scope.navItems = d;
			}
		});

    }]);

newsApp.controller('galleryCtrl', ['$scope', '$routeParams', '$window', 'gw', '$q', '$location'
,
	function ($scope, $routeParams, $window, gw, $q, $location) {
		'use strict';

		$scope.$emit('LOAD');

		var def2 = $q.defer();

		var getPics = function() {
			if ($location.$$url.indexOf('videos') > 0) {
				$routeParams.section = 'videos';
			} else {
				$routeParams.section = 'photo-galleries';
			}
			gw.media($routeParams, {
				success: function (d) {
					//styler.makeRows(d.stories);
					$scope.galleryData = d;
					$scope.$emit('LOADDONE');
				}
			});
		}

		var load = function () {
			var deferred = $q.defer();
			var elem = document.createElement('div');
			$.post('http://golfweek.com' + $location.$$url).success(function (data) {
				deferred.resolve(data);
			});

			deferred.promise.then(function (d) {
				elem.innerHTML = d;
				var galID = $(elem).find('#id').attr('content');
				def2.resolve(galID);
				elem.innerHTML = '';
			});

		}


		if ($routeParams.galleryid == undefined) {
			load();
		} else {
			getPics();
		}

		def2.promise.then(function (data) {
			$routeParams.galleryid = data;
			console.log($routeParams);
			getPics();
		});



		$scope.section = $routeParams.section;

		$scope.linkify = function (thing) {
			return $routeParams.section + '/' + thing.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
		};



		$scope.$on('$viewContentLoaded', function () {
			$window.ga('send', 'pageview');
			//$window.ga('send', 'pageview', {'title': titler.title() });
			// ^-- we dont have the title function on this app yet
		});

		gw.nav($routeParams, {
			success: function (d) {
				$scope.navItems = d;
			}
		});

    }]);

newsApp.controller('favCtrl', ['fav', '$scope', '$log',
    function (fav, $scope, $log) {
		'use strict';

		fav.list({
			success: function (d) {
				$scope.sectionData = d;
				$log.log(d);
			}
		});
    }]);


function RankingController($scope, $http, $routeParams) {
	$scope.rankList = $routeParams.tour
	$scope.currentPage = 1;
	$scope.pageSize = 50;	
	$scope.listtype = 'Rankings';
	

	$scope.pageChangeHandler = function(num) {
		console.log('rankings page changed to ' + num);
	};

	$scope.$watch('rankList', function() {

		// Rankings

		if($scope.rankList == 'pro'){
			$scope.title = "Men's Professional Rankings"
			$scope.listtype = "Rankings"
		}
		if($scope.rankList == 'lpga'){
			$scope.title = "Women's Professional Rankings"
			$scope.listtype = "Rankings"
		}
		if($scope.rankList == 'girls'){
			$scope.title = "Girls Rankings"
			$scope.listtype = "Rankings"
		}
		if($scope.rankList == 'boys'){
			$scope.title = "Boys Rankings"
			$scope.listtype = "Rankings"
		}
		if($scope.rankList == 'men'){
			$scope.title = "Men's Collegiate Individual Rankings"
			$scope.listtype = "Rankings"
		}
		if($scope.rankList == 'mensteams'){
			$scope.title = "Men's Team Collegiate Rankings"
			$scope.listtype = "Rankings"
		}
		if($scope.rankList == 'women'){
			$scope.title = "Women's Collegiate Individual Rankings"
			$scope.listtype = "Rankings"
		}
		if($scope.rankList == 'womensteams'){
			$scope.title = "Women's Team Collegiate Rankings"
			$scope.listtype = "Rankings"
		}

		// Tournaments

		if($scope.rankList == 'prot'){
			$scope.title = "Men's Professional Tournaments"
			$scope.listtype = "Tournament"
		}
		if($scope.rankList == 'lpgat'){
			$scope.title = "Women's Professional Tournaments"
			$scope.listtype = "Tournament"
		}
		if($scope.rankList == 'girlst'){
			$scope.title = "Girls Tournaments"
			$scope.listtype = "Tournament"
		}
		if($scope.rankList == 'boyst'){
			$scope.title = "Boys Tournaments"
			$scope.listtype = "Tournament"
		}
		if($scope.rankList == 'ment'){
			$scope.title = "Men's Collegiate Individual Tournaments"
			$scope.listtype = "Tournament"
		}
		if($scope.rankList == 'mensteamst'){
			$scope.title = "Men's Team Collegiate Tournaments"
			$scope.listtype = "Tournament"
		}
		if($scope.rankList == 'woment'){
			$scope.title = "Women's Collegiate Individual Tournaments"
			$scope.listtype = "Tournament"
		}
		if($scope.rankList == 'womensteamst'){
			$scope.title = "Women's Team Collegiate Tournaments"
			$scope.listtype = "Tournament"
		}


		if($scope.rankList == 'boys' || $scope.rankList == 'girls'){
			$scope.colspan = 7
		} else if ($scope.rankList == 'men' || $scope.rankList == 'women') {
			$scope.colspan = 6
		} else {
			$scope.colspan = 5
		}

		$scope.rankURL = 'http://rankings.golfweek.com/rankings/json/' + $scope.rankList + '.json';
		
		$scope.q = ""
		$scope.r = ""
		$scope.s = ""
		$scope.t = ""
		

		$http.get($scope.rankURL)
		.success(function(response) {
			$scope.rankings = response;
		});
	
	});
}

function OtherController($scope) {
	$scope.pageChangeHandler = function(num) {
		console.log('Changing Page');
	};
}