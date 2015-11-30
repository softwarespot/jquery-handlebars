/* global require */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var fs = require('fs');
var merge = require('merge2');

// Assets for the project
var Assets = {
    main: './jquery-handlebars.js',
    minified: './jquery-handlebars.min.js',
    package: './package.json',
    readme: './README.md',
    source: './',
};

// See the uglify documentation for more details
var _uglifySettings = {
    compress: {
        comparisons: true,
        conditionals: true,
        /* jscs: disable */
        dead_code: true,
        drop_console: true,
        /* jscs: enable */
        unsafe: true,
        unused: true,
    },
};

// Check the code meets the following standards outlined in .jshintrc
gulp.task('jshint', function jsHintTask() {
    return gulp.src(Assets.main)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Uglify aka minify the main file
gulp.task('uglify', function uglifyTask() {
    return gulp.src(Assets.main)
        .pipe(uglify(_uglifySettings))
        .pipe(rename(Assets.minified))
        .pipe(gulp.dest(Assets.source));
});

// Update version numbers based on the main file version comment
gulp.task('version', function versionTask() {
    // SemVer matching is done using (?:\d+\.){2}\d+

    var VERSION_NUMBER = 1;
    var reVersion = /\n\s*\*\s+Version:\s+((?:\d+\.){2}\d+)/;
    var version = fs.readFileSync(Assets.main, {
        encoding: 'utf8',
    })

    // Match is found in the 2nd element
    .match(reVersion)[VERSION_NUMBER];

    var streams = merge();

    // package.json version property
    streams.add(
        gulp.src(Assets.package)
        .pipe(replace(/"version":\s+"(?:\d+\.){2}\d+",/, '"version": "' + version + '",'))
        .pipe(gulp.dest(Assets.source))
    );

    // README.md version number
    streams.add(
        gulp.src(Assets.readme)
        .pipe(replace(/^#\s+([\w\-]+)\s+-\s+v(?:\d+\.){2}\d+/, '# $1 - v' + version))
        .pipe(gulp.dest(Assets.source))
    );

    return streams;
});

// Watch for changes to the main file
gulp.task('watch', function watchTask() {
    gulp.watch(Assets.main, ['jshint', 'uglify']);
});

// Register the default task
gulp.task('default', ['version', 'jshint', 'uglify']);

// 'gulp jshint' to check the syntax
// 'gulp uglify' to uglify the main file
// 'gulp version' to update the version numbers based on the main file version comment
