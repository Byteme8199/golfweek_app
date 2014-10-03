/*
  gulpfile.js
  ===========
  Rather than manage one giant configuration file responsible
  for creating multiple tasks, each task has been broken out into
  its own file in gulp/tasks. Any files in that directory get
  automatically required below.

  To add a new task, simply add a new task file that directory.
  gulp/tasks/default.js specifies the default set of tasks to run
  when you run `gulp`.
*/

var requireDir = require('require-dir');

// Require all tasks in gulp/tasks, including subfolders
requireDir('./gulp/tasks', { recurse: true });










// var gulp        = require('gulp'),
//     gutil       = require('gulp-util'),
//     sass        = require('gulp-sass'),
//     csso        = require('gulp-csso'),
//     uglify      = require('gulp-uglify'),
//     jade        = require('gulp-jade'),
//     concat      = require('gulp-concat'),
//     livereload  = require('gulp-livereload'), // Livereload plugin needed: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
//     tinylr      = require('tiny-lr'),
//     express     = require('express'),
//     app         = express(),
//     marked      = require('marked'), // For :markdown filter in jade
//     path        = require('path'),
//     server      = tinylr();
 
 
// // --- Basic Tasks ---
// gulp.task('css', function() {
//   return gulp.src('src/styles/*.scss')
//     .pipe( 
//       sass( { 
//         includePaths: ['src/styles'],
//         errLogToConsole: true
//       } ) )
//     .pipe( csso() )
//     .pipe( gulp.dest('dist/styles/') )
//     .pipe( livereload( server ));
// });

// gulp.task('vendor' , function() {
//   return gulp.src([''/*files go here*/])
//     .pipe( gulp.dest('dist/scripts/vendor/');
// });
 
// gulp.task('js', function() {
//   return gulp.src('src/scripts/*.js')
//     // commented out uglify till I'm sure it won't break
//     // .pipe( uglify() )
//     .pipe( concat('all.min.js'))
//     .pipe( gulp.dest('dist/scripts/'))
//     .pipe( livereload( server ));
// });
 
// gulp.task('views', function() {
//   return gulp.src('src/views/*.jade')
//     .pipe(jade({
//       pretty: true
//     }))
//     .pipe(gulp.dest('dist/views/'))
//     .pipe( livereload( server ));
// });

// gulp.task('index', function() {
//   return gulp.src('src/*.jade')
//     .pipe(jade({
//       pretty: true
//     }))
//     .pipe(gulp.dest('dist/'))
//     .pipe( livereload( server ));
// }); 

// gulp.task('express', function() {
//   app.use(require('connect-livereload')());
//   app.use(express.static(path.resolve('./dist')));
//   app.listen(1337);
//   gutil.log('Listening on port: 1337');
// });
 
// gulp.task('watch', function () {
//   server.listen(35729, function (err) {
//     if (err) {
//       return console.log(err);
//     }
 
//     gulp.watch('src/assets/stylesheets/*.scss',['css']);
 
//     gulp.watch('src/assets/js/*.js',['js']);
 
//     gulp.watch('src/*.jade',['index']);
    
//     gulp.watch('src/views/*.jade',['views']);

//   });
// });
 
// // Default Task
// gulp.task('default', ['js', 'css', 'index', 'views', 'express', 'watch']);
