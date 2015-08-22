var gulp = require('gulp');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var del = require('del');

gulp.task('clean', function (cb) {
    del(['jquery-handlebars.min.js'], cb);
});

gulp.task('jshint', function () {
    return gulp.src('./jquery-handlebars.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('scripts', ['clean', 'jshint'], function () {
    return gulp.src('./jquery-handlebars.js')
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
        .pipe(rename('jquery-handlebars.min.js'))
        .pipe(gulp.dest('./'))
});

gulp.task('watch', function () {
    gulp.watch('./jquery-handlebars.js', ['scripts']);
});

gulp.task('default', ['scripts']);
