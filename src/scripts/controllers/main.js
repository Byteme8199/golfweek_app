

newsApp.controller('loadCtrl', ['$scope', '$window',
    function ($scope, $window) {
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
					null, // $scope.storyData.story[0].photourl, 			// image  ***adding image adds the availability to add the story to contacts on ios (weird)
					$scope.url // link
				);
			}
		});

		$window.closeAd = function () {
			document.getElementById('interstitialad').style.display = 'none';
		};

		$window.showAd = function (url, width, height, src, pixel) {
			console.log(url);
			console.log(width);
			console.log(height);
			console.log(src);
			console.log(pixel);
			var adWrap = "<div id='interstitial'><div class='interstitial' align='center'><div id='interstitialclose'><div id='closebutton' onclick='window.closeAd();'></div></div><div id='interstitialad'><a href='" + url + "'><img src='" + src + "'></a></div></div></div><img src='" + pixel + "'>";
			document.getElementById('interstitialad').innerHTML = adWrap;
			document.getElementById('interstitialad').style.display = 'block';
		};

    }]);

newsApp.controller('newsHome', ['$scope', '$routeParams', '$window', '$location', 'gw', 'titler', '$timeout',
    function ($scope, $routeParams, $window, $location, gw, titler, $timeout) {
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
			$timeout(function () {
				titler.setTitle('');
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 1200);
		});
    }]);

newsApp.controller('newsSection', ['$scope', '$routeParams', '$window', 'gw', 'styler', 'titler', '$timeout',
    function ($scope, $routeParams, $window, gw, styler, titler, $timeout) {
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
			$timeout(function () {
				if ($routeParams.sub) {
					titler.setTitle(($routeParams.sub) ? 'Golfweek - ' + $routeParams.section.replace(/-/g, ' ') + ' - ' + $routeParams.sub.replace(/-/g, ' ') : 'Golfweek');
				} else {
					titler.setTitle(($routeParams.section) ? 'Golfweek - ' + $routeParams.section.replace(/-/g, ' ') : 'Golfweek');
				}
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 300);
		});

		gw.nav($routeParams, {
			success: function (d) {
				$scope.navItems = d;
			}
		});

    }]);

newsApp.controller('searchCtrl', ['$scope', '$routeParams', '$window', 'gw', '$q', '$location', 'titler', '$timeout',

	function ($scope, $routeParams, $window, gw, $q, $location, titler, $timeout) {
		'use strict';

		$scope.submit = function () {
			$window.location = "/search/" + (($scope.searchQuery == '')? '5 things' : $scope.searchQuery);
		};

		$scope.$emit('LOAD');

		gw.search($routeParams, {
			success: function (d) {
				$scope.searchData = d;
				$scope.searchQuery = $routeParams.query;
				$scope.$emit('LOADDONE');
			}
		});

		$scope.linkify = function (thing) {
			return $routeParams.section + '/' + thing.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
		};

		$scope.$on('$viewContentLoaded', function () {
			$timeout(function () {
				titler.setTitle('Golfweek Search: ' + $routeParams.query);
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 1200);
		});

		gw.nav($routeParams, {
			success: function (d) {
				$scope.navItems = d;
			}
		});

    }]);


newsApp.controller('leaderboardSection', ['$scope', '$routeParams', '$window', '$location', 'gw', '$route', 'titler', '$timeout',
    function ($scope, $routeParams, $window, $location, gw, $route, titler, $timeout) {
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
			$timeout(function () {
				titler.setTitle('Leaderboards');
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 1200);
		});

    }]);


newsApp.controller('rankingsSection', ['$scope', '$routeParams', '$window', '$location', 'gw', '$route', 'titler', '$timeout',
    function ($scope, $routeParams, $window, $location, gw, $route, titler, $timeout) {
		'use strict';

		$scope.$emit('LOAD');

		$scope.url = 'http://rankings.golfweek.com/mobile-json/' + $routeParams.tour + '.asp';
		
		//console.log($scope.url);

		gw.ranking($routeParams, {
			success: function (d) {
				//console.log(d);
				$scope.rankingData = d.rankings;
				$scope.$emit('LOADDONE');
			}
		});

		$scope.$on('$viewContentLoaded', function () {
			$timeout(function () {
				titler.setTitle('Rankings');
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 1200);
		});

    }]);


newsApp.controller('newsStory', ['$scope', '$routeParams', '$window', '$location', 'gw', '$route', 'titler', '$timeout',
    function ($scope, $routeParams, $window, $location, gw, $route, titler, $timeout) {
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
			$timeout(function () {
				titler.setTitle($scope.storyData.story[0].printhead);
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 3000);
		});

    }]);

