/* global require */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var del = require('del');
var fs = require('fs');
var merge = require('merge2');

// See the uglify documentation for more details
var uglifySettings = {
    compress: {
        comparisons: true,
        conditionals: true,
        dead_code: true,
        drop_console: true,
        unsafe: true,
        unused: true
    }
};

// Assets for the project
var Assets = {
    main: 'jquery-handlebars.js',
    minified: 'jquery-handlebars.min.js'
};

// Clean the current directory
gulp.task('clean', function (cb) {
});

// Check the code meets the following standards outlined in .jshintrc
gulp.task('jshint', function () {
    return gulp.src('./' + Assets.main)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Uglify aka minify the main file
gulp.task('uglify', function () {
    return gulp.src('./' + Assets.main)
        .pipe(uglify(uglifySettings))
        .pipe(rename(Assets.minified))
        .pipe(gulp.dest('./'));
});

// Update version numbers based on the main file version comment
gulp.task('version', function () {
    // SemVer matching is done using (?:\d+\.){2}\d+

    var reVersion = /\n\s*\*\s+Version:\s+((?:\d+\.){2}\d+)/;
    var version = fs.readFileSync('./' + Assets.main, {
            encoding: 'utf8'
        })
        // Match is found in the 2nd element
        .match(reVersion)[1];

    var streams = merge();

    // package.json version property
    streams.add(
        gulp.src('./package.json')
        .pipe(replace(/"version":\s+"(?:\d+\.){2}\d+",/, '"version": "' + version + '",'))
        .pipe(gulp.dest('./'))
    );

    // README.md version number
    streams.add(
        gulp.src('./README.md')
        .pipe(replace(/^#\s+([\w\-]+)\s+-\s+v(?:\d+\.){2}\d+/, '# $1 - v' + version))
        .pipe(gulp.dest('./'))
    );

    return streams;
});

// Watch for changes to the main file
gulp.task('watch', function () {
    gulp.watch('./' + Assets.main, ['jshint', 'uglify']);
});

// Register the default task
gulp.task('default', ['version', 'jshint', 'uglify']);

// 'gulp jshint' to check the syntax
// 'gulp uglify' to uglify the main file
// 'gulp version' to update the version numbers based on the main file version comment
