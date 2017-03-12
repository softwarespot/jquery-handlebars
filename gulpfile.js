/* global require */

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var gulpIf = require('gulp-if');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var merge = require('merge2');
var pkg = require('./package.json');

// Assets for the project
var Assets = {
    main: './jquery-handlebars.js',
    minified: './jquery-handlebars.min.js',
    package: './package.json',
    readme: './README.md',
    source: './',
};

// See the uglify documentation for more details
var UglifySettings = {
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

// Check the main js file(s) meets the following standards outlined in .eslintrc
gulp.task('eslint', function esLintTask() {
    // Has ESLint fixed the file contents?
    function isFixed(file) {
        return file.eslint !== undefined && file.eslint !== null && file.eslint.fixed;
    }

    return gulp.src(Assets.main)
        .pipe(eslint({
            fix: true,
            useEslintrc: '.eslintrc',
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(isFixed, gulp.dest(Assets.source)));
});

// Uglify aka minify the main file
gulp.task('uglify', function uglifyTask() {
    return gulp.src(Assets.main)
        .pipe(uglify(UglifySettings))
        .pipe(rename(Assets.minified))
        .pipe(gulp.dest(Assets.source));
});

// Update version numbers based on the main file version comment
gulp.task('version', function versionTask() {
    // SemVer matching is done using (?:\d+\.){2}\d+

    var reVersion = /(?:(\n\s*\*\s+Version:\s+)(?:\d+\.){2}\d+)/;
    var reVersionReadMe = /(?:^#\s+([\w\-]+)\s+-\s+v(?:\d+\.){2}\d+)/;

    var streams = merge();

    // Update the main js file version number
    streams.add(
        gulp.src(Assets.main)
        .pipe(replace(reVersion, '$1' + pkg.version))
        .pipe(gulp.dest(Assets.source))
    );

    // Update the README.md version number
    streams.add(
        gulp.src(Assets.readme)
        .pipe(replace(reVersionReadMe, '# $1 - v' + pkg.version))
        .pipe(gulp.dest(Assets.source))
    );

    return streams;
});

// Watch for changes to the main file
gulp.task('watch', function watchTask() {
    gulp.watch(Assets.main, ['eslint', 'uglify']);
});

// Register the default task
gulp.task('default', ['version', 'eslint', 'uglify']);

// 'gulp eslint' to check the syntax of the main js file(s)
// 'gulp uglify' to uglify the main file
// 'gulp version' to update the version numbers based on the main file version comment
