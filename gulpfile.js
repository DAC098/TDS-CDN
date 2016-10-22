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
        out: './client/style'
    },
    fs_webpack: {
        src: './webpack/fs/main.js',
        imp: ['./webpack/*.js','./webpack/fs/*.js'],
        out: './client/scripts'
    },
    login_webpack: {
        src: './webpack/login/main.js',
        imp: ['./webpack/*.js','./webpack/login/*.js'],
        out: './client/scripts'
    }
}

var initial = {
    login: true,
    fs: true
};

function handleStream(name,error) {
    if(error) {
        gutil.log(`${gutil.colors.red('ERROR')}: ${name} -> ${error.message}\n`,error.stack);
    } else {
        gutil.log(`${gutil.colors.green('COMPLETED')}: ${name}`);
    }
}

function logStart(name) {
    gutil.log(`${gutil.colors.green('STARTING')}:  ${name}`);
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
        buildWebpack('fs');
        buildWebpack('login');
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

function buildWebpack(name) {
    logStart(name+'-Webpack');
    let src = dir[name+'_webpack'].src;
    let out = dir[name+'_webpack'].out;
    pump([
        gulp.src(src),
        webStream(webpack_config[name],webpack,(err,stats) => {
            if(err) gutil.log(`${gutil.colors.red('ERROR')}: Webpack -> ${err.message}`);
            else gutil.log(`${gutil.colors.green('RESULTS')}:\n    time: ${stats.endTime - stats.startTime}ms`);
        }),
        gulp.dest(out)
    ],(err) => handleStream(name+'-Webpack',err));
}

gulp.task('react',() => {
    buildReact();
});

gulp.task('less',() => {
    buildLess();
});

gulp.task('fs-pack',() => {
    if(!initial.fs) {
        buildWebpack('fs');
    } else {
        initial.fs = false;
    }
});

gulp.task('login-pack',() => {
    if(!initial.login) {
        buildWebpack('login');
    } else {
        initial.login = true;
    }
});

gulp.task('watch-less',() => {
    return watch([dir.less.src,dir.less.imp],() => buildLess());
});

gulp.task('watch-react',() => {
    return watch([dir.react.src],() => buildReact());
});

gulp.task('watch-fs-pack',() => {
    let fs_imp = dir.fs_webpack.imp;
    return watch([dir.fs_webpack.src,...fs_imp],() => buildWebpack('fs'))
})

gulp.task('watch-login-pack',() => {
    let login_imp = dir.login_webpack.imp;
    return watch([dir.login_webpack.src,...login_imp],() => buildWebpack('login'));
});

gulp.task('default',['react','less','fs-pack','login-pack','watch-less','watch-react','watch-fs-pack','watch-login-pack']);
