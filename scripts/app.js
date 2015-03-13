var newsApp = angular.module('newsApp', [
'ngSanitize',
'ngRoute',
'hmTouchEvents'
]);

var keepthis = {};

newsApp.config(['$httpProvider',
function ($httpProvider) {
  'use strict';
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

newsApp.config(['$locationProvider',
function ($locationProvider) {

  //$locationProvider.html5Mode(true);

}]);


newsApp.config(['$routeProvider',
function ($routeProvider) {
  'use strict';
  $routeProvider
  .when('/', {
    controller: 'newsSection',
    templateUrl: 'views/section.html'
  })
  .when('/news/:section/', {
    controller: 'newsSection',
    templateUrl: 'views/section.html'
  })
  .when('/news/:section/:sub/', {
    controller: 'newsSection',
    templateUrl: 'views/section.html'
  })
  .when('/leaderboards/:tour/', {
    controller: 'leaderboardSection',
    templateUrl: 'views/leaderboards.html',
    resolve: {
      load: function ($route, $location) {
        console.log($route);
        console.log($location);
      }
    }

  })
  .when('/leaderboards/', {
    controller: 'leaderboardSection',
    templateUrl: 'views/leaderboards.html',
    resolve: {
      load: function ($location) {
        console.log($location);
        if ($location.$$url.indexOf('?ID=') > 0) {
          var path = $location.$$url.replace('?ID=', '').toLowerCase();
          $location.$$search = '';
          $location.path(path);
        } else {
          $location.path($location.$$url + 'pga/');
        }
      }
    }

  })
  .when('/section/:section/:sub/:subsub', {
    controller: 'newsSection',
    templateUrl: 'views/section.html'
  })
  .when('/news/:year/:month/:day/:slug/', {
    controller: 'newsStory',
    templateUrl: 'views/story.html'
  })

  // New routes to match GW website
  .when('/photos/galleries/:year/:month/:day/:slug/', {
    controller: 'galleryCtrl',
    templateUrl: 'views/gallery.html',
    resolve: {

    }
  })
  .when('/videos/:year/:month/:day/:galleryid/', {
    controller: 'galleryCtrl',
    templateUrl: 'views/gallery.html',
    resolve: {
      load: function ($route, $location) {

      }
    }
  })

  // Original routes
  .when('/media/:section/', {
    controller: 'mediaSection',
    templateUrl: 'views/media.html'
  })
  .when('/media/:section/:galleryid/', {
    controller: 'galleryCtrl',
    templateUrl: 'views/gallery.html'
  })
  // .when('/favorites/', {
  //   controller: 'favCtrl',
  //   templateUrl: 'views/favorites.html'
  // })
  .otherwise({
    redirectTo: '/'
  });
}]);

newsApp.factory('gw', ['$http', '$log', '$q',
function ($http, $log, $q) {
  'use strict';

  var gwurl = 'http://golfweek.com/json/',
  rurl = 'http://app.golfweek.com/ops/ops.asp',
  hurl = 'http://app.golfweek.com/ops/nav.asp';

  function urlBuild(d) {
    angular.forEach(d.sections, function (value, key) {
      if (value.url === 'photo-galleries' || value.url === 'videos') {
        d.sections[key].url = 'media/' + value.url;
      } else {
        d.sections[key].url = 'news/' + value.url;
      }
    });
    return d;
  }

  return {
    home: function (context) {
      $http.post(hurl)
      .success(function (data) {
        //$log.log(data);
        data = urlBuild(data);
        context.success(data);
      })
      .error(function (data, status) {
        $log.log(data);
        $log.log(status);
      });
    },

    leaderboard: function (leaderboardData, context) {
      $http.post('http://rankings.golfweek.com/fetchurl/assets/leaderboard_expanded_app.asp?tour=' + leaderboardData.tour)
      .success(function (data) {
        //console.log(data);
        context.success(data);
      })
      .error(function (data, status) {
        $log.log(data);
        $log.log(status);
      });
    },

    story: function (storyData, context) {

      var d1 = $q.defer();
      var d2 = $q.defer();
      var p1 = d1.promise;
      var p2 = d2.promise;

      var dFunc = function (data) {
        return data;
      };

      $http.post('http://golfweek.com/news/' +
      storyData.year + '/' + storyData.month + '/' + storyData.day + '/' +
      storyData.slug + '/?json')
      .success(function (data) {
        //$log.log(data);
        d1.resolve(data);
      })
      .error(function (data, status) {
        $log.log(data);
        $log.log(status);
      });

      $http.post('http://golfweek.com/news/' +
      storyData.year + '/' + storyData.month + '/' + storyData.day + '/' +
      storyData.slug + '/?vommit')
      .success(function (data) {
        // Parse the loaded content to look for recurring inlines that have YouTube links and replace with directive-able divs instead of iframes
        var editme = data.replace("</vommit>", "").replace("<vommit>", "");
        //						console.log(editme.split('src="//www.youtube.com/embed/'));
        editme = editme.split('src="//www.youtube.com/embed/').join('tube-player="');
        var vids = editme.split('tube-player="');
        vids.shift();
        angular.forEach(vids, function (value, key) {
          this[key] = value.substring(0, 11);
        }, vids);

        var vidsplit = editme.split('tube-player=');

        angular.forEach(vidsplit, function (val, key) {
          if (key > 0) {
            this[key] = '{{vid' + key + '}} ' + this[key].substring(13);
          }
        }, vidsplit);
        editme = vidsplit.join(' ');
        editme = editme.replace(/iframe/g, "div");
        editme = editme.replace(/frameborder="0" allowfullscreen/g, "");
        editme = editme.replace(/async src=/g, '');
        editme = editme.replace(/window.location/g, '');
        //editme = editme.replace(/<script.*>([\s\S]*)<\/script>/g, '<div></div>');
        //editme = editme.replace(/<SCRIPT.*>([\s\S]*)<\/SCRIPT>/g, '<div></div>');

        d2.resolve({
          text: editme,
          vids: vids
        });
      });

      $q.all({
        other: p1.then(dFunc),
        body: p2.then(dFunc)
      }).then(function (data) {
        context.success(data);
      });


    },
    section: function (section, context) {
      var category = (section.section === undefined) ? '' : section.section;
      category += (section.sub === undefined || section.sub === 'all') ? '' : '/' + section.sub;
      category += (section.subsub === undefined) ? '' : '&SubSub=' + section.subsub;
      context.count = (context.count === undefined) ? 15 : context.count;
      $http.post(gwurl + 'section/?Section=' + category + '&Num=' + context.count)
      .success(function (data) {
        //console.log(data);
        context.success(data);
      })
      .error(function (data, status) {
        $log.log(data);
        $log.log(status);
      });
    },
    nav: function (section, context) {
      var category = (section.section === undefined) ? '' : section.section;
      $http.post(rurl)
      .success(function (d) {
        //console.log(d);
        context.success(d[category]);
      })
      .error(function (d, stat) {
        if (d === '' || stat === 0) {
          context.error(stat);
        }
      });
    },
    media: function (section, context) {

      var mediaurl = 'http://golfweek.com/json/gallery/';

      mediaurl += (section.galleryid === undefined) ? '' : '?ID=' + section.galleryid;
      if (section.section === 'videos') {
        mediaurl = 'http://golfweek.com/json/video/';
        mediaurl += (section.galleryid === undefined) ? '' : '?ID=' + section.galleryid;
      }

      mediaurl += (context.count === undefined) ? '' : '?Num=' + context.count;

      $http.post(mediaurl)
      .success(function (d) {
        context.success(d);
      })
      .error(function (d, status) {
        $log.log(d);
        $log.log(status);
      });
    }
  };
}]);

newsApp.factory('fav', ['$window',
function ($window) {
  'use strict';
  return {
    check: function (item) {
      if ($window.localStorage.length === 0) {
        return false;
      }
      return $window.localStorage.getItem(item) !== null;
    },
    add: function (title, item) {
      $window.localStorage.setItem(title, item);
    },
    get: function (title) {
      return $window.localStorage.getItem(title);
    },
    remove: function (item) {
      $window.localStorage.removeItem(item);
    },
    list: function (context) {
      var values = [];
      angular.forEach($window.localStorage, function (value, key) {
        this.push({
          'title': key,
          'url': value
        });
      }, values);
      context.success(values);
    }
  };
}]);

newsApp.factory('styler', [

function () {
  'use strict';
  return {
    makeRows: function (stories) {
      var i;
      for (i = 0; i < stories.length; i = i + 1) {
        stories[i]['class'] = 'item' + i;
      }
    }
  };
}]);

newsApp.directive('backButton', ['$window',
function ($window) {
  'use strict';
  return {
    restrict: 'A',
    scope: {
      back: '@back'
    },
    link: function (scope, element) {
      element.bind('click', function () {
        $window.history.back();
        scope.$apply();
      });
    }
  };
}]);

newsApp.directive('favButton', ['fav', '$location', '$timeout',
function (fav, $location, $timeout) {
  // Runs during compile
  'use strict';

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {

      if (fav.check(attrs.favButton)) {
        element[0].innerHTML = '&#9733;';
      }

      $timeout(function () {
        if (fav.check(attrs.favButton)) {
          element[0].innerHTML = '&#9733;';
        }
      }, 800);

      element.bind('click', function () {
        if (!fav.check(attrs.favButton)) {
          fav.add(attrs.favButton, $location.path());
          element[0].innerHTML = '&#9733;';
        } else {
          fav.remove(attrs.favButton);
          element[0].innerHTML = '&#9734;';
        }
      });
    }
  };
}]);

newsApp.directive('tubePlayer', ['$timeout', '$window',
function ($timeout, $window) {
  'use strict';
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {

      console.log('tp');

      var width = $window.innerWidth - ($window.innerWidth * 0.1);
      width = (width > 640) ? 640 : width;
      var height = width / 1.7;

      $timeout(function () {
        element.html('<iframe id="player" type="text/html" width="' + width + '" height="' + height + '"' +
        'src="http://www.youtube.com/embed/' +
        attrs.tubePlayer + '?rel=0&hd=1&autoplay=0&modestbranding=1&showinfo=0&enablejsapi=1&origin=http://golfweek.com"' +
        'frameborder="0" allowfullscreen></iframe>')
      }, 1500);
    }
  };
}]);

newsApp.directive('scrollThing', function () {
  'use strict';
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.position = 0;
      scope.$on('LOADDONE', function (event) {
        if (attrs.media === 'true') {
          var el = document.getElementById('storyArea');
          $(el).bind('scroll', function () {
            scope.position = Math.floor((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
          });
        } else {
          element.bind('scroll', function () {
            scope.position = Math.floor((element[0].scrollTop / (element[0].scrollHeight - element[0].clientHeight)) * 100);
            //console.log(scope.position);
          });
          element[0].focus();
        }
      });
    }
  };
});

newsApp.directive('storyTest', ['$log', '$http', '$timeout', '$interpolate', '$window',
function ($log, $http, $timeout, $interpolate, $window) {
  'use strict';

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      // scope.body contains a template with brackets
      // this template must be interpolated before it can
      // be added to the page.  $interpolate is passed this
      // template along with the current scope to replace
      // bracket values with their appropriate variables
      // the result is applied as html to the selected element
      var stuff = $interpolate(scope.body)(scope);
      element.html(stuff);

      // This finds all tube player divs and inserts an
      // iframe with the proper youtube pointer found int the
      // tube-player attribute of each div
      var tubes = $('div[tube-player]');
      angular.forEach(tubes, function (val) {

        var width = $window.innerWidth - ($window.innerWidth * 0.1);
        width = (width > 640) ? 640 : width;
        var height = width / 1.7;

        var el = '<iframe id="player" type="text/html" width="' + width + '" height="' + height + '"' +
        'src="http://www.youtube.com/embed/' +
        $(val).attr('tube-player') + '?rel=0&hd=1&autoplay=0&modestbranding=1&showinfo=0&enablejsapi=1&origin=http://golfweek.com"' +
        'frameborder="0" allowfullscreen></iframe>';
        $(val).html(el);
      });

      // replace the links on all gallerys with internal pointers
      // using the mobileid attribute
      var gallerys = $('a[mobileid]');
      angular.forEach(gallerys, function (val) {
        $(val).attr('href', '#/media/photo-galleries/' + $(val).attr('mobileid'));
      });

      var photos = $('a[imageid]');
      angular.forEach(photos, function (val) {
        $(val).removeAttr('href');
      });

      // change all golfweek links to be internal pointers
      // to app pages



      var links = $('a');
      angular.forEach(links, function (val, id) {
        if (id > 15) {
          if ($(val).attr('href') && $(val).attr('href').indexOf('golfweek') > -1) {
            $(val).attr('href', $(val).attr('href').replace('http://golfweek.com', '#'));
          } else if ($(val).attr('href') && $(val).attr('href').indexOf('/media/') > -1) {
            // carry on its already ok
          } else {
            $(val).click(function (e) {
              e.preventDefault();
              var href = $(e.currentTarget).attr('href');
              window.open(href, '_blank', 'location=no,toolbar=yes');
            })
          }
        }
      });



    }
  };
}]);

