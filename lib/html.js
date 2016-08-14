const React = require('react');
const {renderToString} = require('react-dom/server');

const App = require('../webpack/react/containers/App.js');

function htmlBody(data) {
    return `
<!doctype html>
<html>
    <head>
        <title>TDS CDN</title>
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

exports.renderBody = function() {
    return htmlBody(renderToString(React.createElement(App)));
}
