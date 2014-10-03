var gulp = require('gulp');
var jade = require('gulp-jade');
var config = require('../config').markup;

gulp.task('markup', function() {
  return gulp.src(config.index.src)
  	.pipe(jade(config.settings))
    .pipe(gulp.dest(config.index.dest));
});