newsApp.controller('mediaSection', ['$scope', '$routeParams', '$window', 'gw', 'styler', '$q', 'titler', '$timeout',
    function ($scope, $routeParams, $window, gw, styler, $q, titler, $timeout) {
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
			$timeout(function () {
				titler.setTitle($routeParams.section);
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 1200);
		});

		gw.nav($routeParams, {
			success: function (d) {
				$scope.navItems = d;
			}
		});

    }]);

newsApp.controller('galleryCtrl', ['$scope', '$routeParams', '$window', 'gw', '$q', '$location', 'titler', '$timeout',

	function ($scope, $routeParams, $window, gw, $q, $location, titler, $timeout) {
		'use strict';

		$scope.$emit('LOAD');


		var def2 = $q.defer();
		var def3 = $q.defer();
		var prom3 = def3.promise;

		var getPics = function () {

			if ($location.$$url.indexOf('videos') >= 0) {
				$routeParams.section = 'videos';
			} else {
				$routeParams.section = 'photo-galleries';
			}
			gw.media($routeParams, {
				success: function (d) {
					$scope.section = $routeParams.section;
					$scope.galleryData = d;
					$scope.title = d.title;
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
			getPics();
		});



		$scope.section = $routeParams.section;

		$scope.linkify = function (thing) {
			return $routeParams.section + '/' + thing.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
		};



		$scope.$on('$viewContentLoaded', function () {
			$timeout(function () {
				titler.setTitle($scope.title);
				console.log($scope.title);
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 1600);
		});

		gw.nav($routeParams, {
			success: function (d) {
				$scope.navItems = d;
			}
		});

    }]);

newsApp.controller('imageCtrl', ['$scope', '$routeParams', '$window', 'gw', '$q', '$location', 'titler', '$timeout',

	function ($scope, $routeParams, $window, gw, $q, $location, titler, $timeout) {
		'use strict';

		$scope.$emit('LOAD');

		gw.image($routeParams, {
			success: function (d) {
				$scope.section = $routeParams.section;
				$scope.imageData = d;
				$scope.photocaption = d.photocaption;
				//console.log($scope.photocaption);
				$scope.$emit('LOADDONE');
			}
		});

		$scope.linkify = function (thing) {
			return $routeParams.section + '/' + thing.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
		};

		$scope.$on('$viewContentLoaded', function () {
			$timeout(function () {
				titler.setTitle($scope.photocaption);
				console.log($scope.photocaption);
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 1200);
		});

		gw.nav($routeParams, {
			success: function (d) {
				$scope.navItems = d;
			}
		});

    }]);


newsApp.controller('galleryImageCtrl', ['$scope', '$routeParams', '$window', 'gw', '$q', '$location', 'titler', '$timeout',

	function ($scope, $routeParams, $window, gw, $q, $location, titler, $timeout) {
		'use strict';

		$scope.$emit('LOAD');

		gw.galleryimage($routeParams, {
			success: function (d) {
				$scope.section = $routeParams.section;
				$scope.galleryImageData = d;
				$scope.photocaption = d.photocaption;
				console.log($scope.photocaption);
				$scope.$emit('LOADDONE');
			}
		});

		$scope.linkify = function (thing) {
			return $routeParams.section + '/' + thing.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
		};

		$scope.$on('$viewContentLoaded', function () {
			$timeout(function () {
				titler.setTitle($scope.photocaption);
				console.log($scope.photocaption);
				$window.ga('send', 'pageview', {
					'title': titler.title()
				});
			}, 1200);
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
			}
		});
    }]);