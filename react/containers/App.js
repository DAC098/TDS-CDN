var React = require('react');

var FileDirectory = require('./FileDirectory.js');

var App = React.createClass({

    render: function() {
        return (
            <main>
                <FileDirectory />
            </main>
        )
    }
});

module.exports = App;
