const gulp = require('gulp');
const pump = require('pump');
const webpack = require('webpack');
const webStream = require('webpack-stream');

const gutil = require('gulp-util');
const babel = require('gulp-babel');
const less = require('gulp-less');
const watch = require('gulp-watch');

const webpack_config = require('./webpack.config.js');

const dir = {
    react: {
        src: './build/react/**/*.js',
        out: './webpack/react'
    },
    less: {
        src: './build/less/main.less',
        imp: './build/less/imports/**/*.less',
        out: './static/style'
    },
    webpack: {
        src: './webpack/main.js',
        imp: './webpack/*.js',
        out: './static/scripts'
    }
}

function handleStream(name,error) {
    if(error) {
        gutil.log(`${gutil.colors.red('ERROR')}: ${name} -> ${error.message}\n`,error.stack);
    } else {
        gutil.log(`${gutil.colors.green('COMPLETED')}: ${name}`);
    }
}

function logStart(name) {
    gutil.log(`${gutil.colors.green('STARTING')}: ${name}`);
}

function buildReact() {
    logStart('React');
    pump([
        gulp.src(dir.react.src),
        babel({
            presets: ['react']
        }),
        gulp.dest(dir.react.out)
    ],(err) => {
        handleStream('React',err)
        buildWebpack();
    });
}

function buildLess() {
    logStart('Less');
    pump([
        gulp.src(dir.less.src),
        less({
            paths: dir.less.imp
        }),
        gulp.dest(dir.less.out)
    ],(err) => handleStream('Less',err));
}

function buildWebpack() {
    logStart('Webpack');
    pump([
        gulp.src(dir.webpack.src),
        webStream(webpack_config,webpack,(err,stats) => {
            if(err) gutil.log(`${gutil.colors.red('ERROR')}: Webpack -> ${err.message}`);
            else gutil.log(`${gutil.colors.green('RESULTS')}:\n    time: ${stats.endTime - stats.startTime}ms`);
        }),
        gulp.dest(dir.webpack.out)
    ],(err) => handleStream('Webpack',err));
}

gulp.task('react',() => {
    buildReact();
});

gulp.task('less',() => {
    buildLess();
});

gulp.task('webpack',() => {
    buildWebpack();
});

gulp.task('watch-less',() => {
    return watch([dir.less.src,dir.less.imp],() => buildLess());
});

gulp.task('watch-react',() => {
    return watch([dir.react.src],() => buildReact());
});

gulp.task('watch-webpack',() => {
    return watch([dir.webpack.src,dir.webpack.imp],() => buildWebpack());
});

gulp.task('default',['react','less','webpack','watch-less','watch-react']);
