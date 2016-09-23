var React = require('react');

var FileDirectory = require('./FileDirectory.js');

var App = React.createClass({
    displayName: 'App',


    render: function () {
        return React.createElement(FileDirectory, null);
    }
});

module.exports = App;