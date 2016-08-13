const React = require('react');
const {renderToString} = require('react-dom/server');

const App = require('../webpack/react/containers/App.js');

function createDirectoryList(array) {
    var table = '';
    var count = array.length;
    var total_size = 0;
    for(const item of array) {
        total_size += item.size;
        table += `<tr>
            <td><a href='${item.url}'>${item.name}</a></td>
            <td>${item.type}</td>
            <td>${item.size}</td>
            <td>${isoDate(item.mtime)}</td>
        </tr>`;
    }
    return `
<p>count: ${count}</p>
<p>total size(bytes): ${total_size}</p>
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Size(bytes)</th>
            <th>Modified</th>
        </tr>
    </thead>
    <tbody>
    ${table}
    </tbody>
</table>`;
}

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
        <link rel="stlyesheet" type='text/css' href="/style/main.css">
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
