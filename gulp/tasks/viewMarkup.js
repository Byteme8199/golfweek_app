var gulp = require('gulp');
var jade = require('gulp-jade');
var config = require('../config').markup;

gulp.task('viewmarkup', function() {
  return gulp.src(config.views.src)
  	.pipe(jade(config.settings))
    .pipe(gulp.dest(config.views.dest));
});