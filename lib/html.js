const React = require('react');
const {renderToString} = require('react-dom/server');

const App = require('../webpack/react/containers/App.js');

const Login = require('../webpack/react/containers/Login.js');

function FSBody(data) {
    return `
<!doctype html>
<html>
    <head>
        <title>TDS CDN - browse</title>
        <meta charset="utf-8">
        <meta name="description" content="cdn for TDS">
        <meta name="author" content="David A Cathers">
        <meta name="keywords" content="cdn,TDS,David Cathers,David C,DAC098,dac098,o98dac">
        <link rel="stylesheet" type='text/css' href="/style/main.css">
    </head>
    <body>
        <div id="render">${data}</div>
        <script src="/scripts/built.js"></script>
    </body>
</html>`;
}

function loginBody(data) {
    return `
<!doctype html>
<html>
    <head>
        <title>TDS CDN - login</title>
        <meta charset="utf-8">
        <meta name="description" content="cdn for TDS">
        <meta name="author" content="David A Cathers">
        <meta name="keywords" content="cdn,TDS,David Cathers,David C,DAC098,dac098,o98dac">
        <link rel="stylesheet" type='text/css' href="/style/main.css">
    </head>
    <body>
        <div id="render">${data}</div>
        <script src="/scripts/loginBuilt.js"></script>
    </body>
</html>`
}

exports.renderFSBody = function() {
    return FSBody(renderToString(React.createElement(App)));
}

exports.renderLogin = function() {
    return loginBody(renderToString(React.createElement(Login)));
}