newsApp.directive('story', ['$log',
function ($log) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.html(scope.story[attrs.story]);
    }
  };
}]);

newsApp.directive('related', ['$log',
function ($log) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.html(scope.related[attrs.related]);
    }
  };
}]);

newsApp.directive('section', ['$log',
function ($log) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.html(scope.section[attrs.section]);
    }
  };
}]);


newsApp.directive('gallery', ['$log',
function ($log) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch("galleryData", function () {
        element.html(scope.galleryData[attrs.gallery]);
      })
    }
  };
}]);

newsApp.directive('pic', ['$log',
function ($log) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.html(scope.pic[attrs.pic]);
    }
  };
}]);


newsApp.directive('disQus', ['$window', '$location', '$timeout',
function ($window, $location, $timeout) {

  var dqdiv = '<div id="disqus_thread"></div>';

  function startDq() {
    if (!$window.dsq){
      var timer = $timeout(function () {
        (function () {
          $window.disqus_shortname = 'golfweek';
          $window.disqus_url = 'http://www.golfweek.com' + $location.$$url; // story url

          $window.dsq = $window.document.createElement('script');
          $window.dsq.type = 'text/javascript';
          $window.dsq.async = true;
          $window.dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
          ($window.document.getElementsByTagName('head')[0] || $window.document.getElementsByTagName('body')[0]).appendChild($window.dsq);
        })();
      }, 1000);
    } else {
      DISQUS.reset({
        reload: true,
        config: function () {
          this.page.identifier = 'http://www.golfweek.com' + $location.$$url; // story url
          this.page.url = 'http://www.golfweek.com' + $location.$$url; // story url
        }
      });
    }
  }

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      $(element).html(dqdiv);
      startDq();
    }
  };
}]);


