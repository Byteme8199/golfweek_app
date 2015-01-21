var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var handleErrors = require('../util/handleErrors');
var config=require('../config').less;

gulp.task('less', ['images'], function () {
  return gulp.src(config.src)
  	.pipe(sourcemaps.init())
    .pipe(less(config.settings))
    .on('error', handleErrors)
    .pipe(sourcemaps.write())
    .pipe(minifyCSS())
    .pipe(gulp.dest(config.dest));
});