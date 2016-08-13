var React = require('react');

var FileDirectory = require('./FileDirectory.js');

var App = React.createClass({

    render: function() {
        return (
            <FileDirectory />
        )
    }
});

module.exports = App;