newsApp.directive('addthis', ['$window', '$location', '$timeout',
function ($window, $location, $timeout, $scope) {

  var addThisSTR = "<div class='addthis_toolbox addthis_default_style addthis_32x32_style' id='addthis-config'><a class='addthis_button_preferred_1'></a><a class='addthis_button_preferred_2'></a><a class='addthis_button_preferred_3'></a><a class='addthis_button_preferred_4'></a><a class='addthis_button_compact'></a><a class='addthis_counter addthis_bubble_style'></a></div>";

  function startAddThis() {
    if (window.addthis) {
      window.addthis = null;
      window._adr = null;
      window._atc = null;
      window._atd = null;
      window._ate = null;
      window._atr = null;
      window._atw = null;
    }
    window.addthis = null;
    var timer = $timeout(function () {
      $window.document.getElementById('addthis-config').setAttribute('addthis:url','http://golfweek.com' + $location.$$path);
      $window.document.getElementById('addthis-config').setAttribute('addthis:title',$window.document.getElementById('storyheadline').innerHTML);
      var addthis_config = {"data_track_addressbar":false};
      (function () {
        $window.addthis = $window.document.createElement('script');
        $window.addthis.type = 'text/javascript';
        $window.addthis.async = true;
        $window.addthis.src = '//s7.addthis.com/js/300/addthis_widget.js#pubid=golfweekadmin';
        ($window.document.getElementsByTagName('head')[0] || $window.document.getElementsByTagName('body')[0]).appendChild($window.addthis);
      })();
    }, 1000);
  }

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      $(element).html(addThisSTR);
      startAddThis();
    }
  };
}]);


