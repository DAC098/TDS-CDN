const retrieveFolder = require('./FS.js').retrieveFolder;
const settings = require('../settings.json');

function pad(num,places = 1) {
        var calc_array = [10,100,1000];
        var rtn = `${num}`;
        var count = 1
        for(const number of calc_array) {
            if(num < number) {
                rtn = `0${rtn}`;
            }
            if(count === places) {
                return rtn;
            }
            ++count;
        }
    }

function isoDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(),2)}Z`;
}

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
    </head>
    <body>${createDirectoryList(data)}</body>
</html>`;
}

exports.renderList = function(path) {
    var list = retrieveFolder(settings.root,path);
    return htmlBody(list);
}
