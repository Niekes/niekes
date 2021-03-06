'use strict';

var gulp        = require('gulp');
var ftp         = require('vinyl-ftp');
var sass        = require('gulp-sass');
var browserSync = require('browser-sync').create();

var baseDir     = './src/';
var rmteDir     = '/niekes.com';
var tasks       = ['html', 'scss', 'img'];

gulp.task('html', function() {
    return gulp.src(baseDir + 'index.html')
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('scss', function() {
    return gulp.src(baseDir + 'scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('img', function() {
    return gulp.src(baseDir + '/img/*.jpg')
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});


// use default task to launch Browsersync and watch JS files
gulp.task('default', tasks, function () {

    // Serve files from the root of this project
    browserSync.init({
        open: false,
        reloadOnRestart: true,
        server: {
            baseDir: './dist',
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch(baseDir + 'index.html', ['html-watch']);
    gulp.watch(baseDir + 'scss/**/*.scss', ['scss-watch']);
});

gulp.task('deploy', function(){
    gulp.start(tasks);
});

gulp.task('push', function(){

    var conn = ftp.create({
        host:     process.env.NIEKES_HOST,
        user:     process.env.NIEKES_USER,
        password: process.env.NIEKES_PASSWORD,
        parallel: 10
    });

    var globs = ['./dist/**'];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance
    return gulp.src(globs, { base: './dist/', buffer: false })
        .pipe(conn.newer(rmteDir))
        .pipe(conn.dest(rmteDir))
        .pipe(conn.clean(rmteDir + '/**', './dist', rmteDir));
});

// create a task that ensures the `html` task is complete before
// reloading browsers
gulp.task('html-watch', ['html'], function (done) {
    browserSync.reload();
    done();
});

// create a task that ensures the `scss` task is complete before
// reloading browsers
gulp.task('scss-watch', ['scss'], function (done) {
    browserSync.reload();
    done();
});