newsApp.directive('storyadImg', ['$q', '$window',
function ($q, $window) {

  var interval;
  var deferred = $q.defer();

  function getGoogTag() {
    if (!window.googletag) {
      // creates the google ad page
      var googletag = googletag || {};
      googletag.cmd = googletag.cmd || [];
      (function () {
        var gads = document.createElement("script");
        gads.async = true;
        gads.type = "text/javascript";
        var useSSL = "https:" == document.location.protocol;
        gads.src = (useSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/gpt.js";
        var node = document.getElementsByTagName("script")[0];
        node.parentNode.insertBefore(gads, node);
      })();
    } else {
      deferred.resolve();
    }
  }

  function putAd(scope, elem) {

    interval = window.setInterval(getGoogTag, 600);

    deferred.promise.then(function () {
      window.clearInterval(interval);

      if (document.getElementsByTagName('iframe').length === 1) {
        googletag.pubads().refresh();
      } else {
        googletag.cmd.push(function () {
          var adSlot = googletag.defineSlot('/310322/a.site152.tmus/mobile_app', [320, 250], elem);
          adSlot.addService(googletag.pubads());
          googletag.enableServices();
        });

        googletag.cmd.push(function () {
          googletag.display(elem);
        });
      }

    });
  }	

  function newWindow(element, url) {

    var cover = document.createElement('div');

    var el = document.getElementById(element.parentElement.id);
    el.insertBefore(cover, el.children[0]);

    function clickThing(url) {
      var el = document.getElementById(element.parentElement.id);
      el.addEventListener('click',
      function () {
        // var href = document.getElementsByTagName('iframe')[0].contentDocument.getElementsByTagName('a')[0].getAttribute('href');
        var href = url;

        var ref = window.open(href, '_blank', 'location=no,toolbar=yes'); // use self on android blank on ios
        function closeRef(e) {
          ref.removeEventListener('exit', function () {
            ref.close();
          });
          ref.close();
        }

        ref.addEventListener('exit', closeRef);
      }, false);
    };

     var interval2;
     interval2 = window.setInterval(function () {
       if (document.getElementsByTagName('iframe').length > 0) {
         window.clearInterval(interval2);
         clickThing();
       }
     }, 600);

    clickThing(url);

  }

  return function (scope, element, attrs) {
     putAd(scope, element[0].id);

     var getRand = Math.floor((Math.random()*600)+1);
     var url = 'http://pubads.g.doubleclick.net/gampad/jump?iu=/310322/a.site152.tmus/mobile&sz=300x250&c=' + getRand;
     element.html('<a id="adclick" href="' + url + '" target="_blank"><img src="http://pubads.g.doubleclick.net/gampad/ad?iu=/310322/a.site152.tmus/mobile&sz=300x250&c=' +
                   getRand + '"></a>');
     newWindow(element[0], url);

  };
}]);


newsApp.directive('adImg', ['$q', '$window',
function ($q, $window) {

  var interval;
  var deferred = $q.defer();

  function getGoogTag() {
    if (!window.googletag) {
      // creates the google ad page
      var googletag = googletag || {};
      googletag.cmd = googletag.cmd || [];
      (function () {
        var gads = document.createElement("script");
        gads.async = true;
        gads.type = "text/javascript";
        var useSSL = "https:" == document.location.protocol;
        gads.src = (useSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/gpt.js";
        var node = document.getElementsByTagName("script")[0];
        node.parentNode.insertBefore(gads, node);
      })();
    } else {
      deferred.resolve();
    }
  }

  function putAd(scope, elem) {

    interval = window.setInterval(getGoogTag, 600);

    deferred.promise.then(function () {
      window.clearInterval(interval);

      if (document.getElementsByTagName('iframe').length === 1) {
        googletag.pubads().refresh();
      } else {
        googletag.cmd.push(function () {
          var adSlot = googletag.defineSlot('/310322/a.site152.tmus/mobile_app', [320, 50], elem);
          adSlot.addService(googletag.pubads());
          googletag.enableServices();
        });

        googletag.cmd.push(function () {
          googletag.display(elem);
        });
      }

    });
  }	

  function newWindow(element, url) {

    var cover = document.createElement('div');
    cover.style.height = '50px';
    cover.style.width = $window.innerWidth + 'px';
    cover.style.bottom = '0';
    cover.style.position = 'absolute';

    var el = document.getElementById(element.parentElement.id);
    el.insertBefore(cover, el.children[0]);

    function clickThing(url) {
      var el = document.getElementById(element.parentElement.id);
      el.addEventListener('click',
      function () {
        // var href = document.getElementsByTagName('iframe')[0].contentDocument.getElementsByTagName('a')[0].getAttribute('href');
        var href = url;

        var ref = window.open(href, '_blank', 'location=no,toolbar=yes'); // use self on android blank on ios
        function closeRef(e) {
          ref.removeEventListener('exit', function () {
            ref.close();
          });
          ref.close();
        }

        ref.addEventListener('exit', closeRef);
      }, false);
    };

     var interval2;
     interval2 = window.setInterval(function () {
       if (document.getElementsByTagName('iframe').length > 0) {
         window.clearInterval(interval2);
         clickThing();
       }
     }, 600);

    clickThing(url);

  }

  return function (scope, element, attrs) {
     putAd(scope, element[0].id);

     var getRand = Math.floor((Math.random()*600)+1);
     var url = 'http://pubads.g.doubleclick.net/gampad/jump?iu=/310322/a.site152.tmus/mobile&sz=300x50&c=' + getRand;
     element.html('<a id="adclick" href="' + url + '" target="_blank"><img src="http://pubads.g.doubleclick.net/gampad/ad?iu=/310322/a.site152.tmus/mobile&sz=300x50&c=' +
                   getRand + '"></a>');
     newWindow(element[0], url);

  };
}]);


//  Google analytics
(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
  m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-565433-31', 'app.golfweek.com');
