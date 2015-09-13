/* global require */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');

// Assets for the project
var Assets = {
    main: 'jquery-handlebars.js',
    minified: 'jquery-handlebars.min.js'
};

// Clean the current directory
gulp.task('clean', function (cb) {
    del([Assets.minified], cb);
});

// Check the code meets the following standards outlined in .jshintrc
gulp.task('jshint', function () {
    return gulp.src('./' + Assets.main)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Uglify aka minify the main file
gulp.task('uglify', ['clean'], function () {
    return gulp.src('./' + Assets.main)
        .pipe(uglify({
            // See the uglify documentation for more details
            compress: {
                comparisons: true,
                conditionals: true,
                dead_code: true,
                drop_console: true,
                unsafe: true,
                unused: true
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./'));
});

// Watch for changes to the main file
gulp.task('watch', function () {
    gulp.watch('./' + Assets.main, ['jshint', 'uglify']);
});

// Register the default task
gulp.task('default', ['jshint', 'uglify']);

// 'gulp jshint' to check the syntax
// 'gulp uglify' to uglify the main file
